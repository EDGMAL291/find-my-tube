(() => {
  const storageKey = "fmt-home-intro-v1";
  const steps = [
    { page: "index.html", target: ".home-hero-controls", title: "Explore the site", copy: "Swipe between sections or use these dots. Next will take you through the real pages and point out the controls. You can skip at any time." },
    { page: "index.html", target: ".home-hero-slide-rack .home-hero-primary", slide: 1, title: "Start with Find My Tube", copy: "Open this section when you know the test name and need its specimen or collection tube." },
    { page: "find-my-tube.html", target: "#searchInput", title: "Search by test name", copy: "Type a test or profile, such as FBC. You can also browse the departments below. Search for the investigation your clinical team has requested." },
    { page: "find-my-tube.html", target: ".discovery-select", example: true, title: "Add tests to Tube Plan", copy: "This FBC search is an example. Use this button to add a test, then keep searching. Your selected tests stay together in Tube Plan. This guide does not select any tests for you." },
    { page: "find-my-tube.html", target: "#drawModalTitle", planner: true, title: "Review your Tube Plan", copy: "Tube Plan shows collection requirements for your selected tests. Review the tube counts, draw order and handling cautions before collection. No tests are added by this guide." },
    { page: "order-stock.html", target: "#stockCatalogSearch", title: "Find the stock you need", copy: "Search for tubes, bottles or supplies, or choose a category. Open an item and use + or − to set its quantity." },
    { page: "order-stock.html", target: '[data-stock-item="lab-bags"] .stock-order-card-copy', title: "Check the ordering unit", copy: "Lab bags and Vacutainer needles are ordered in packs of 50. Blood culture bottles are ordered each. For example, 2 packs of lab bags means 100 bags, while 2 bottles means 2 bottles." },
    { page: "order-stock.html", target: "#stockOrderRequesterNameInput", title: "Add your contact details", copy: "Enter your name and ward. The optional extension helps lab staff contact you and is kept out of public tracking. Never enter patient details in an order." },
    { page: "order-stock.html", target: "#submitStockOrderBtn", title: "Review, then submit", copy: "After selecting stock, Your stock cart appears at the bottom of the screen. Open it to check quantities and your details, then press Submit Request. Wait for an order number. This guide never submits an order." },
    { page: "track-orders.html", target: "#trackOrdersRequestedByInput", title: "Track your request", copy: "Use your name or ward to find your order. Pending means it is awaiting preparation; Ready means it can be collected. Use Refresh for an update. If submission was interrupted, check here before trying again." },
    { page: "index.html", target: "#menuToggleBtn", title: "Find your way back", copy: "The menu takes you to Tube Plan, Order My Stock and Track Orders. You can replay this walkthrough using Quick guide on the home page." }
  ];
  const pageName = location.pathname.split("/").pop() || "index.html";
  if (!steps.some(step => step.page === pageName)) return;
  const dialog = document.createElement("dialog");
  dialog.id = "homeIntroDialog";
  dialog.className = "site-guide-dialog";
  dialog.setAttribute("aria-labelledby", "homeIntroTitle");
  dialog.setAttribute("aria-describedby", "homeIntroDescription");
  dialog.innerHTML = `
    <div class="site-guide-spotlight" aria-hidden="true" hidden></div>
    <section class="site-guide-panel">
      <div class="site-guide-top"><span id="homeIntroProgress"></span><button type="button" id="skipHomeIntroBtn">Skip</button></div>
      <div class="site-guide-copy" tabindex="0" aria-live="polite" aria-atomic="true"><h2 id="homeIntroTitle"></h2><p id="homeIntroDescription"></p></div>
      <div class="site-guide-actions"><button type="button" id="backHomeIntroBtn">Back</button><button type="button" id="nextHomeIntroBtn">Next</button></div>
    </section>`;
  document.body.append(dialog);
  const panel = dialog.querySelector(".site-guide-panel");
  const spotlight = dialog.querySelector(".site-guide-spotlight");
  const back = dialog.querySelector("#backHomeIntroBtn");
  const next = dialog.querySelector("#nextHomeIntroBtn");
  let index = 0;
  let target = null;
  let cleanup = () => {};
  let trigger = null;
  let frame = 0;
  let touch = null;
  let finished = false;
  let adjustedScroll = false;

  function position() {
    if (!dialog.open) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const rect = target?.getBoundingClientRect();
    const visible = rect && rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < height;
    spotlight.hidden = !visible;
    if (visible) {
      Object.assign(spotlight.style, { left: `${Math.max(4, rect.left - 5)}px`, top: `${Math.max(4, rect.top - 5)}px`, width: `${Math.min(width - 8, rect.width + 10)}px`, height: `${Math.min(height - 8, rect.height + 10)}px` });
    }
    panel.style.width = "";
    let panelWidth = panel.getBoundingClientRect().width;
    let panelHeight = panel.getBoundingClientRect().height;
    let left = Math.max(12, Math.min(width - panelWidth - 12, visible ? rect.left : (width - panelWidth) / 2));
    const below = visible && height - rect.bottom >= panelHeight + 24;
    let top = visible && rect.top >= panelHeight + 24 ? rect.top - panelHeight - 16
      : below ? rect.bottom + 16 : height - panelHeight - 16;
    // In landscape, use space beside the target rather than covering it.
    if (visible && rect.top < panelHeight + 24 && !below) {
      const rightSpace = width - rect.right - 24;
      const leftSpace = rect.left - 24;
      if (Math.max(rightSpace, leftSpace) >= 240) {
        const useRight = rightSpace >= leftSpace;
        panel.style.width = `${Math.min(420, useRight ? rightSpace : leftSpace)}px`;
        panelWidth = panel.getBoundingClientRect().width;
        panelHeight = panel.getBoundingClientRect().height;
        left = useRight ? rect.right + 12 : rect.left - panelWidth - 12;
        top = Math.max(12, Math.min(height - panelHeight - 12, rect.top));
      } else if (!adjustedScroll && rect.height + panelHeight + 40 <= height) {
        adjustedScroll = true;
        const before = window.scrollY;
        window.scrollBy({ top: rect.top - 16, behavior: "instant" });
        if (window.scrollY !== before) {
          frame = requestAnimationFrame(position);
          return;
        }
      }
    }
    panel.style.left = `${left}px`;
    panel.style.top = `${Math.max(12, top)}px`;
  }

  function finish() {
    if (finished) return;
    finished = true;
    cleanup();
    target = null;
    document.body.classList.remove("site-guide-open");
    try { localStorage.setItem(storageKey, "done"); } catch { /* Storage is optional. */ }
    const url = new URL(location.href);
    url.searchParams.delete("guide");
    history.replaceState(history.state, "", url);
    (trigger?.isConnected ? trigger : document.querySelector("#openHomeIntroBtn, #menuToggleBtn"))?.focus({ preventScroll: true });
  }

  function show(number) {
    finished = false;
    adjustedScroll = false;
    const nextIndex = Math.max(0, Math.min(steps.length - 1, number));
    const step = steps[nextIndex];
    cleanup();
    cleanup = () => {};
    if (step.page !== pageName || (pageName === "index.html" && new URLSearchParams(location.search).has("tool"))) {
      location.assign(`./${step.page}?guide=${nextIndex}`);
      return;
    }
    index = nextIndex;
    const url = new URL(location.href);
    url.searchParams.set("guide", String(index));
    history.replaceState(history.state, "", url);
    dialog.querySelector("#homeIntroTitle").textContent = step.title;
    dialog.querySelector("#homeIntroDescription").textContent = step.copy;
    dialog.querySelector(".site-guide-copy").scrollTop = 0;
    dialog.querySelector("#homeIntroProgress").textContent = `${index + 1} of ${steps.length}`;
    back.disabled = index === 0;
    next.textContent = index === steps.length - 1 ? "Finish" : "Next";
    if (step.slide !== undefined) document.querySelectorAll("[data-hero-dot]")[step.slide]?.click();
    if (step.example) {
      const input = document.getElementById("searchInput");
      const original = input.value;
      input.value = "FBC";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      cleanup = () => { input.value = original; input.dispatchEvent(new Event("input", { bubbles: true })); };
    }
    if (step.planner) {
      const wasOpen = !document.getElementById("drawModal").hidden;
      window.openDrawModal?.();
      cleanup = () => { if (!wasOpen) window.closeDrawModal?.({ restoreFocus: false }); };
    }
    target = document.querySelector(step.target);
    target?.scrollIntoView({ block: "center", behavior: "instant" });
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("site-guide-open");
    next.focus({ preventScroll: true });
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(position);
  }
  document.getElementById("openHomeIntroBtn")?.addEventListener("click", event => { trigger = event.currentTarget; show(0); });
  const closeGuide = () => { dialog.close(); finish(); };
  dialog.querySelector("#skipHomeIntroBtn").addEventListener("click", closeGuide);
  back.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => index === steps.length - 1 ? closeGuide() : show(index + 1));
  dialog.addEventListener("close", finish);
  dialog.addEventListener("cancel", event => { event.preventDefault(); closeGuide(); });
  dialog.addEventListener("keydown", event => {
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); event.stopPropagation(); show(index + (event.key === "ArrowRight" ? 1 : -1)); }
    if (event.key === "Tab") {
      const controls = [...dialog.querySelectorAll("button:not(:disabled)")];
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  panel.addEventListener("touchstart", event => { touch = event.changedTouches[0]; }, { passive: true });
  panel.addEventListener("touchend", event => {
    const end = event.changedTouches[0];
    if (touch && end && Math.abs(end.screenX - touch.screenX) > 44 && Math.abs(end.screenX - touch.screenX) > Math.abs(end.screenY - touch.screenY)) show(index + (end.screenX < touch.screenX ? 1 : -1));
    touch = null;
  }, { passive: true });
  panel.addEventListener("touchcancel", () => { touch = null; }, { passive: true });
  window.addEventListener("resize", position);
  const resizeObserver = new ResizeObserver(() => {
    if (dialog.open) { cancelAnimationFrame(frame); frame = requestAnimationFrame(position); }
  });
  resizeObserver.observe(panel);
  window.addEventListener("scroll", () => { if (dialog.open) { cancelAnimationFrame(frame); frame = requestAnimationFrame(position); } }, { passive: true });
  const requested = new URLSearchParams(location.search).get("guide");
  if (requested !== null && /^\d+$/.test(requested) && Number(requested) < steps.length) show(Number(requested));
  else if (pageName === "index.html" && !new URLSearchParams(location.search).has("tool")) {
    let seen = false;
    try { seen = localStorage.getItem(storageKey) === "done"; } catch { /* Storage is optional. */ }
    if (!seen) show(0);
  }
})();
