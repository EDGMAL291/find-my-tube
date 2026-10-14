(() => {
  const carousel = document.querySelector("#homeHeroCarousel");
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
  let activeIndex = 0;
  let touchStartX = null;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    carousel.dataset.heroTone = slides[activeIndex].dataset.heroTone || "overview";
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
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
  }, { passive: true });
  carousel.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0]?.screenX ?? null;
    if (touchStartX !== null && touchEndX !== null && Math.abs(touchEndX - touchStartX) > 44) {
      showSlide(activeIndex + (touchEndX < touchStartX ? 1 : -1));
    }
    touchStartX = null;
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
