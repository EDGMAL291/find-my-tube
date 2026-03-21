(function initFindMyTestModule() {
  const app = window.findMyTubeApp;
  if (!app) return;

  const refs = {
    panel: document.getElementById("clinicalWorkupPanel"),
    form: document.getElementById("clinicalWorkupForm"),
    symptomsChipList: document.getElementById("clinicalSymptomsChipList"),
    signsChipList: document.getElementById("clinicalSignsChipList"),
    concernChipList: document.getElementById("clinicalConcernChipList"),
    dobControl: document.getElementById("clinicalDobControl"),
    dobLabel: document.getElementById("clinicalDobLabel"),
    dobInput: document.getElementById("clinicalDobInput"),
    dobDisplayBtn: document.getElementById("clinicalDobDisplayBtn"),
    dobAgeValue: document.getElementById("clinicalDobAgeValue"),
    dobDateValue: document.getElementById("clinicalDobDateValue"),
    sexSelect: document.getElementById("clinicalSexSelect"),
    sexIcon: document.getElementById("clinicalSexIcon"),
    pregnancySelect: document.getElementById("clinicalPregnancySelect"),
    symptomsInput: document.getElementById("clinicalSymptomsInput"),
    signsInput: document.getElementById("clinicalSignsInput"),
    concernInput: document.getElementById("clinicalConcernInput"),
    resetBtn: document.getElementById("clinicalWorkupResetBtn"),
    status: document.getElementById("clinicalWorkupStatus"),
    results: document.getElementById("clinicalWorkupResults"),
    clearResultsBtn: document.getElementById("clearClinicalWorkupResultsBtn"),
    testList: document.getElementById("clinicalWorkupTestList")
  };

  if (!refs.form || !refs.testList) return;

  const state = {
    dataset: null,
    selectedQuickPickIds: new Set(),
    output: null,
    expandedQuickPickFields: new Set(),
    pregnancyWasAutoLocked: false,
    lastUnlockedPregnancyValue: "unknown"
  };
  const pageParams = new URLSearchParams(window.location.search);
  const isFindMyTestPage = pageParams.get("tool") === "find-my-test";
  const MIN_PREGNANCY_AGE_YEARS = 12;

  const datasetUrl = `assets/data/find-my-test-map.json?v=${app.assetVersion || "20260320n"}`;

  function escapeHtml(value) {
    if (typeof app.escapeHtml === "function") {
      return app.escapeHtml(value);
    }

    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalize(value) {
    return typeof app.normalizeForSearch === "function"
      ? app.normalizeForSearch(value)
      : String(value || "").toLowerCase().trim();
  }

  function uniqueStrings(values = []) {
    return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
  }

  function joinWithAnd(values = []) {
    const items = uniqueStrings(values);
    if (!items.length) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
  }

  function truncateText(value, maxLength = 84) {
    const text = String(value || "").trim();
    if (!text || text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 1).trim()}...`;
  }

  function formatCount(count, noun) {
    return `${count} ${noun}${count === 1 ? "" : "s"}`;
  }

  function parseDateInput(value) {
    const raw = String(value || "").trim();
    if (!raw) return null;

    const parts = raw.split("-").map((part) => Number.parseInt(part, 10));
    if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null;

    const [year, month, day] = parts;
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() !== year
      || parsed.getMonth() !== month - 1
      || parsed.getDate() !== day
    ) {
      return null;
    }

    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  function formatDateForSummary(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function formatAgeDisplay(ageDays, ageMonths) {
    if (!Number.isFinite(ageDays) || ageDays < 0) return "";
    if (ageDays <= 28) return formatCount(ageDays, "day");
    if (!Number.isFinite(ageMonths) || ageMonths < 1) return formatCount(ageDays, "day");
    if (Number.isFinite(ageMonths) && ageMonths < 24) return formatCount(ageMonths, "month");

    return formatCount(Math.floor(ageMonths / 12), "year");
  }

  function renderDobField() {
    if (!refs.dobControl || !refs.dobInput || !refs.dobDisplayBtn) return;

    const dobDetails = getDobDetails(refs.dobInput.value || "");
    const hasUsableDob = Boolean(dobDetails.value) && !dobDetails.isFuture && Boolean(dobDetails.date);

    refs.dobControl.classList.toggle("has-value", hasUsableDob);
    refs.dobControl.classList.toggle("is-empty", !hasUsableDob);

    if (!hasUsableDob) {
      if (refs.dobLabel) refs.dobLabel.textContent = "Date of birth";
      if (refs.dobAgeValue) refs.dobAgeValue.textContent = "";
      if (refs.dobAgeValue) refs.dobAgeValue.textContent = "DD / MM / YYYY";
      if (refs.dobDateValue) refs.dobDateValue.textContent = "Tap to choose date";
      return;
    }

    if (refs.dobLabel) refs.dobLabel.textContent = "Age";
    if (refs.dobAgeValue) {
      refs.dobAgeValue.textContent = dobDetails.ageDisplay
        ? `${dobDetails.ageDisplay} old`
        : "Age unavailable";
    }
    if (refs.dobDateValue) {
      refs.dobDateValue.textContent = "";
    }
  }

  function openDobEditor() {
    if (!refs.dobControl || !refs.dobInput) return;

    if (typeof refs.dobInput.showPicker === "function") {
      try {
        refs.dobInput.showPicker();
        return;
      } catch (error) {
        // Ignore unsupported programmatic picker calls and fall through.
      }
    }

    refs.dobInput.focus({ preventScroll: true });
    refs.dobInput.click();
  }

  function isPregnancyLockedByDemographics(dobDetails, sexValue) {
    if (sexValue === "male") return true;
    return Number.isFinite(dobDetails?.ageYears) && dobDetails.ageYears < MIN_PREGNANCY_AGE_YEARS;
  }

  function syncPregnancyField() {
    if (!refs.pregnancySelect) return;

    const dobDetails = getDobDetails(refs.dobInput?.value || "");
    const sexValue = refs.sexSelect?.value || "unspecified";
    const shouldLock = isPregnancyLockedByDemographics(dobDetails, sexValue);

    if (shouldLock) {
      if (!state.pregnancyWasAutoLocked) {
        state.lastUnlockedPregnancyValue = refs.pregnancySelect.value || "unknown";
      }

      refs.pregnancySelect.value = "unknown";
      refs.pregnancySelect.disabled = true;
      refs.pregnancySelect.title = sexValue === "male"
        ? "Pregnancy is not applicable when sex is male."
        : `Pregnancy is locked to not applicable below age ${MIN_PREGNANCY_AGE_YEARS}.`;
      state.pregnancyWasAutoLocked = true;
      return;
    }

    refs.pregnancySelect.disabled = false;
    refs.pregnancySelect.removeAttribute("title");

    if (state.pregnancyWasAutoLocked && refs.pregnancySelect.value === "unknown" && state.lastUnlockedPregnancyValue !== "unknown") {
      refs.pregnancySelect.value = state.lastUnlockedPregnancyValue;
    }

    state.pregnancyWasAutoLocked = false;
  }

  function getDobDetails(value) {
    const dob = parseDateInput(value);
    if (!dob) {
      return {
        value: "",
        date: null,
        isFuture: false,
        ageDays: null,
        ageMonths: null,
        ageYears: null,
        ageDisplay: "",
        summaryLabel: ""
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dob > today) {
      return {
        value: String(value || "").trim(),
        date: dob,
        isFuture: true,
        ageDays: null,
        ageMonths: null,
        ageYears: null,
        ageDisplay: "",
        summaryLabel: ""
      };
    }

    const ageDays = Math.floor((today.getTime() - dob.getTime()) / 86400000);
    let ageMonths = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    if (today.getDate() < dob.getDate()) ageMonths -= 1;
    ageMonths = Math.max(ageMonths, 0);

    const ageYears = ageDays / 365.2425;
    const ageDisplay = formatAgeDisplay(ageDays, ageMonths);
    const formattedDate = formatDateForSummary(dob);

    return {
      value: String(value || "").trim(),
      date: dob,
      isFuture: false,
      ageDays,
      ageMonths,
      ageYears,
      ageDisplay,
      summaryLabel: formattedDate
        ? `DOB ${formattedDate}${ageDisplay ? ` (${ageDisplay} old)` : ""}`
        : ""
    };
  }

  function getQuickPickById(id) {
    return state.dataset?.quickPickById?.[id] || null;
  }

  function getSelectedQuickPickLabels() {
    return Array.from(state.selectedQuickPickIds)
      .map((id) => getQuickPickById(id)?.label || "")
      .filter(Boolean);
  }

  function getSelectedQuickPickTerms() {
    return Array.from(state.selectedQuickPickIds).flatMap((id) => getQuickPickById(id)?.terms || []);
  }

  function getQuickPickField(quickPick) {
    return quickPick?.field === "signs" || quickPick?.field === "concern"
      ? quickPick.field
      : "symptoms";
  }

  function getQuickPickInput(field) {
    if (field === "signs") return refs.signsInput;
    if (field === "concern") return refs.concernInput;
    return refs.symptomsInput;
  }

  function getQuickPickList(field) {
    if (field === "signs") return refs.signsChipList;
    if (field === "concern") return refs.concernChipList;
    return refs.symptomsChipList;
  }

  function getQuickPickFieldLabel(field) {
    if (field === "signs") return "signs";
    if (field === "concern") return "concerns";
    return "symptoms";
  }

  function getQuickPickText(quickPick) {
    return String(quickPick?.insertText || quickPick?.label || "").trim();
  }

  function getQuickPickTokens(value) {
    return uniqueStrings(String(value || "").split(/\s*,\s*/));
  }

  function appendQuickPickText(input, text) {
    if (!input || !text) return;

    const currentParts = getQuickPickTokens(input.value);
    const hasText = currentParts.some((part) => normalize(part) === normalize(text));
    if (hasText) return;

    currentParts.push(text);
    input.value = currentParts.join(", ");
  }

  function removeQuickPickText(input, text) {
    if (!input || !text) return;

    const nextParts = getQuickPickTokens(input.value)
      .filter((part) => part && normalize(part) !== normalize(text));

    input.value = nextParts.join(", ");
  }

  function syncQuickPickSelectionFromInputs() {
    const nextSelectedIds = new Set();

    (state.dataset?.quickPicks || []).forEach((quickPick) => {
      const input = getQuickPickInput(getQuickPickField(quickPick));
      const text = getQuickPickText(quickPick);
      if (input && text && getQuickPickTokens(input.value).some((part) => normalize(part) === normalize(text))) {
        nextSelectedIds.add(quickPick.id);
      }
    });

    const hasChanged = nextSelectedIds.size !== state.selectedQuickPickIds.size
      || Array.from(nextSelectedIds).some((id) => !state.selectedQuickPickIds.has(id));

    state.selectedQuickPickIds = nextSelectedIds;
    if (hasChanged) {
      state.expandedQuickPickFields.clear();
      renderQuickPicks();
    }
  }

  function setStatus(message = "") {
    if (!refs.status) return;
    refs.status.textContent = String(message || "").trim();
  }

  function getFieldQuickPicks(field) {
    return (state.dataset?.quickPicks || []).filter((quickPick) => getQuickPickField(quickPick) === field);
  }

  function getFocusedQuickPicksForField(field, fieldQuickPicks) {
    const selectedGlobalIds = Array.from(state.selectedQuickPickIds);
    if (!selectedGlobalIds.length) {
      return {
        focusedIds: new Set(),
        relatedIds: new Set(),
        hiddenCount: 0,
        hasFocus: false
      };
    }

    const selectedFieldIds = new Set(
      fieldQuickPicks
        .filter((quickPick) => state.selectedQuickPickIds.has(quickPick.id))
        .map((quickPick) => quickPick.id)
    );
    const relatedIds = new Set();

    selectedGlobalIds.forEach((quickPickId) => {
      const quickPick = getQuickPickById(quickPickId);
      (quickPick?.related || []).forEach((relatedId) => {
        const relatedQuickPick = getQuickPickById(relatedId);
        if (!relatedQuickPick) return;
        if (getQuickPickField(relatedQuickPick) !== field) return;
        relatedIds.add(relatedId);
      });
    });

    const focusedIds = new Set([...selectedFieldIds, ...relatedIds]);
    if (!focusedIds.size) {
      return {
        focusedIds,
        relatedIds,
        hiddenCount: 0,
        hasFocus: false
      };
    }

    return {
      focusedIds,
      relatedIds,
      hiddenCount: Math.max(fieldQuickPicks.length - focusedIds.size, 0),
      hasFocus: true
    };
  }

  function orderQuickPicks(fieldQuickPicks, selectedIds = new Set(), relatedIds = new Set()) {
    return fieldQuickPicks
      .slice()
      .sort((a, b) => {
        const rankA = selectedIds.has(a.id) ? 0 : relatedIds.has(a.id) ? 1 : 2;
        const rankB = selectedIds.has(b.id) ? 0 : relatedIds.has(b.id) ? 1 : 2;
        if (rankA !== rankB) return rankA - rankB;
        return a.label.localeCompare(b.label);
      });
  }

  function renderQuickPicks() {
    ["symptoms", "signs", "concern"].forEach((field) => {
      const list = getQuickPickList(field);
      if (!list) return;

      const fieldQuickPicks = getFieldQuickPicks(field);
      const { focusedIds, relatedIds, hiddenCount, hasFocus } = getFocusedQuickPicksForField(field, fieldQuickPicks);
      const isExpanded = state.expandedQuickPickFields.has(field);
      const selectedIds = new Set(
        fieldQuickPicks
          .filter((quickPick) => state.selectedQuickPickIds.has(quickPick.id))
          .map((quickPick) => quickPick.id)
      );

      const visibleQuickPicks = orderQuickPicks(
        isExpanded || !hasFocus
          ? fieldQuickPicks
          : fieldQuickPicks.filter((quickPick) => focusedIds.has(quickPick.id)),
        selectedIds,
        relatedIds
      );

      const actionMarkup = hasFocus && hiddenCount > 0
        ? `
          <button
            type="button"
            class="clinical-workup-chip clinical-workup-chip-secondary"
            data-find-my-test-chip-action="${isExpanded ? "collapse" : "expand"}"
            data-find-my-test-chip-field="${field}"
          >
            ${escapeHtml(isExpanded ? "Focus related" : `Show all ${getQuickPickFieldLabel(field)}`)}
          </button>
        `
        : "";

      list.innerHTML = visibleQuickPicks
        .map((quickPick) => `
          <button
            type="button"
            class="clinical-workup-chip${state.selectedQuickPickIds.has(quickPick.id) ? " active" : ""}"
            data-find-my-test-chip="${escapeHtml(quickPick.id)}"
            aria-pressed="${state.selectedQuickPickIds.has(quickPick.id) ? "true" : "false"}"
          >
            ${escapeHtml(quickPick.label)}
          </button>
        `)
        .join("") + actionMarkup;
    });
  }

  function clearInputs() {
    state.selectedQuickPickIds.clear();
    state.expandedQuickPickFields.clear();
    state.pregnancyWasAutoLocked = false;
    state.lastUnlockedPregnancyValue = "unknown";
    if (refs.dobInput) refs.dobInput.value = "";
    if (refs.sexSelect) refs.sexSelect.value = "unspecified";
    if (refs.pregnancySelect) refs.pregnancySelect.value = "unknown";
    if (refs.symptomsInput) refs.symptomsInput.value = "";
    if (refs.signsInput) refs.signsInput.value = "";
    if (refs.concernInput) refs.concernInput.value = "";
    renderDobField();
    syncPregnancyField();
    renderQuickPicks();
  }

  function clearSelectionUi() {
    if (refs.testList) {
      refs.testList.innerHTML = "";
    }
  }

  function getInput() {
    const dobDetails = getDobDetails(refs.dobInput?.value || "");
    const symptoms = String(refs.symptomsInput?.value || "").trim();
    const signs = String(refs.signsInput?.value || "").trim();
    const concern = String(refs.concernInput?.value || "").trim();
    const pregnancy = refs.pregnancySelect?.value || "unknown";
    const selectedQuickPickTerms = getSelectedQuickPickTerms();
    const selectedQuickPickLabels = getSelectedQuickPickLabels();
    const contextTerms = pregnancy === "pregnant" ? ["pregnancy"] : [];
    const normalizedBlob = normalize([
      symptoms,
      signs,
      concern,
      ...selectedQuickPickTerms,
      ...contextTerms
    ].join(" "));

    return {
      dob: dobDetails.value,
      dobDate: dobDetails.date,
      dobSummaryLabel: dobDetails.summaryLabel,
      ageDays: dobDetails.ageDays,
      ageMonths: dobDetails.ageMonths,
      ageYears: dobDetails.ageYears,
      ageDisplay: dobDetails.ageDisplay,
      hasFutureDob: dobDetails.isFuture,
      sex: refs.sexSelect?.value || "unspecified",
      pregnancy,
      symptoms,
      signs,
      concern,
      selectedQuickPickLabels,
      normalizedBlob
    };
  }

  function formatSexLabel(value) {
    if (value === "female") return "Female";
    if (value === "male") return "Male";
    if (value === "other") return "Other";
    return "";
  }

  function syncSexIcon() {
    if (!refs.sexIcon) return;

    const sexValue = refs.sexSelect?.value || "unspecified";
    refs.sexIcon.textContent = sexValue === "female"
      ? "♀"
      : sexValue === "male"
        ? "♂"
        : sexValue === "other"
          ? "⚧"
          : "⚥";
  }

  function hasNormalizedPhrase(haystack, phrase) {
    const normalizedHaystack = normalize(haystack);
    const normalizedPhrase = normalize(phrase);
    if (!normalizedHaystack || !normalizedPhrase) return false;
    if (normalizedHaystack === normalizedPhrase) return true;
    const pattern = new RegExp(`(?:^| )${escapeRegExp(normalizedPhrase)}(?:$| )`);
    return pattern.test(normalizedHaystack);
  }

  function hasPregnancyContext(input) {
    if (!input) return false;

    return input.pregnancy === "pregnant"
      || hasNormalizedPhrase(input.normalizedBlob, "pregnancy")
      || hasNormalizedPhrase(input.normalizedBlob, "pregnant")
      || hasNormalizedPhrase(input.normalizedBlob, "antenatal")
      || hasNormalizedPhrase(input.normalizedBlob, "prenatal")
      || hasNormalizedPhrase(input.normalizedBlob, "gestational");
  }

  function passesDemographics(presentation, input) {
    const demographics = presentation.demographics || {};

    if (demographics.minAge != null && input.ageYears != null && input.ageYears < demographics.minAge) return false;
    if (demographics.maxAge != null && input.ageYears != null && input.ageYears > demographics.maxAge) return false;
    if (demographics.minAgeDays != null && input.ageDays != null && input.ageDays < demographics.minAgeDays) return false;
    if (demographics.maxAgeDays != null && input.ageDays != null && input.ageDays > demographics.maxAgeDays) return false;

    if (Array.isArray(demographics.sexes) && demographics.sexes.length) {
      if (!input.sex || input.sex === "unspecified") {
        if (demographics.allowUnspecifiedSex === false) return false;
      } else if (!demographics.sexes.includes(input.sex)) {
        return false;
      }
    }

    if (demographics.pregnancy === "pregnant" && !hasPregnancyContext(input)) return false;
    if (demographics.pregnancy === "not-pregnant" && hasPregnancyContext(input)) return false;

    return true;
  }

  function evaluatePresentation(presentation, input) {
    if (!passesDemographics(presentation, input)) return null;

    const matchedSignals = [];
    const match = presentation.match || {};
    const anyTerms = Array.isArray(match.any) ? match.any : [];
    const ageConditionalAny = Array.isArray(match.ageConditionalAny) ? match.ageConditionalAny : [];
    const allGroups = Array.isArray(match.allGroups) ? match.allGroups : [];

    if (anyTerms.length) {
      anyTerms.forEach((term) => {
        if (hasNormalizedPhrase(input.normalizedBlob, term)) {
          matchedSignals.push(term);
        }
      });
      if (!matchedSignals.length) return null;
    }

    if (allGroups.length) {
      for (const group of allGroups) {
        const matchedTerm = (Array.isArray(group) ? group : []).find((term) => hasNormalizedPhrase(input.normalizedBlob, term));
        if (!matchedTerm) return null;
        matchedSignals.push(matchedTerm);
      }
    }

    if (ageConditionalAny.length) {
      for (const conditionalGroup of ageConditionalAny) {
        const minAgeDays = Number.isFinite(conditionalGroup?.minAgeDays) ? conditionalGroup.minAgeDays : null;
        const maxAgeDays = Number.isFinite(conditionalGroup?.maxAgeDays) ? conditionalGroup.maxAgeDays : null;
        const appliesByAgeDays = input.ageDays != null
          && (minAgeDays == null || input.ageDays >= minAgeDays)
          && (maxAgeDays == null || input.ageDays <= maxAgeDays);

        if (!appliesByAgeDays) continue;

        const conditionalTerms = Array.isArray(conditionalGroup?.terms) ? conditionalGroup.terms : [];
        const matchedConditionalTerm = conditionalTerms.find((term) => hasNormalizedPhrase(input.normalizedBlob, term));
        if (!matchedConditionalTerm) return null;
        matchedSignals.push(matchedConditionalTerm);
      }
    }

    if (!matchedSignals.length) return null;

    return {
      ...presentation,
      matchedSignals: uniqueStrings(matchedSignals),
      score: uniqueStrings(matchedSignals).length + allGroups.length
    };
  }

  function getTubeLabel(test, tubeHints = []) {
    const tubeGroups = typeof app.getTubeGroups === "function"
      ? app.getTubeGroups(test?.tubeColor || "")
      : [];
    if (tubeGroups.length) return tubeGroups.join(" / ");

    const fallback = uniqueStrings([
      ...tubeHints,
      String(test?.tubeColor || "").trim()
    ]);

    return fallback[0] || "Manual review";
  }

  function buildTags(input, matchedPresentations, suggestedTests) {
    const tags = [];

    if (input.ageDisplay) tags.push(`${input.ageDisplay} old`);
    if (formatSexLabel(input.sex)) tags.push(formatSexLabel(input.sex));
    if (input.pregnancy === "pregnant") tags.push("Pregnancy context");
    tags.push(...input.selectedQuickPickLabels);
    if (matchedPresentations.length) tags.push(formatCount(matchedPresentations.length, "matched presentation"));
    if (suggestedTests.length) tags.push(formatCount(suggestedTests.length, "suggested test"));

    return uniqueStrings(tags).slice(0, 8);
  }

  function buildSummary(input, matchedPresentations, suggestedTests) {
    const summaryParts = [];

    if (input.dobSummaryLabel) summaryParts.push(input.dobSummaryLabel);
    if (formatSexLabel(input.sex)) summaryParts.push(formatSexLabel(input.sex).toLowerCase());
    if (input.pregnancy === "pregnant") summaryParts.push("pregnancy context");
    if (input.symptoms) summaryParts.push(`symptoms "${truncateText(input.symptoms)}"`);
    if (input.signs) summaryParts.push(`signs "${truncateText(input.signs)}"`);
    if (input.concern) summaryParts.push(`concern "${truncateText(input.concern, 64)}"`);

    const intro = summaryParts.length
      ? `Based on ${joinWithAnd(summaryParts)}, `
      : "";

    if (suggestedTests.length) {
      const matchedCount = matchedPresentations.length
        ? `${formatCount(matchedPresentations.length, "matched presentation")} found in the dataset. `
        : "";
      return `${intro}${matchedCount}Select the most relevant tests below to preview the draw plan and send them into Tube Plan.`;
    }

    return `${intro}there is not a strong direct match in the current catalogue yet. Add a more specific symptom, sign, or concern, or use the main search by test name.`;
  }

  function buildOutput(input) {
    const matchedPresentations = (state.dataset?.presentations || [])
      .map((presentation) => evaluatePresentation(presentation, input))
      .filter(Boolean)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.label.localeCompare(b.label);
      });

    const suggestionMap = new Map();

    matchedPresentations.forEach((presentation) => {
      (presentation.tests || []).forEach((testEntry) => {
        if (!testEntry?.name) return;

        const existingEntry = suggestionMap.get(testEntry.name) || {
          name: testEntry.name,
          reasons: [],
          matchedBy: [],
          tubeHints: []
        };

        existingEntry.reasons.push(testEntry.reason || presentation.summary || "");
        existingEntry.matchedBy.push(presentation.label);
        existingEntry.tubeHints.push(...(Array.isArray(testEntry.tubeHints) ? testEntry.tubeHints : []));
        suggestionMap.set(testEntry.name, existingEntry);
      });
    });

    const suggestedNames = Array.from(suggestionMap.keys());
    const resolvedTests = typeof app.getTestsByNames === "function"
      ? app.getTestsByNames(suggestedNames)
      : [];
    const resolvedByName = new Map(resolvedTests.map((test) => [test.name, test]));

    const suggestedTests = suggestedNames
      .map((name) => {
        const suggestion = suggestionMap.get(name);
        const resolvedTest = resolvedByName.get(name);
        if (!suggestion || !resolvedTest) return null;

        return {
          name,
          test: resolvedTest,
          reasons: uniqueStrings(suggestion.reasons),
          matchedBy: uniqueStrings(suggestion.matchedBy),
          tubeHints: uniqueStrings(suggestion.tubeHints),
          tubeLabel: getTubeLabel(resolvedTest, suggestion.tubeHints)
        };
      })
      .filter(Boolean);

    return {
      modeLabel: state.dataset?.sourceLabel || "Find My Test",
      resultsTitle: suggestedTests.length ? "Suggested tests" : "No strong match yet",
      emptyStateLabel: "Next Step",
      emptyStateTitle: "Refine the presentation",
      emptyStateCopy: "Add a more specific symptom, sign, or clinical concern, or switch to the main search by test name or condition.",
      input,
      summary: buildSummary(input, matchedPresentations, suggestedTests),
      tags: buildTags(input, matchedPresentations, suggestedTests),
      tests: suggestedTests.map((item) => item.test),
      suggestedTests,
      matchedRules: matchedPresentations.map((presentation) => ({
        label: "Matched presentation",
        title: presentation.label,
        rationale: presentation.summary || "Matched to the current Find My Test dataset.",
        tests: (presentation.tests || []).map((test) => test.name).filter(Boolean),
        caution: presentation.caution || "",
        matchedSignals: presentation.matchedSignals || []
      }))
    };
  }

  function renderSuggestedTests() {
    const suggestedTests = state.output?.suggestedTests || [];
    const activePlanSelection = new Set(
      typeof app.getSelectedTestNames === "function"
        ? app.getSelectedTestNames()
        : []
    );

    refs.testList.innerHTML = suggestedTests
      .map((item) => {
        const isChecked = activePlanSelection.has(item.name);
        const alreadyInPlan = activePlanSelection.has(item.name);
        const detailLine = uniqueStrings([
          item.reasons[0] || item.test.clinicalUse || item.test.notes || "",
          item.matchedBy.length ? `Matched from ${item.matchedBy.slice(0, 2).join(" and ")}` : "",
          alreadyInPlan ? "Added to Tube Plan" : ""
        ]).join(". ");

        return `
          <label class="clinical-workup-test-option${isChecked ? " is-selected" : ""}">
            <input
              type="checkbox"
              data-find-my-test-option="${escapeHtml(item.name)}"
              ${isChecked ? "checked" : ""}
            />
            <div class="clinical-workup-test-copy">
              <div class="clinical-workup-test-head">
                <p class="clinical-workup-test-name">${escapeHtml(item.name)}</p>
                <span class="clinical-workup-test-tube">${escapeHtml(item.tubeLabel)}</span>
              </div>
              <p class="clinical-workup-test-summary">${escapeHtml(item.test.clinicalUse || item.test.notes || item.test.specimen || "Suggested from the current catalogue.")}</p>
              <p class="clinical-workup-test-reason">${escapeHtml(detailLine)}</p>
            </div>
          </label>
        `;
      })
      .join("");
  }

  function renderOutput(output) {
    state.output = output;

    if (!output) {
      clearSelectionUi();
      return;
    }

    renderSuggestedTests();
  }

  function applyOutput(output) {
    if (typeof app.setFindMyTestSuggestions === "function") {
      app.setFindMyTestSuggestions(output);
    }
    renderOutput(output);
  }

  function scrollToResults() {
    const target = refs.results && !refs.results.hidden
      ? refs.results
      : refs.panel;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.requestAnimationFrame(() => {
      target?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  }

  function clearFindMyTestUi({ clearInputsToo = false, clearStatusToo = false } = {}) {
    state.output = null;
    clearSelectionUi();

    if (clearInputsToo) {
      clearInputs();
    }

    if (clearStatusToo) {
      setStatus("");
    }

    if (typeof app.clearFindMyTestSuggestions === "function") {
      app.clearFindMyTestSuggestions({
        preserveInputs: true,
        rerenderCards: true,
        clearStatus: clearStatusToo
      });
    }
  }

  function runFindMyTest() {
    if (!state.dataset) {
      setStatus("Find My Test is still loading. Please try again in a moment.");
      return;
    }

    const input = getInput();
    if (input.hasFutureDob) {
      setStatus("Date of birth cannot be in the future.");
      refs.dobInput?.focus();
      return;
    }

    if (!input.normalizedBlob) {
      clearSelectionUi();
      if (typeof app.clearFindMyTestSuggestions === "function") {
        app.clearFindMyTestSuggestions({
          preserveInputs: true,
          rerenderCards: true,
          clearStatus: false
        });
      }
      setStatus("Add at least one symptom, sign, or clinical concern to suggest tests.");
      refs.symptomsInput?.focus();
      return;
    }

    if (typeof app.prepareFindMyTestResultsView === "function") {
      app.prepareFindMyTestResultsView();
    }

    const output = buildOutput(input);
    applyOutput(output);
    setStatus(
      output.tests.length
        ? `${formatCount(output.tests.length, "suggested test")} ready to add to Tube Plan.`
        : "No strong direct match yet. Try adding a more specific symptom, sign, or concern."
    );
    scrollToResults();
  }

  function hydrateDataset(rawDataset) {
    const quickPicks = Array.isArray(rawDataset?.quickPicks)
      ? rawDataset.quickPicks.map((quickPick) => ({
          id: String(quickPick.id || "").trim(),
          label: String(quickPick.label || "").trim(),
          field: String(quickPick.field || "symptoms").trim().toLowerCase(),
          insertText: String(quickPick.insertText || quickPick.label || "").trim(),
          related: uniqueStrings(quickPick.related || []),
          terms: uniqueStrings(quickPick.terms || [])
        })).filter((quickPick) => quickPick.id && quickPick.label)
      : [];
    const knownQuickPickIds = new Set(quickPicks.map((quickPick) => quickPick.id));
    quickPicks.forEach((quickPick) => {
      quickPick.related = quickPick.related.filter((relatedId) => relatedId !== quickPick.id && knownQuickPickIds.has(relatedId));
    });

    const knownTestNames = new Set();
    const rawPresentations = Array.isArray(rawDataset?.presentations)
      ? rawDataset.presentations
      : [];
    const flattenedTestNames = rawPresentations.flatMap((presentation) => (presentation.tests || []).map((test) => test.name));
    (typeof app.getTestsByNames === "function" ? app.getTestsByNames(flattenedTestNames) : [])
      .forEach((test) => knownTestNames.add(test.name));

    const presentations = rawPresentations
      .map((presentation) => ({
        id: String(presentation.id || "").trim(),
        label: String(presentation.label || "").trim(),
        summary: String(presentation.summary || "").trim(),
        caution: String(presentation.caution || "").trim(),
        match: {
          any: uniqueStrings(presentation.match?.any || []),
          ageConditionalAny: Array.isArray(presentation.match?.ageConditionalAny)
            ? presentation.match.ageConditionalAny
              .map((group) => ({
                minAgeDays: Number.isFinite(group?.minAgeDays) ? group.minAgeDays : null,
                maxAgeDays: Number.isFinite(group?.maxAgeDays) ? group.maxAgeDays : null,
                terms: uniqueStrings(group?.terms || [])
              }))
              .filter((group) => group.terms.length)
            : [],
          allGroups: Array.isArray(presentation.match?.allGroups)
            ? presentation.match.allGroups.map((group) => uniqueStrings(group || [])).filter((group) => group.length)
            : []
        },
        demographics: {
          sexes: uniqueStrings(presentation.demographics?.sexes || []),
          allowUnspecifiedSex: presentation.demographics?.allowUnspecifiedSex !== false,
          minAge: Number.isFinite(presentation.demographics?.minAge) ? presentation.demographics.minAge : null,
          maxAge: Number.isFinite(presentation.demographics?.maxAge) ? presentation.demographics.maxAge : null,
          minAgeDays: Number.isFinite(presentation.demographics?.minAgeDays) ? presentation.demographics.minAgeDays : null,
          maxAgeDays: Number.isFinite(presentation.demographics?.maxAgeDays) ? presentation.demographics.maxAgeDays : null,
          pregnancy: String(presentation.demographics?.pregnancy || "any").trim() || "any"
        },
        tests: (presentation.tests || [])
          .map((test) => ({
            name: String(test.name || "").trim(),
            reason: String(test.reason || "").trim(),
            tubeHints: uniqueStrings(test.tubeHints || [])
          }))
          .filter((test) => test.name && knownTestNames.has(test.name))
      }))
      .filter((presentation) => presentation.id && presentation.label && presentation.tests.length);

    return {
      version: String(rawDataset?.version || "").trim(),
      sourceLabel: String(rawDataset?.sourceLabel || "Find My Test").trim(),
      disclaimer: String(rawDataset?.disclaimer || "").trim(),
      quickPicks,
      quickPickById: Object.fromEntries(quickPicks.map((quickPick) => [quickPick.id, quickPick])),
      presentations
    };
  }

  function bindEvents() {
    [
      refs.symptomsChipList,
      refs.signsChipList,
      refs.concernChipList
    ].forEach((chipList) => {
      chipList?.addEventListener("click", (event) => {
        const actionButton = event.target.closest("[data-find-my-test-chip-action]");
        if (actionButton) {
          const field = actionButton.getAttribute("data-find-my-test-chip-field") || "";
          const action = actionButton.getAttribute("data-find-my-test-chip-action") || "";
          if (field) {
            if (action === "expand") {
              state.expandedQuickPickFields.add(field);
            } else if (action === "collapse") {
              state.expandedQuickPickFields.delete(field);
            }
            renderQuickPicks();
          }
          return;
        }

        const button = event.target.closest("[data-find-my-test-chip]");
        if (!button) return;

        const quickPickId = button.getAttribute("data-find-my-test-chip") || "";
        const quickPick = getQuickPickById(quickPickId);
        if (!quickPick) return;

        const input = getQuickPickInput(getQuickPickField(quickPick));
        const text = getQuickPickText(quickPick);
        if (!input || !text) return;

        if (state.selectedQuickPickIds.has(quickPickId)) {
          removeQuickPickText(input, text);
        } else {
          appendQuickPickText(input, text);
        }

        syncQuickPickSelectionFromInputs();
        setStatus("");
      });
    });

    refs.form.addEventListener("submit", (event) => {
      event.preventDefault();
      runFindMyTest();
    });

    refs.resetBtn?.addEventListener("click", () => {
      clearFindMyTestUi({ clearInputsToo: true, clearStatusToo: true });
    });

    refs.clearResultsBtn?.addEventListener("click", () => {
      clearFindMyTestUi({ clearInputsToo: false, clearStatusToo: true });
    });

    refs.testList.addEventListener("change", (event) => {
      const checkbox = event.target.closest("[data-find-my-test-option]");
      if (!checkbox) return;

      const testName = checkbox.getAttribute("data-find-my-test-option") || "";
      if (!testName) return;

      if (checkbox.checked) {
        if (typeof app.addTestsToPlan === "function") {
          app.addTestsToPlan([testName], {
            replace: false
          });
        }
        setStatus(`${testName} added to Tube Plan.`);
      } else {
        if (typeof app.removeTestsFromPlan === "function") {
          app.removeTestsFromPlan([testName]);
        }
        setStatus(`${testName} removed from Tube Plan.`);
      }

      renderSuggestedTests();
    });

    [
      refs.dobInput,
      refs.sexSelect,
      refs.pregnancySelect,
      refs.symptomsInput,
      refs.signsInput,
      refs.concernInput
    ].forEach((field) => {
      field?.addEventListener("input", () => {
        if (field === refs.dobInput) {
          renderDobField();
        }
        if (field === refs.dobInput || field === refs.sexSelect) {
          syncPregnancyField();
        }
        syncQuickPickSelectionFromInputs();
        setStatus("");
      });
    });

    refs.dobInput?.addEventListener("change", () => {
      renderDobField();
      syncPregnancyField();
      setStatus("");
    });

    refs.dobInput?.addEventListener("blur", () => {
      renderDobField();
    });

    refs.dobDisplayBtn?.addEventListener("click", () => {
      openDobEditor();
    });

    refs.sexSelect?.addEventListener("change", () => {
      syncPregnancyField();
      syncSexIcon();
    });

    refs.pregnancySelect?.addEventListener("change", () => {
      if (!refs.pregnancySelect.disabled) {
        state.lastUnlockedPregnancyValue = refs.pregnancySelect.value || "unknown";
      }
    });

    document.addEventListener("findmytest:clear", (event) => {
      const shouldClearInputs = Boolean(event.detail?.preserveInputs === false);
      state.output = null;
      clearSelectionUi();

      if (shouldClearInputs) {
        clearInputs();
      }

      if (event.detail?.clearStatus) {
        setStatus("");
      }
    });

    document.addEventListener("findmytube:selectionchange", () => {
      if (!state.output) return;
      renderSuggestedTests();
    });
  }

  async function loadDataset() {
    setStatus("Loading Find My Test...");

    try {
      const response = await fetch(datasetUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Dataset request failed with ${response.status}`);
      }

      const rawDataset = await response.json();
      state.dataset = hydrateDataset(rawDataset);
      if (refs.dobInput) {
        refs.dobInput.max = new Date().toISOString().slice(0, 10);
      }
      renderDobField();
      syncSexIcon();
      syncPregnancyField();
      syncQuickPickSelectionFromInputs();
      renderQuickPicks();
      setStatus("");

      if (isFindMyTestPage) {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "auto" });
        });
      }
    } catch (error) {
      console.error("Find My Test dataset failed to load.", error);
      setStatus("Find My Test could not load the symptom-to-test map. Use the main search while we fix it.");
    }
  }

  bindEvents();
  clearSelectionUi();
  void loadDataset();
}());
