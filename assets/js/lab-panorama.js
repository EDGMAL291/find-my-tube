/* One laboratory, with a camera that follows the current workspace. */
(() => {
  const page = document.body.dataset.appPage;
  const pageFocus = {
    home: 'overview', 'find-my-tube': 'tubes', 'find-my-test-page': 'tests',
    'stock-order': 'stock', 'track-orders': 'dispatch', 'stock-dashboard': 'operations',
    'tube-plan-page': 'plan'
  }[page];
  if (!pageFocus) return;

  const imageUrl = new URL('../images/lab-panorama-20261014.webp', document.currentScript.src).href;
  const areas = {
    overview: { x: .5, y: .5, zoom: 1 },
    tubes: { x: .12, y: .57, zoom: 2.3 },
    tests: { x: .46, y: .34, zoom: 2.3 },
    stock: { x: .92, y: .51, zoom: 2.1 },
    dispatch: { x: .8, y: .27, zoom: 2.2 },
    operations: { x: .6, y: .19, zoom: 2.2 },
    collection: { x: .16, y: .28, zoom: 2.2 },
    plan: { x: .49, y: .565, zoom: 1.65 }
  };
  const cameras = [];
  const makeCamera = (host) => {
    const camera = document.createElement('img');
    camera.className = 'lab-scene-camera';
    camera.alt = '';
    camera.src = imageUrl;
    camera.decoding = 'async';
    const shade = document.createElement('div');
    shade.className = 'lab-scene-shade';
    host.append(camera, shade);
    const entry = { host, camera, focus: 'overview' };
    cameras.push(entry);
    camera.addEventListener('load', () => renderCamera(entry));
    return entry;
  };
  const renderCamera = (entry) => {
    const { host, camera } = entry;
    const area = areas[entry.focus] || areas.overview;
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    const ratio = camera.naturalWidth / camera.naturalHeight || 1.5;
    const imageWidth = Math.max(width, height * ratio);
    const imageHeight = imageWidth / ratio;
    const zoom = area.zoom;
    const limitX = (imageWidth * zoom - width) / 2;
    const limitY = (imageHeight * zoom - height) / 2;
    const x = Math.max(-limitX, Math.min(limitX, (.5 - area.x) * imageWidth * zoom));
    const y = Math.max(-limitY, Math.min(limitY, (.5 - area.y) * imageHeight * zoom));
    camera.style.width = `${imageWidth}px`;
    camera.style.height = `${imageHeight}px`;
    camera.style.left = `${(width - imageWidth) / 2}px`;
    camera.style.top = `${(height - imageHeight) / 2}px`;
    camera.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
    host.dataset.labFocus = entry.focus;
  };

  const world = document.createElement('div');
  world.className = 'lab-world-scene';
  world.setAttribute('aria-hidden', 'true');
  document.body.prepend(world);
  document.body.classList.add('lab-panorama-enabled');
  const worldCamera = makeCamera(world);
  const panorama = document.getElementById('homeLabPanorama');
  const heroCamera = panorama ? makeCamera(panorama) : null;
  const carousel = document.getElementById('homeHeroCarousel');
  const drawModal = document.getElementById('drawModal');
  const collectionBackdrop = document.getElementById('homeLabDeskBackdrop');
  if (collectionBackdrop) {
    const collectionCamera = makeCamera(collectionBackdrop);
    collectionCamera.focus = 'collection';
  }
  let plannerCamera = null;
  if (drawModal) {
    const background = document.createElement('div');
    background.className = 'lab-modal-scene';
    background.setAttribute('aria-hidden', 'true');
    drawModal.prepend(background);
    plannerCamera = makeCamera(background);
    plannerCamera.focus = 'plan';
  }

  const updateFocus = () => {
    const heroFocus = { overview: 'overview', lavender: 'tubes', gold: 'tests', serum: 'stock' }[carousel?.dataset.heroTone] || pageFocus;
    let focus = document.body.classList.contains('find-my-test-page') ? 'tests' : heroFocus;
    if (document.body.classList.contains('is-home-lab-desk-open')) focus = 'collection';
    if (drawModal && !drawModal.hidden) focus = 'plan';
    worldCamera.focus = focus;
    if (heroCamera) heroCamera.focus = heroFocus;
    cameras.forEach(renderCamera);
  };
  const observer = new MutationObserver(updateFocus);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  if (carousel) observer.observe(carousel, { attributes: true, attributeFilter: ['data-hero-tone'] });
  if (drawModal) observer.observe(drawModal, { attributes: true, attributeFilter: ['hidden'] });
  const resizeObserver = new ResizeObserver(() => cameras.forEach(renderCamera));
  cameras.forEach(({ host }) => resizeObserver.observe(host));
  // Paint the overview first so entering a workspace feels like approaching its bench.
  cameras.forEach(renderCamera);
  requestAnimationFrame(() => requestAnimationFrame(updateFocus));
})();
