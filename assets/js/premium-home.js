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

  carousel.querySelector("[data-hero-next]")?.addEventListener("click", () => showSlide(1));

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

  const guideButton = document.querySelector("#collectionGuideButton");
  const guidePanel = document.querySelector("#collectionGuidePanel");
  const guideClose = document.querySelector("#collectionGuideClose");

  const setGuideOpen = (isOpen) => {
    if (!guideButton || !guidePanel) return;
    guidePanel.hidden = !isOpen;
    guideButton.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) guideClose?.focus();
    else guideButton.focus();
  };

  guideButton?.addEventListener("click", () => setGuideOpen(guidePanel?.hidden));
  guideClose?.addEventListener("click", () => setGuideOpen(false));
})();
