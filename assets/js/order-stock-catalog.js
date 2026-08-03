(function initStockCatalogTools() {
  if (document.body?.dataset?.appPage !== "stock-order") return;

  const grid = document.getElementById("stockOrderGrid");
  const searchInput = document.getElementById("stockCatalogSearch");
  const status = document.getElementById("stockCatalogStatus");
  const filterButtons = Array.from(document.querySelectorAll("[data-stock-filter]"));
  if (!grid || !searchInput || !status || !filterButtons.length) return;

  let activeFilter = "all";

  function getCatalogCards() {
    return Array.from(grid.querySelectorAll(".stock-order-item-card")).filter((card) => {
      if (!(card instanceof HTMLElement)) return false;
      if (card.matches("[data-stock-unified-tube]")) return true;
      return card.getAttribute("aria-hidden") !== "true" && card.style.display !== "none";
    });
  }

  function getCardKey(card) {
    return String(
      card.getAttribute("data-stock-item")
      || card.getAttribute("data-stock-unified-tube")
      || ""
    ).toLowerCase();
  }

  function getCardCategory(card) {
    const key = getCardKey(card);
    const text = String(card.textContent || "").toLowerCase();
    if (/paediatric|pediatric|microtainer/.test(`${key} ${text}`)) return "paediatric";
    if (/blood-culture|culture bottle|culture bottles/.test(`${key} ${text}`)) return "cultures";
    if (card.hasAttribute("data-stock-unified-tube") || /tube/.test(`${key} ${text}`)) return "tubes";
    return "supplies";
  }

  function isSelected(card) {
    if (card.classList.contains("has-selection")) return true;
    return Array.from(card.querySelectorAll("input")).some((input) => Number(input.value || 0) > 0);
  }

  function applyFilters() {
    const cards = getCatalogCards();
    const query = String(searchInput.value || "").trim().toLowerCase();
    let shown = 0;

    cards.forEach((card) => {
      const searchableText = `${getCardKey(card)} ${String(card.textContent || "")}`.toLowerCase();
      const matchesSearch = !query || searchableText.includes(query);
      const matchesFilter = activeFilter === "all"
        || (activeFilter === "selected" ? isSelected(card) : getCardCategory(card) === activeFilter);
      const shouldShow = matchesSearch && matchesFilter;
      card.hidden = !shouldShow;
      if (shouldShow) shown += 1;
    });

    const noun = shown === 1 ? "item" : "items";
    status.textContent = shown
      ? `${shown} of ${cards.length} stock ${noun} shown.`
      : "No stock items match. Clear the search or choose another category.";
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = String(button.getAttribute("data-stock-filter") || "all");
      filterButtons.forEach((candidate) => {
        const isActive = candidate === button;
        candidate.classList.toggle("is-active", isActive);
        candidate.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      applyFilters();
    });
  });

  searchInput.addEventListener("input", applyFilters);
  grid.addEventListener("input", () => window.setTimeout(applyFilters, 0));
  grid.addEventListener("click", () => window.setTimeout(applyFilters, 0));

  const observer = new MutationObserver((records) => {
    if (records.some((record) => record.type === "childList")) applyFilters();
  });
  observer.observe(grid, { childList: true });

  window.refreshStockCatalogFilters = applyFilters;
  applyFilters();
})();
