const searchInput = document.getElementById("searchInput");
const cardsContainer = document.getElementById("cardsContainer");
const resultsInfo = document.getElementById("resultsInfo");

function renderCards(filteredTests) {
  cardsContainer.innerHTML = "";

  if (filteredTests.length === 0) {
    resultsInfo.textContent = "0 tests found";
    cardsContainer.innerHTML = `
      <div class="no-results">
        No matching test found. Try searching for FBC, INR, U&E, CMP, Lipid Profile, or ESR.
      </div>
    `;
    return;
  }

  resultsInfo.textContent = `${filteredTests.length} test${filteredTests.length > 1 ? "s" : ""} found`;

  filteredTests.forEach((test) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h2>${test.name}</h2>
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

searchInput.addEventListener("input", (event) => {
  const value = event.target.value.toLowerCase().trim();

  const filteredTests = tests.filter((test) =>
    test.name.toLowerCase().includes(value) ||
    test.tubeColor.toLowerCase().includes(value) ||
    test.specimen.toLowerCase().includes(value)
  );

  renderCards(filteredTests);
});

renderCards(tests);
