(function exposeStockCatalog(root, factory) {
  const catalog = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = catalog;
  }
  if (root) {
    root.FMT_STOCK_CATALOG = catalog;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function buildStockCatalog() {
  function createTubeItems(colorKey, label, options = {}) {
    const {
      traySize = 100,
      maxTrays = 1,
      maxSingles = 99,
      note = "",
      singlesOnly = false
    } = options;
    const sheetPrefix = `${colorKey}Tube`;
    const items = [];

    if (!singlesOnly) {
      items.push({
        id: `${colorKey}-tubes-tray`,
        label,
        variantLabel: "Tray",
        unitType: "tray",
        traySize,
        maxQuantity: maxTrays,
        note: `${note} Tray orders are limited to ${maxTrays} ${maxTrays === 1 ? "tray" : "trays"}.`,
        sheetColumnKey: `${colorKey}Tubes`,
        sheetTrayColumnKey: `${sheetPrefix}Trays`
      });
    }

    items.push({
      id: `${colorKey}-tubes-single`,
      label,
      variantLabel: "Singles",
      unitType: "each",
      maxQuantity: maxSingles,
      note: singlesOnly
        ? `${note} Maximum ${maxSingles} tube${maxSingles === 1 ? "" : "s"} per request.`
        : "Order single tubes when a full tray is not needed.",
      sheetColumnKey: `${colorKey}Tubes`,
      sheetSingleColumnKey: `${sheetPrefix}Singles`
    });

    return items;
  }

  const items = [
    ...createTubeItems("yellow", "Yellow (Gel) tubes", { maxTrays: 2, note: "Serum tubes." }),
    ...createTubeItems("grey", "Grey (Fluoride) tubes", { note: "Fluoride tubes." }),
    ...createTubeItems("purple", "Purple (EDTA) tubes", { note: "EDTA tubes." }),
    ...createTubeItems("green", "Green (Heparin) tubes", { note: "Heparin tubes." }),
    ...createTubeItems("blue", "Blue (Citrate) tubes", { note: "Citrate tubes." }),
    ...createTubeItems("pearl", "Pearl tubes", { note: "Pearl/PPT tubes." }),
    ...createTubeItems("tan", "Tan tubes", { note: "Tan tubes." }),
    ...createTubeItems("pink", "Pink (Blood Bank) tubes", {
      singlesOnly: true,
      maxSingles: 5,
      note: "Blood bank tubes must go with the blood bank form."
    }),
    {
      id: "paediatric-yellow-microtainer",
      label: "Paediatric Yellow (Gel) microtainer",
      unitType: "each",
      maxQuantity: 50,
      note: "Requested individually.",
      sheetColumnKey: "PaediatricYellowMicrotainer"
    },
    {
      id: "paediatric-purple-microtainer",
      label: "Paediatric Purple (EDTA) microtainer",
      unitType: "each",
      maxQuantity: 50,
      note: "Requested individually.",
      sheetColumnKey: "PaediatricPurpleMicrotainer"
    },
    {
      id: "paediatric-grey-microtainer",
      label: "Paediatric Grey (Fluoride) microtainer",
      unitType: "each",
      maxQuantity: 50,
      note: "Requested individually.",
      sheetColumnKey: "PaediatricGreyMicrotainer"
    },
    { id: "specimen-jars", label: "Specimen jars", unitType: "each", maxQuantity: 50, note: "Requested individually." },
    { id: "lab-bags", label: "Lab bags", unitType: "packet", packetSize: 50, maxQuantity: 20, note: "Packed in 50s." },
    { id: "blood-culture-bottle-aerobic", label: "Aerobic Blood Culture Bottle (Blue)", unitType: "each", maxQuantity: 50, note: "Requested individually." },
    { id: "blood-culture-bottle-paediatric-aerobic", label: "Paediatric Aerobic Blood Culture Bottle (Yellow)", unitType: "each", maxQuantity: 50, note: "Requested individually." },
    { id: "blood-culture-bottle-anaerobic", label: "Anaerobic Blood Culture Bottle (Orange)", unitType: "each", maxQuantity: 50, note: "Requested individually." },
    { id: "blood-culture-bottle-fungal-mycology", label: "Fungal / Mycology Blood Culture Bottle (Green)", unitType: "each", maxQuantity: 50, note: "Requested individually." },
    { id: "blood-culture-bottle-mycobacterial-tb", label: "Mycobacterial Blood Culture Bottle (Red)", unitType: "each", maxQuantity: 50, note: "Requested individually." },
    {
      id: "vacutainer-needle-green",
      label: "Vacutainer needle (Green)",
      unitType: "each",
      maxQuantity: 50,
      note: "Requested individually.",
      searchTerms: "vacutainer needles blood collection needle green"
    },
    {
      id: "vacutainer-needle-black",
      label: "Vacutainer needle (Black)",
      unitType: "each",
      maxQuantity: 50,
      note: "Requested individually.",
      searchTerms: "vacutainer needles blood collection needle black"
    },
    { id: "blood-gas-syringes", label: "Blood gas syringes", unitType: "each", maxQuantity: 50, note: "Requested individually." },
    { id: "swabs-transport-media", label: "Swabs with transport media", unitType: "each", maxQuantity: 50, note: "Requested individually." }
  ].map((item) => Object.freeze({ ...item }));

  const byId = Object.freeze(Object.fromEntries(items.map((item) => [item.id, item])));

  function getItem(id) {
    return byId[String(id || "").trim()] || null;
  }

  function getInventoryUnits(item, quantity) {
    const safeQuantity = Number(quantity);
    if (!Number.isInteger(safeQuantity) || safeQuantity <= 0) return 0;
    if (item?.unitType === "tray") return safeQuantity * Number(item.traySize || 0);
    if (item?.unitType === "packet") return safeQuantity * Number(item.packetSize || 0);
    return safeQuantity;
  }

  function formatQuantity(item, quantity) {
    const safeQuantity = Number(quantity);
    if (item?.unitType === "tray") {
      const units = getInventoryUnits(item, safeQuantity);
      return `${safeQuantity} tray${safeQuantity === 1 ? "" : "s"} (${units} tubes)`;
    }
    if (item?.unitType === "packet") {
      const units = getInventoryUnits(item, safeQuantity);
      return `${safeQuantity} packet${safeQuantity === 1 ? "" : "s"} (${units} items)`;
    }
    return `${safeQuantity} item${safeQuantity === 1 ? "" : "s"}`;
  }

  return Object.freeze({ items: Object.freeze(items), byId, getItem, getInventoryUnits, formatQuantity });
});
