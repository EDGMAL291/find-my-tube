// Find My Test runs as a focused module on top of the main app's shared search and draw-plan API.
(function initFindMyTestModule() {
  const app = window.findMyTubeApp;
  if (!app) return;

  // Cache panel-specific DOM references once and stop early if this module is not on the page.
  const refs = {
    panel: document.getElementById("clinicalWorkupPanel"),
    form: document.getElementById("clinicalWorkupForm"),
    symptomsChipList: document.getElementById("clinicalSymptomsChipList"),
    signsChipList: document.getElementById("clinicalSignsChipList"),
    concernChipList: document.getElementById("clinicalConcernChipList"),
    dobControl: document.getElementById("clinicalDobControl"),
    dobLabel: document.getElementById("clinicalDobLabel"),
    dobInput: document.getElementById("clinicalDobInput"),
    dobPickerInput: document.getElementById("clinicalDobPickerInput"),
    dobAssist: document.getElementById("clinicalDobAssist"),
    sexSelect: document.getElementById("clinicalSexSelect"),
    sexIcon: document.getElementById("clinicalSexIcon"),
    pregnancySelect: document.getElementById("clinicalPregnancySelect"),
    symptomsInput: document.getElementById("clinicalSymptomsInput"),
    signsInput: document.getElementById("clinicalSignsInput"),
    concernInput: document.getElementById("clinicalConcernInput"),
    resetBtn: document.getElementById("clinicalWorkupResetBtn"),
    status: document.getElementById("clinicalWorkupStatus"),
    results: document.getElementById("clinicalWorkupResults"),
    addAllResultsBtn: document.getElementById("addAllClinicalWorkupResultsBtn"),
    clearResultsBtn: document.getElementById("clearClinicalWorkupResultsBtn"),
    testList: document.getElementById("clinicalWorkupTestList")
  };

  if (!refs.form || !refs.testList) return;

  // Keep Find My Test state local, then sync only the parts that need to reach the main app shell.
  const state = {
    dataset: null,
    selectedQuickPickIds: new Set(),
    autoMatchedQuickPickIds: new Set(),
    output: null,
    expandedQuickPickFields: new Set(),
    pregnancyWasAutoLocked: false,
    lastUnlockedPregnancyValue: "unknown",
    autoMatchResetTimeoutId: 0
  };
  const pageParams = new URLSearchParams(window.location.search);
  const isFindMyTestPage = pageParams.get("tool") === "find-my-test";
  const MIN_PREGNANCY_AGE_YEARS = 12;

  const datasetUrl = `assets/data/find-my-test-map.json?v=${app.assetVersion || "20260322b"}`;

  // Shared text helpers keep dataset matching rules predictable.
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

  // Escapes reg exp.
  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Normalizes this work.
  function normalize(value) {
    return typeof app.normalizeForSearch === "function"
      ? app.normalizeForSearch(value)
      : String(value || "").toLowerCase().trim();
  }

  // Returns unique strings.
  function uniqueStrings(values = []) {
    return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
  }

  // Joins with and.
  function joinWithAnd(values = []) {
    const items = uniqueStrings(values);
    if (!items.length) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
  }

  // Truncates text.
  function truncateText(value, maxLength = 84) {
    const text = String(value || "").trim();
    if (!text || text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 1).trim()}...`;
  }

  // Formats count.
  function formatCount(count, noun) {
    return `${count} ${noun}${count === 1 ? "" : "s"}`;
  }

  // DOB helpers power the age summary and the pregnancy field locking rules.
  function parseDateInput(value) {
    const raw = String(value || "").trim();
    if (!raw) return null;

    let year;
    let month;
    let day;
    const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    const localMatch = raw.match(/^(\d{1,2})\s*[/.-]\s*(\d{1,2})\s*[/.-]\s*(\d{4})$/);

    if (isoMatch) {
      year = Number.parseInt(isoMatch[1], 10);
      month = Number.parseInt(isoMatch[2], 10);
      day = Number.parseInt(isoMatch[3], 10);
    } else if (localMatch) {
      day = Number.parseInt(localMatch[1], 10);
      month = Number.parseInt(localMatch[2], 10);
      year = Number.parseInt(localMatch[3], 10);
    } else {
      return null;
    }

    if (![year, month, day].every((part) => Number.isFinite(part))) return null;
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

  // Formats date for summary.
  function formatDateForSummary(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  // Formats date for input.
  function formatDateForInput(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return `${day} / ${month} / ${year}`;
  }

  // Formats date for picker.
  function formatDateForPicker(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return `${year}-${month}-${day}`;
  }

  // Auto-inserts DOB separators so mobile users can type digits only.
  function formatDobDraft(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
    if (!digits) return "";
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4)}`;
  }

  // Formats age display.
  function formatAgeDisplay(ageDays, ageMonths) {
    if (!Number.isFinite(ageDays) || ageDays < 0) return "";
    if (ageDays <= 28) return formatCount(ageDays, "day");
    if (!Number.isFinite(ageMonths) || ageMonths < 1) return formatCount(ageDays, "day");
    if (Number.isFinite(ageMonths) && ageMonths < 24) return formatCount(ageMonths, "month");

    return formatCount(Math.floor(ageMonths / 12), "year");
  }

  // Renders DOB field.
  function renderDobField() {
    if (!refs.dobControl || !refs.dobInput) return;

    const dobDetails = getDobDetails(refs.dobInput.value || "");
    const hasRawValue = Boolean(String(refs.dobInput.value || "").trim());
    const hasUsableDob = Boolean(dobDetails.value) && !dobDetails.isFuture && Boolean(dobDetails.date);
    if (refs.dobPickerInput) refs.dobPickerInput.max = formatDateForPicker(new Date());

    refs.dobControl.classList.toggle("has-value", hasUsableDob);
    refs.dobControl.classList.toggle("is-empty", !hasUsableDob);
    refs.dobControl.classList.toggle("is-invalid", hasRawValue && !hasUsableDob);
    refs.dobInput.setAttribute("aria-invalid", hasRawValue && !hasUsableDob ? "true" : "false");

    if (!hasUsableDob) {
      if (refs.dobLabel) refs.dobLabel.textContent = "Date of birth";
      if (refs.dobPickerInput) refs.dobPickerInput.value = "";
      if (refs.dobAssist) {
        refs.dobAssist.textContent = dobDetails.isFuture
          ? "Date of birth cannot be in the future."
          : hasRawValue
            ? "Use DD / MM / YYYY."
            : "";
      }
      return;
    }

    if (refs.dobLabel) refs.dobLabel.textContent = "Date of birth";
    if (refs.dobPickerInput && dobDetails.date) {
      refs.dobPickerInput.value = formatDateForPicker(dobDetails.date);
    }
    if (refs.dobAssist) {
      refs.dobAssist.textContent = dobDetails.ageDisplay
        ? `${dobDetails.ageDisplay} old`
        : "Age unavailable";
    }
  }

  // Checks whether pregnancy locked by demographics.
  function isPregnancyLockedByDemographics(dobDetails, sexValue) {
    if (sexValue === "male") return true;
    return Number.isFinite(dobDetails?.ageYears) && dobDetails.ageYears < MIN_PREGNANCY_AGE_YEARS;
  }

  // Synchronizes default select styling.
  function syncContextSelectStates() {
    refs.sexSelect?.classList.toggle("clinical-workup-select-default", (refs.sexSelect.value || "unspecified") === "unspecified");
    refs.pregnancySelect?.classList.toggle("clinical-workup-select-default", (refs.pregnancySelect.value || "unknown") === "unknown");
  }

  // Synchronizes pregnancy field.
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
      syncContextSelectStates();
      return;
    }

    refs.pregnancySelect.disabled = false;
    refs.pregnancySelect.removeAttribute("title");

    if (state.pregnancyWasAutoLocked && refs.pregnancySelect.value === "unknown" && state.lastUnlockedPregnancyValue !== "unknown") {
      refs.pregnancySelect.value = state.lastUnlockedPregnancyValue;
    }

    state.pregnancyWasAutoLocked = false;
    syncContextSelectStates();
  }

  // Gets DOB details.
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

  // Quick picks write into the free-text fields so clinicians can mix guided chips with their own wording.
  function getQuickPickById(id) {
    return state.dataset?.quickPickById?.[id] || null;
  }

  // Gets selected quick pick labels.
  function getSelectedQuickPickLabels() {
    return Array.from(state.selectedQuickPickIds)
      .map((id) => getQuickPickById(id)?.label || "")
      .filter(Boolean);
  }

  // Gets selected quick pick terms.
  function getSelectedQuickPickTerms() {
    return Array.from(state.selectedQuickPickIds).flatMap((id) => getQuickPickById(id)?.terms || []);
  }

  // Gets quick pick field.
  function getQuickPickField(quickPick) {
    return quickPick?.field === "signs" || quickPick?.field === "concern"
      ? quickPick.field
      : "symptoms";
  }

  // Gets quick pick input.
  function getQuickPickInput(field) {
    if (field === "signs") return refs.signsInput;
    if (field === "concern") return refs.concernInput;
    return refs.symptomsInput;
  }

  // Gets quick pick list.
  function getQuickPickList(field) {
    if (field === "signs") return refs.signsChipList;
    if (field === "concern") return refs.concernChipList;
    return refs.symptomsChipList;
  }

  // Gets quick pick field label.
  function getQuickPickFieldLabel(field) {
    if (field === "signs") return "signs";
    if (field === "concern") return "concerns";
    return "symptoms";
  }

  // Gets quick pick text.
  function getQuickPickText(quickPick) {
    return String(quickPick?.insertText || quickPick?.label || "").trim();
  }

  // Gets quick pick tokens.
  function getQuickPickTokens(value) {
    return uniqueStrings(
      String(value || "")
        .split(/[\n,;]+/)
        .map((part) => String(part || "").trim())
    );
  }

  function doesQuickPickInputEndWithDelimiter(value) {
    return /[\n,;]\s*$/.test(String(value || ""));
  }

  function getQuickPickCandidateTexts(quickPick) {
    return uniqueStrings([
      getQuickPickText(quickPick),
      quickPick?.label || "",
      ...(Array.isArray(quickPick?.terms) ? quickPick.terms : [])
    ]);
  }

  function getEditDistance(leftValue, rightValue) {
    const left = String(leftValue || "");
    const right = String(rightValue || "");
    if (!left) return right.length;
    if (!right) return left.length;

    const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
      let diagonal = previous[0];
      previous[0] = leftIndex;

      for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
        const cached = previous[rightIndex];
        const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
        previous[rightIndex] = Math.min(
          previous[rightIndex] + 1,
          previous[rightIndex - 1] + 1,
          diagonal + substitutionCost
        );
        diagonal = cached;
      }
    }

    return previous[right.length];
  }

  function getQuickPickCandidateMatch(rawToken, candidateText, { allowFuzzy = false } = {}) {
    const normalizedToken = normalize(rawToken);
    const normalizedCandidate = normalize(candidateText);
    if (!normalizedToken || !normalizedCandidate) return null;

    if (normalizedToken === normalizedCandidate) {
      return {
        exact: true,
        distance: 0,
        lengthDelta: 0
      };
    }

    if (!allowFuzzy || normalizedToken.length < 4 || normalizedCandidate.length < 4) return null;

    const distance = getEditDistance(normalizedToken, normalizedCandidate);
    const threshold = normalizedCandidate.length <= 5 ? 1 : 2;
    if (distance > threshold) return null;

    return {
      exact: false,
      distance,
      lengthDelta: Math.abs(normalizedCandidate.length - normalizedToken.length)
    };
  }

  function compareQuickPickMatches(nextMatch, currentMatch) {
    if (!currentMatch) return -1;
    if (nextMatch.exact !== currentMatch.exact) return nextMatch.exact ? -1 : 1;
    if (nextMatch.distance !== currentMatch.distance) return nextMatch.distance - currentMatch.distance;
    if (nextMatch.lengthDelta !== currentMatch.lengthDelta) return nextMatch.lengthDelta - currentMatch.lengthDelta;
    return nextMatch.canonicalText.localeCompare(currentMatch.canonicalText);
  }

  function findBestQuickPickMatch(field, rawToken, { allowFuzzy = false } = {}) {
    const fieldQuickPicks = getFieldQuickPicks(field);
    let bestMatch = null;
    let isAmbiguous = false;

    fieldQuickPicks.forEach((quickPick) => {
      getQuickPickCandidateTexts(quickPick).forEach((candidateText) => {
        const candidateMatch = getQuickPickCandidateMatch(rawToken, candidateText, { allowFuzzy });
        if (!candidateMatch) return;

        const nextMatch = {
          ...candidateMatch,
          quickPick,
          canonicalText: getQuickPickText(quickPick)
        };
        const comparison = compareQuickPickMatches(nextMatch, bestMatch);

        if (comparison < 0) {
          bestMatch = nextMatch;
          isAmbiguous = false;
          return;
        }

        if (
          comparison === 0
          && bestMatch
          && bestMatch.quickPick.id !== nextMatch.quickPick.id
        ) {
          isAmbiguous = true;
        }
      });
    });

    if (!bestMatch || isAmbiguous) return null;
    return bestMatch.quickPick;
  }

  function flashAutoMatchedQuickPicks(quickPickIds = []) {
    const ids = uniqueStrings(quickPickIds);
    if (!ids.length) return;

    ids.forEach((id) => state.autoMatchedQuickPickIds.add(id));
    window.clearTimeout(state.autoMatchResetTimeoutId);
    renderQuickPicks();
    state.autoMatchResetTimeoutId = window.setTimeout(() => {
      state.autoMatchedQuickPickIds.clear();
      renderQuickPicks();
    }, 820);
  }

  function autoSelectTypedQuickPicks(field, { commitActiveToken = false } = {}) {
    const input = getQuickPickInput(field);
    if (!input) return [];

    const rawValue = String(input.value || "");
    const rawTokens = getQuickPickTokens(rawValue);
    if (!rawTokens.length) return [];

    const endsWithDelimiter = doesQuickPickInputEndWithDelimiter(rawValue);
    const nextTokens = [];
    const autoMatchedIds = [];

    rawTokens.forEach((token, index) => {
      const isActiveToken = index === rawTokens.length - 1 && !endsWithDelimiter && !commitActiveToken;
      const matchedQuickPick = findBestQuickPickMatch(field, token, {
        allowFuzzy: !isActiveToken
      });

      if (!matchedQuickPick) {
        nextTokens.push(token);
        return;
      }

      nextTokens.push(getQuickPickText(matchedQuickPick));
      autoMatchedIds.push(matchedQuickPick.id);
    });

    const dedupedTokens = uniqueStrings(nextTokens);
    const nextValue = dedupedTokens.join(", ");
    if (nextValue !== rawValue) {
      input.value = nextValue;
      if (document.activeElement === input) {
        const cursor = nextValue.length;
        input.setSelectionRange?.(cursor, cursor);
      }
    }

    return autoMatchedIds;
  }

  function commitTypedQuickPickField(field) {
    const input = getQuickPickInput(field);
    if (!input) return [];

    const autoMatchedIds = autoSelectTypedQuickPicks(field, { commitActiveToken: true });
    const tokens = getQuickPickTokens(input.value);
    if (!tokens.length) return autoMatchedIds;

    input.value = `${tokens.join(", ")}, `;
    const cursor = input.value.length;
    input.focus({ preventScroll: true });
    input.setSelectionRange?.(cursor, cursor);
    return autoMatchedIds;
  }

  // Appends quick pick text.
  function appendQuickPickText(input, text) {
    if (!input || !text) return;

    const currentParts = getQuickPickTokens(input.value);
    const hasText = currentParts.some((part) => normalize(part) === normalize(text));
    if (hasText) return;

    currentParts.push(text);
    input.value = currentParts.join(", ");
  }

  // Removes quick pick text.
  function removeQuickPickText(input, text) {
    if (!input || !text) return;

    const nextParts = getQuickPickTokens(input.value)
      .filter((part) => part && normalize(part) !== normalize(text));

    input.value = nextParts.join(", ");
  }

  // Synchronizes quick pick selection from inputs.
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

  // Sets status.
  function setStatus(message = "") {
    if (!refs.status) return;
    refs.status.textContent = String(message || "").trim();
  }

  // Gets field quick picks.
  function getFieldQuickPicks(field) {
    return (state.dataset?.quickPicks || []).filter((quickPick) => getQuickPickField(quickPick) === field);
  }

  // Gets focused quick picks for field.
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

  // Orders quick picks.
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

  // Renders quick picks.
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
            class="clinical-workup-chip${state.selectedQuickPickIds.has(quickPick.id) ? " active" : ""}${state.autoMatchedQuickPickIds.has(quickPick.id) ? " auto-added" : ""}"
            data-find-my-test-chip="${escapeHtml(quickPick.id)}"
            aria-pressed="${state.selectedQuickPickIds.has(quickPick.id) ? "true" : "false"}"
          >
            ${escapeHtml(quickPick.label)}
          </button>
        `)
        .join("") + actionMarkup;
    });
  }

  // Clears inputs.
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
    if (refs.dobPickerInput) refs.dobPickerInput.value = "";
    renderDobField();
    syncPregnancyField();
    syncContextSelectStates();
    renderQuickPicks();
  }

  // Clears selection UI.
  function clearSelectionUi() {
    if (refs.testList) {
      refs.testList.innerHTML = "";
    }
  }

  // Build one normalized input object so the matcher can stay focused on rules instead of DOM access.
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

  // Formats sex label.
  function formatSexLabel(value) {
    if (value === "female") return "Female";
    if (value === "male") return "Male";
    if (value === "other") return "Other";
    return "";
  }

  // Synchronizes sex icon.
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

  // Checks whether normalized phrase.
  function hasNormalizedPhrase(haystack, phrase) {
    const normalizedHaystack = normalize(haystack);
    const normalizedPhrase = normalize(phrase);
    if (!normalizedHaystack || !normalizedPhrase) return false;
    if (normalizedHaystack === normalizedPhrase) return true;
    const pattern = new RegExp(`(?:^| )${escapeRegExp(normalizedPhrase)}(?:$| )`);
    return pattern.test(normalizedHaystack);
  }

  // Checks whether pregnancy context.
  function hasPregnancyContext(input) {
    if (!input) return false;

    return input.pregnancy === "pregnant"
      || hasNormalizedPhrase(input.normalizedBlob, "pregnancy")
      || hasNormalizedPhrase(input.normalizedBlob, "pregnant")
      || hasNormalizedPhrase(input.normalizedBlob, "antenatal")
      || hasNormalizedPhrase(input.normalizedBlob, "prenatal")
      || hasNormalizedPhrase(input.normalizedBlob, "gestational");
  }

  // Presentation matching stays conservative: a suggestion only appears if the dataset conditions are met.
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

  // Evaluates presentation.
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

  // Builds tags.
  function buildTags(input, matchedPresentations, suggestedTests) {
    const tags = [];

    if (input.ageDisplay) tags.push(`${input.ageDisplay} old`);
    if (formatSexLabel(input.sex)) tags.push(formatSexLabel(input.sex));
    if (input.pregnancy === "pregnant") tags.push("Pregnancy context");
    tags.push(...input.selectedQuickPickLabels);

    return uniqueStrings(tags).slice(0, 8);
  }

  // Builds summary.
  function buildSummary(input, matchedPresentations, suggestedTests) {
    if (suggestedTests.length) {
      const summaryParts = [];
      const subjectParts = [];
      const sexLabel = formatSexLabel(input.sex);
      const suspectedLabel = matchedPresentations[0]?.label || "A matching presentation";

      if (input.ageDisplay) subjectParts.push(`${input.ageDisplay} old`);
      if (sexLabel) subjectParts.push(sexLabel.toLowerCase());
      if (input.pregnancy === "pregnant") subjectParts.push("pregnant");
      if (input.symptoms) summaryParts.push(truncateText(input.symptoms, 48));
      if (input.signs) summaryParts.push(truncateText(input.signs, 48));
      if (input.concern) summaryParts.push(truncateText(input.concern, 48));

      const subject = subjectParts.join(" ") || "Patient";
      if (summaryParts.length) {
        return `${subject} presenting with ${joinWithAnd(summaryParts)}. ${suspectedLabel} is suspected.`;
      }

      return `${subject}. ${suspectedLabel} is suspected.`;
    }

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

    return `${intro}there is not a strong direct match in the current catalogue yet. Add a more specific symptom, sign, or concern, or use the main search by test name.`;
  }

  // Builds output.
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
          matchedBy: []
        };

        existingEntry.reasons.push(testEntry.reason || presentation.summary || "");
        existingEntry.matchedBy.push(presentation.label);
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
          matchedBy: uniqueStrings(suggestion.matchedBy)
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
      matchedRules: suggestedTests.length ? [] : matchedPresentations.map((presentation) => ({
        label: "Matched presentation",
        title: presentation.label,
        rationale: presentation.summary || "Matched to the current Find My Test dataset.",
        tests: (presentation.tests || []).map((test) => test.name).filter(Boolean),
        caution: presentation.caution || "",
        matchedSignals: presentation.matchedSignals || []
      }))
    };
  }

  // Suggested test checkboxes mirror Tube Plan so this panel and the main app always agree on selection state.
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
        const stateLabel = alreadyInPlan ? "In Tube Plan" : "Tap to add to Tube Plan";

        return `
          <button
            type="button"
            class="clinical-workup-test-option${isChecked ? " is-selected" : ""}"
            data-find-my-test-option="${escapeHtml(item.name)}"
            aria-pressed="${isChecked ? "true" : "false"}"
          >
            <div class="clinical-workup-test-copy">
              <div class="clinical-workup-test-head">
                <p class="clinical-workup-test-name">${escapeHtml(item.name)}</p>
                <span class="clinical-workup-test-state">${stateLabel}</span>
              </div>
              <p class="clinical-workup-test-summary">${escapeHtml(item.test.clinicalUse || item.test.notes || item.test.specimen || "Suggested from the current catalogue.")}</p>
            </div>
          </button>
        `;
      })
      .join("");

    syncResultsActionButtons(activePlanSelection);
  }

  // Returns suggested test names not yet in Tube Plan.
  function getPendingSuggestedTestNames(activePlanSelection = new Set()) {
    return (state.output?.suggestedTests || [])
      .map((item) => item.name)
      .filter((name) => name && !activePlanSelection.has(name));
  }

  // Keeps the results action buttons in sync with the current suggestions state.
  function syncResultsActionButtons(activePlanSelection = null) {
    if (!refs.addAllResultsBtn) return;

    const suggestedTests = state.output?.suggestedTests || [];
    const selection = activePlanSelection instanceof Set
      ? activePlanSelection
      : new Set(
        typeof app.getSelectedTestNames === "function"
          ? app.getSelectedTestNames()
          : []
      );
    const pendingTestNames = getPendingSuggestedTestNames(selection);
    const hasSuggestions = suggestedTests.length > 0;

    refs.addAllResultsBtn.hidden = !hasSuggestions;
    refs.addAllResultsBtn.disabled = !pendingTestNames.length;
    refs.addAllResultsBtn.textContent = pendingTestNames.length
      ? "Add all to Tube Plan"
      : "All added";
  }

  // Renders output.
  function renderOutput(output) {
    state.output = output;

    if (!output) {
      clearSelectionUi();
      syncResultsActionButtons();
      return;
    }

    renderSuggestedTests();
  }

  // Applies output.
  function applyOutput(output) {
    if (typeof app.setFindMyTestSuggestions === "function") {
      app.setFindMyTestSuggestions(output);
    }
    renderOutput(output);
  }

  // Scrolls to results.
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

  // Clears find my test UI.
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

  // Runs find my test.
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

  // Normalize the JSON dataset once so runtime matching can assume a clean shape and valid test names.
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

  // Event wiring keeps the form reactive while delegating shared actions back to the main app API.
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
      // Reset is treated as a fresh-patient action, so clear the shared Tube Plan too.
      if (typeof app.clearTubePlan === "function") {
        app.clearTubePlan();
      }
      clearFindMyTestUi({ clearInputsToo: true, clearStatusToo: true });
    });

    refs.clearResultsBtn?.addEventListener("click", () => {
      clearFindMyTestUi({ clearInputsToo: false, clearStatusToo: true });
    });

    refs.addAllResultsBtn?.addEventListener("click", () => {
      const pendingTestNames = getPendingSuggestedTestNames(
        new Set(
          typeof app.getSelectedTestNames === "function"
            ? app.getSelectedTestNames()
            : []
        )
      );

      if (!pendingTestNames.length) {
        setStatus("All suggested tests are already in Tube Plan.");
        syncResultsActionButtons();
        return;
      }

      if (typeof app.addTestsToPlan === "function") {
        app.addTestsToPlan(pendingTestNames, {
          replace: false
        });
      }

      setStatus(`${pendingTestNames.length === 1 ? "1 suggested test added" : `${pendingTestNames.length} suggested tests added`} to Tube Plan.`);
      renderSuggestedTests();
    });

    refs.testList.addEventListener("click", (event) => {
      const testButton = event.target.closest("[data-find-my-test-option]");
      if (!testButton) return;

      const testName = testButton.getAttribute("data-find-my-test-option") || "";
      if (!testName) return;

      const isSelected = testButton.getAttribute("aria-pressed") === "true";

      if (!isSelected) {
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
        const autoMatchedIds = field === refs.symptomsInput
          ? autoSelectTypedQuickPicks("symptoms")
          : field === refs.signsInput
            ? autoSelectTypedQuickPicks("signs")
            : field === refs.concernInput
              ? autoSelectTypedQuickPicks("concern")
              : [];

        if (field === refs.dobInput) {
          refs.dobInput.value = formatDobDraft(refs.dobInput.value || "");
          renderDobField();
        }
        if (field === refs.dobInput || field === refs.sexSelect) {
          syncPregnancyField();
        }
        syncQuickPickSelectionFromInputs();
        flashAutoMatchedQuickPicks(autoMatchedIds);
        setStatus("");
      });
    });

    refs.dobInput?.addEventListener("change", () => {
      renderDobField();
      syncPregnancyField();
      setStatus("");
    });

    refs.dobInput?.addEventListener("blur", () => {
      const dobDetails = getDobDetails(refs.dobInput?.value || "");
      if (dobDetails.date && !dobDetails.isFuture) {
        refs.dobInput.value = formatDateForInput(dobDetails.date);
      }
      renderDobField();
    });

    [
      [refs.symptomsInput, "symptoms"],
      [refs.signsInput, "signs"],
      [refs.concernInput, "concern"]
    ].forEach(([field, quickPickField]) => {
      field?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" || event.shiftKey) return;
        event.preventDefault();
        const autoMatchedIds = commitTypedQuickPickField(quickPickField);
        syncQuickPickSelectionFromInputs();
        flashAutoMatchedQuickPicks(autoMatchedIds);
        setStatus("");
      });

      field?.addEventListener("blur", () => {
        const autoMatchedIds = autoSelectTypedQuickPicks(quickPickField, { commitActiveToken: true });
        syncQuickPickSelectionFromInputs();
        flashAutoMatchedQuickPicks(autoMatchedIds);
      });
    });
    refs.dobPickerInput?.addEventListener("change", () => {
      const selectedDate = parseDateInput(refs.dobPickerInput?.value || "");
      refs.dobInput.value = selectedDate ? formatDateForInput(selectedDate) : "";
      renderDobField();
      syncPregnancyField();
      setStatus("");
    });

    refs.sexSelect?.addEventListener("change", () => {
      syncPregnancyField();
      syncSexIcon();
      syncContextSelectStates();
    });

    refs.pregnancySelect?.addEventListener("change", () => {
      if (!refs.pregnancySelect.disabled) {
        state.lastUnlockedPregnancyValue = refs.pregnancySelect.value || "unknown";
      }
      syncContextSelectStates();
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

  // Boot the module by loading the latest dataset, then render the empty ready state.
  async function loadDataset() {
    setStatus("Loading Find My Test...");

    try {
      const response = await fetch(datasetUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Dataset request failed with ${response.status}`);
      }

      const rawDataset = await response.json();
      state.dataset = hydrateDataset(rawDataset);
      renderDobField();
      syncSexIcon();
      syncPregnancyField();
      syncContextSelectStates();
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
