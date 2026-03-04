const searchInput = document.getElementById("searchInput");
const cardsContainer = document.getElementById("cardsContainer");
const resultsInfo = document.getElementById("resultsInfo");
const preSearchPanel = document.getElementById("preSearchPanel");
const factText = document.getElementById("factText");
const factDots = document.getElementById("factDots");
const groupChips = document.getElementById("groupChips");

const facts = [
  "Biochemistry profiles like U&E and LFT are commonly serum-based (gold-top) in routine workflows.",
  "Haematology tests often use EDTA tubes, while coagulation studies generally use citrate tubes.",
  "Microbiology and molecular tests are usually specimen-specific and not tied to one blood tube.",
  "Selecting by lab section first can reduce request form errors before sample collection."
];

const labGroupMeta = {
  biochemistry: { label: "Biochemistry", hint: "U&E, LFT, CRP, Lipids, Glucose" },
  haematology: { label: "Haematology", hint: "FBC, ESR, Retics, Blood Group" },
  coagulation: { label: "Coagulation", hint: "INR, PT, PTT, D-Dimer, Fibrinogen" },
  endocrinology: { label: "Endocrinology", hint: "TSH, Free T4, FSH, LH, HbA1c" },
  immunology: { label: "Immunology", hint: "ANA, ENA, RF, Celiac screen" },
  infectious: { label: "Infectious Diseases", hint: "Hepatitis, HIV, Syphilis screens" },
  microbiology: { label: "Microbiology", hint: "MCS, Cultures, TB tests" },
  molecular: { label: "Molecular Biology / PCR", hint: "Respiratory, GI, STD PCR panels" },
  general: { label: "General", hint: "Other routine tests" }
};

const chipGroups = [
  "biochemistry",
  "haematology",
  "coagulation",
  "endocrinology",
  "immunology",
  "infectious",
  "microbiology",
  "molecular"
];

function getLabGroup(testName) {
  const name = testName.toLowerCase();

  if (
    name.includes("pcr") ||
    name.includes("genexpert") ||
    name.includes("viral load") ||
    name.includes("panel")
  ) return "molecular";

  if (
    name.includes("culture") ||
    name.includes("mcs") ||
    name.includes("tb ") ||
    name.includes("tb-") ||
    name.includes("calprotectin")
  ) return "microbiology";

  if (
    name.includes("hepatitis") ||
    name.includes("hiv") ||
    name.includes("rpr") ||
    name.includes("treponema")
  ) return "infectious";

  if (
    name.includes("ana") ||
    name.includes("ena") ||
    name.includes("rheumatoid") ||
    name.includes("celiac")
  ) return "immunology";

  if (
    name.includes("inr") ||
    name.includes("ptt") ||
    name.includes("prothrombin") ||
    name.includes("fibrinogen") ||
    name.includes("d-dimer") ||
    name.includes("von willebrand") ||
    name.includes("dic")
  ) return "coagulation";

  if (
    name.includes("tsh") ||
    name.includes("t4") ||
    name.includes("t3") ||
    name.includes("hba1c") ||
    name.includes("fsh") ||
    name.includes("lh") ||
    name.includes("prolactin") ||
    name.includes("progesterone") ||
    name.includes("estradiol") ||
    name.includes("dheas") ||
    name.includes("psa")
  ) return "endocrinology";

  if (
    name.includes("fbc") ||
    name.includes("esr") ||
    name.includes("blood group")
  ) return "haematology";

  if (
    name.includes("u&e") ||
    name.includes("liver") ||
    name.includes("lft") ||
    name.includes("cmp") ||
    name.includes("lipid") ||
    name.includes("glucose") ||
    name.includes("crp") ||
    name.includes("iron")
  ) return "biochemistry";

  return "general";
}

function getProfileEmoji(testName) {
  const name = testName.toLowerCase();

  if (name.includes("liver") || name.includes("lft")) return "🧪";
  if (name.includes("u&e") || name === "u&e") return "🫘";
  return "";
}

function buildSearchIndex(test) {
  const groupId = getLabGroup(test.name);
  const group = labGroupMeta[groupId];
  return `${test.name} ${test.tubeColor} ${test.specimen} ${group.label} ${groupId}`.toLowerCase();
}

function renderFactsCarousel() {
  if (!factText || !factDots) return;

  let currentFact = 0;
  factText.textContent = facts[currentFact];
  factDots.innerHTML = facts
    .map((_, index) => `<span class="fact-dot${index === 0 ? " active" : ""}"></span>`)
    .join("");

  setInterval(() => {
    currentFact = (currentFact + 1) % facts.length;
    factText.textContent = facts[currentFact];
    [...factDots.children].forEach((dot, index) => {
      dot.classList.toggle("active", index === currentFact);
    });
  }, 4200);
}

function renderGroupChips() {
  if (!groupChips) return;

  groupChips.innerHTML = chipGroups
    .map((groupId) => {
      const group = labGroupMeta[groupId];
      return `
        <button class="group-chip" type="button" data-group="${groupId}">
          <span>
            <strong>${group.label}</strong>
            <small>${group.hint}</small>
          </span>
        </button>
      `;
    })
    .join("");

  groupChips.querySelectorAll(".group-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const groupId = chip.getAttribute("data-group");
      const groupLabel = labGroupMeta[groupId].label;
      searchInput.value = groupLabel;
      handleSearch(groupLabel);
      searchInput.focus();
    });
  });
}

function renderCards(filteredTests) {
  cardsContainer.innerHTML = "";

  if (filteredTests.length === 0) {
    resultsInfo.textContent = "0 tests found";
    cardsContainer.innerHTML = `
      <div class="no-results">
        No matching test found. Try searching by test name or lab section (e.g. Biochemistry, Haematology, Microbiology).
      </div>
    `;
    return;
  }

  resultsInfo.textContent = `${filteredTests.length} test${filteredTests.length > 1 ? "s" : ""} found`;

  filteredTests.forEach((test) => {
    const groupId = getLabGroup(test.name);
    const group = labGroupMeta[groupId];
    const searchEmoji = getProfileEmoji(test.name);
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h2>${test.name}${searchEmoji ? ` <span class="profile-emoji" aria-hidden="true">${searchEmoji}</span>` : ""}</h2>
      <div class="test-group-badge">${group.label}</div>
      <div class="field">
        <span class="label">Tube Color</span>
        <div class="tube-color-row">
          <span class="tube-icon" style="--tube-color: ${test.borderColor};" aria-hidden="true"></span>
          <span>${test.tubeColor}</span>
        </div>
      </div>
      <div class="field">
        <span class="label">Specimen</span>
        <span>${test.specimen}</span>
      </div>
      <div class="field">
        <span class="label">Turnaround Time</span>
        <span>${test.turnaroundTime}</span>
      </div>
      <div class="field">
        <span class="label">Notes</span>
        <span>${test.notes}</span>
      </div>
    `;

    cardsContainer.appendChild(card);
  });
}

function handleSearch(rawValue) {
  const value = rawValue.toLowerCase().trim();
  const hasSearch = value.length > 0;

  preSearchPanel.style.display = hasSearch ? "none" : "grid";

  if (!hasSearch) {
    resultsInfo.textContent = "Start typing a test or choose a lab section.";
    cardsContainer.innerHTML = "";
    return;
  }

  const filteredTests = tests.filter((test) => buildSearchIndex(test).includes(value));
  renderCards(filteredTests);
}

searchInput.addEventListener("input", (event) => {
  handleSearch(event.target.value);
});

renderFactsCarousel();
renderGroupChips();
handleSearch("");
