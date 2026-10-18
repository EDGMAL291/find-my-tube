(() => {
  const carousel = document.querySelector("#homeHeroCarousel");
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
  let activeIndex = 0;
  let touchStartX = null;
  let touchStartY = null;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    carousel.dataset.heroTone = slides[activeIndex].dataset.heroTone || "overview";
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.inert = !isActive;
    });
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", String(isActive));
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
    });
  });

  carousel.querySelectorAll("[data-hero-next]").forEach((control) => {
    control.addEventListener("click", () => showSlide(1));
  });

  carousel.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0]?.screenX ?? null;
    touchStartY = event.changedTouches[0]?.screenY ?? null;
  }, { passive: true });
  carousel.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0]?.screenX ?? null;
    const touchEndY = event.changedTouches[0]?.screenY ?? null;
    if (touchStartX !== null && touchEndX !== null && touchStartY !== null && touchEndY !== null
      && Math.abs(touchEndX - touchStartX) > 44 && Math.abs(touchEndX - touchStartX) > Math.abs(touchEndY - touchStartY)) {
      showSlide(activeIndex + (touchEndX < touchStartX ? 1 : -1));
    }
    touchStartX = null;
    touchStartY = null;
  }, { passive: true });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(activeIndex + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(activeIndex - 1);
    }
  });

  showSlide(activeIndex);

  const intro = document.getElementById("homeIntroDialog");
  const introStorageKey = "fmt-home-intro-v1";
  const introSteps = [
    ["Swipe to explore", "Swipe across the home screen to move between Find My Tube, Find My Test and Order My Stock. You can also use the dots below."],
    ["Open a section", "Choose Find My Tube for collection tubes, Find My Test to explore tests, or Order My Stock to request supplies. Open the section using its main button."],
    ["Keep your selections together", "Selected tests stay in your Tube Plan. Stock selections stay in your stock cart, where you can review and submit your request."]
  ];
  let introIndex = 0;
  let introTrigger = null;
  let introTouch = null;
  const introBack = document.getElementById("backHomeIntroBtn");
  const introNext = document.getElementById("nextHomeIntroBtn");
  const renderIntro = (index) => {
    introIndex = Math.max(0, Math.min(introSteps.length - 1, index));
    document.getElementById("homeIntroTitle").textContent = introSteps[introIndex][0];
    document.getElementById("homeIntroDescription").textContent = introSteps[introIndex][1];
    document.getElementById("homeIntroProgress").textContent = `${introIndex + 1} of ${introSteps.length}`;
    introBack.disabled = introIndex === 0;
    introNext.textContent = introIndex === introSteps.length - 1 ? "Get started" : "Next";
  };
  const openIntro = (trigger = null) => {
    if (!intro || intro.open) return;
    introTrigger = trigger;
    renderIntro(0);
    intro.showModal();
    document.body.classList.add("home-intro-open");
    introNext.focus({ preventScroll: true });
  };
  if (intro) {
    document.getElementById("openHomeIntroBtn")?.addEventListener("click", event => openIntro(event.currentTarget));
    document.getElementById("skipHomeIntroBtn").addEventListener("click", () => intro.close());
    introBack.addEventListener("click", () => renderIntro(introIndex - 1));
    introNext.addEventListener("click", () => {
      if (introIndex === introSteps.length - 1) intro.close();
      else renderIntro(introIndex + 1);
    });
    intro.addEventListener("close", () => {
      document.body.classList.remove("home-intro-open");
      try { localStorage.setItem(introStorageKey, "done"); } catch { /* Browsing still works when storage is unavailable. */ }
      (introTrigger || carousel).focus({ preventScroll: true });
    });
    intro.addEventListener("keydown", event => {
      if (event.key === "Tab") {
        const controls = Array.from(intro.querySelectorAll("button:not(:disabled)"));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      renderIntro(introIndex + (event.key === "ArrowRight" ? 1 : -1));
    });
    intro.addEventListener("touchstart", event => {
      const touch = event.changedTouches[0];
      introTouch = touch ? { x: touch.screenX, y: touch.screenY } : null;
    }, { passive: true });
    intro.addEventListener("touchend", event => {
      const touch = event.changedTouches[0];
      if (introTouch && touch) {
        const dx = touch.screenX - introTouch.x;
        const dy = touch.screenY - introTouch.y;
        if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) renderIntro(introIndex + (dx < 0 ? 1 : -1));
      }
      introTouch = null;
    }, { passive: true });
    intro.addEventListener("touchcancel", () => { introTouch = null; }, { passive: true });
    let introSeen = false;
    try { introSeen = localStorage.getItem(introStorageKey) === "done"; } catch { /* Show the guide without requiring storage. */ }
    const isHomeLanding = !new URLSearchParams(window.location.search).get("tool")
      && !document.body.classList.contains("find-my-test-page");
    if (isHomeLanding && !introSeen) openIntro();
  }

  const labDeskPanel = document.querySelector("#homeLabDeskPanel");
  const labDeskClose = document.querySelector("#homeLabDeskClose");
  const labDeskBackdrop = document.querySelector("#homeLabDeskBackdrop");
  const menuToggleButton = document.querySelector("#menuToggleBtn");
  const collectionDeskRequested = new URLSearchParams(window.location.search).get("tool") === "collection-desk";

  const setLabDeskOpen = (isOpen, { restoreFocus = true } = {}) => {
    if (!labDeskPanel || !labDeskBackdrop) return;
    labDeskPanel.hidden = !isOpen;
    labDeskBackdrop.hidden = !isOpen;
    document.body.classList.toggle("is-home-lab-desk-open", isOpen);
    if (typeof window.updateMenuActiveState === "function") {
      window.updateMenuActiveState();
    }
    if (isOpen) {
      window.requestAnimationFrame(() => labDeskClose?.focus({ preventScroll: true }));
    } else if (restoreFocus) {
      menuToggleButton?.focus({ preventScroll: true });
      if (new URLSearchParams(window.location.search).get("tool") === "collection-desk") {
        window.history.replaceState({}, "", "./index.html");
      }
    }
  };

  window.openCollectionDesk = () => setLabDeskOpen(true, { restoreFocus: false });
  labDeskClose?.addEventListener("click", () => setLabDeskOpen(false));
  labDeskBackdrop?.addEventListener("click", () => setLabDeskOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!labDeskPanel?.hidden) setLabDeskOpen(false);
  });

  if (collectionDeskRequested) {
    setLabDeskOpen(true, { restoreFocus: false });
  }
})();
