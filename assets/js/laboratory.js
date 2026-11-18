(() => {
/* Shared, local-only 3D laboratory. Clinical workflows stay in their native DOM. */
const stations = [
  ['home', 'Laboratory', './index.html', 'Your collection workspace', [0, 8, 15]],
  ['tube', 'Find My Tube', './find-my-tube.html', 'Identify specimens at the tube bench', [-5, 5, 9]],
  ['test', 'Find My Test', './index.html?tool=find-my-test', 'Explore tests at the clinical workstation', [0, 5, 8]],
  ['plan', 'Tube Plan', './find-my-tube.html?lab=plan', 'Prepare your collection tray', [-2, 4, 7]],
  ['stock', 'Order My Stock', './order-stock.html', 'Select supplies from the laboratory shelves', [7, 5, 10]],
  ['track', 'Track Orders', './track-orders.html', 'Follow requests through dispatch', [5, 5, 8]],
  ['dashboard', 'Lab Dashboard', './stock-dashboard.html', 'Manage requests and inventory', [-7, 5, 10]]
];
const page = document.body.dataset.appPage;
function currentStation() {
  if (document.body.classList.contains('find-my-test-page') || new URLSearchParams(location.search).get('tool') === 'find-my-test') return 'test';
  if (new URLSearchParams(location.search).get('lab') === 'plan') return 'plan';
  return ({'find-my-tube':'tube','find-my-test-page':'test','tube-plan-page':'plan','stock-order':'stock','track-orders':'track','stock-dashboard':'dashboard'})[page] || 'home';
}
const stage = document.createElement('section');
stage.className = 'laboratory-stage';
stage.setAttribute('aria-label', 'Interactive laboratory');
stage.innerHTML = `<div class="laboratory-heading"><p class="laboratory-eyebrow">FIND MY TUBE / THE LABORATORY</p><h2></h2><p class="laboratory-caption"></p></div><div class="laboratory-viewport"></div><nav class="laboratory-nav" aria-label="Laboratory stations">${stations.map(([id,label,url])=>`<a data-station="${id}" href="${url}">${label}</a>`).join('')}</nav><div class="laboratory-controls"><button type="button" class="laboratory-motion">Pause motion</button><button type="button" class="laboratory-view">Hide 3D</button><button type="button" class="laboratory-plan" hidden>Open Tube Plan</button><span class="laboratory-status" role="status"></span></div>`;
document.querySelector('.container > .header')?.after(stage);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
let hidden = false;
try { hidden = localStorage.getItem('fmt-lab-hidden') === 'true'; } catch { /* Storage is optional. */ }
let renderScene = () => {};
let selectScene = () => {};
const motionButton = stage.querySelector('.laboratory-motion');
const viewButton = stage.querySelector('.laboratory-view');
const planButton = stage.querySelector('.laboratory-plan');
planButton.onclick = () => window.findMyTubeApp?.openDrawPlan();
function updateControls() {
  motionButton.textContent = paused ? 'Enable motion' : 'Pause motion';
  motionButton.setAttribute('aria-pressed', String(paused));
  viewButton.textContent = hidden ? 'Show 3D' : 'Hide 3D';
  viewButton.setAttribute('aria-expanded', String(!hidden));
  stage.classList.toggle('is-collapsed', hidden);
}
motionButton.onclick = () => { paused = !paused; updateControls(); renderScene(); };
reduced.addEventListener('change', () => { paused = reduced.matches; updateControls(); renderScene(); });
viewButton.onclick = () => { hidden = !hidden; try { localStorage.setItem('fmt-lab-hidden', String(hidden)); } catch { /* Storage is optional. */ } updateControls(); if (!hidden) boot(); renderScene(); };
let activeStation;
function updateStation() {
  const id = currentStation();
  if (id === activeStation) return;
  activeStation = id;
  planButton.hidden = id !== 'plan' || typeof window.findMyTubeApp?.openDrawPlan !== 'function';
  const station = stations.find(s => s[0] === id);
  stage.querySelector('h2').textContent = station[1];
  stage.querySelector('.laboratory-caption').textContent = station[3];
  stage.querySelectorAll('[data-station]').forEach(a => { if (a.dataset.station === id) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  selectScene(id);
}
new MutationObserver(updateStation).observe(document.body, {attributes:true, attributeFilter:['class']});
updateControls(); updateStation();
let started = false;
async function boot() {
  if (started || hidden) return;
  started = true;
  const status = stage.querySelector('.laboratory-status');
  try {
    status.textContent = 'Loading 3D…';
    const T = await import('../vendor/three/three.module.min.js');
    const renderer = new T.WebGLRenderer({antialias:true, alpha:false, powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0x071a25);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    const viewport = stage.querySelector('.laboratory-viewport');
    viewport.append(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden','true');
    const scene = new T.Scene();
    scene.fog = new T.Fog(0x071a25, 22, 48);
    const camera = new T.PerspectiveCamera(43,1,.1,100);
    camera.position.set(0,8,15);
    scene.add(new T.HemisphereLight(0xc7f5ff,0x233849,3));
    const key = new T.DirectionalLight(0xffe4ba,4); key.position.set(5,12,8); scene.add(key);
    const blue = new T.PointLight(0x54d8e0,50); blue.position.set(-5,4,-2); scene.add(blue);
    const mat = (color, extra={}) => new T.MeshStandardMaterial({color,roughness:.38,metalness:.25,...extra});
    const white = mat(0xc9d9db), steel=mat(0x314d5b), dark=mat(0x102c3b), teal=mat(0x7fe2da,{emissive:0x235b59});
    function box(parent,x,y,z,w,h,d,material) {const m=new T.Mesh(new T.BoxGeometry(w,h,d),material);m.position.set(x,y,z);parent.add(m);return m;}
    function cylinder(parent,x,y,z,r,h,material) {const m=new T.Mesh(new T.CylinderGeometry(r,r,h,24),material);m.position.set(x,y,z);parent.add(m);return m;}
    box(scene,0,-.25,0,26,.4,18,dark);
    const grid = new T.GridHelper(26,26,0x426473,0x1a3847); grid.position.y=-.03;scene.add(grid);
    box(scene,0,3,-5,24,6,.2,mat(0x163442));
    for(let x=-10;x<=10;x+=4) {box(scene,x,3,-4.85,.035,5.8,.05,steel);box(scene,x,5.5,-4.7,2.8,.035,.06,teal);}
    const objects = [];
    const locations = {tube:[-5,0,0],test:[0,0,-2],plan:[-1.8,0,1.4],stock:[7,0,-2],track:[5,0,2],dashboard:[-8,0,-2.5]};
    const colors=[0xa184dd,0x69c7f1,0xe4ba58,0xe77c83,0x83cda6,0xb6bdc4];
    function tube(parent,x,y,z,color) {
      const glass=mat(0xc5f2f4,{transparent:true,opacity:.38,metalness:.05,roughness:.12});
      cylinder(parent,x,y+.5,z,.115,1,glass);
      const bottom = new T.Mesh(new T.SphereGeometry(.115,16,8),glass);bottom.position.set(x,y,z);parent.add(bottom);
      cylinder(parent,x,y+.98,z,.14,.22,mat(color));
      box(parent,x,y+.45,z+.116,.14,.4,.012,white);
      cylinder(parent,x,y+.15,z,.085,.28,mat(0xa62c48));
    }
    const planTubes = new T.Group();
    for(const [id,label,url] of stations.slice(1)) {
      const g=new T.Group();g.position.set(...locations[id]);scene.add(g);
      box(g,0,1.6,0,3,.16,1.65,white);
      for(const x of [-1.25,1.25]) for(const z of [-.6,.6])box(g,x,.78,z,.08,1.5,.08,steel);
      const ring = new T.Mesh(new T.TorusGeometry(1.8,.025,8,64),teal);ring.rotation.x=-Math.PI/2;ring.position.y=.015;g.add(ring);
      if(id==='tube'||id==='plan') {
        box(g,0,1.86,0,2.4,.13,.85,steel);
        if (id === 'plan') g.add(planTubes);
        else for(let i=0;i<6;i++) tube(g,-.95+i*.38,1.94,0,colors[i]);
      } else if(id==='test'||id==='dashboard') {
        box(g,0,2.55,-.25,2.1,1.25,.12,dark);box(g,0,2.55,-.175,1.92,1.06,.03,mat(0x2a6c7b,{emissive:0x16444e}));
        box(g,0,1.95,-.25,.1,.55,.1,steel);box(g,0,1.73,.3,1.4,.06,.45,steel);
        for(let i=0;i<4;i++) box(g,-.65+i*.43,2.35,-.145,.2,.22+i*.1,.02,teal);
      } else if(id==='stock') {
        for(let j=0;j<3;j++) {box(g,0,2+j*.8,-.3,2.9,.07,1,steel);for(let i=0;i<4;i++)box(g,-1+i*.65,2.3+j*.8,-.3,.48,.5,.5,mat(colors[(i+j)%6]));}
        for(const x of [-1.45,1.45])box(g,x,2.8,-.3,.07,2.5,.7,steel);
      } else {
        for(let i=0;i<3;i++)box(g,-.8+i*.8,1.95,0,.65,.55,.65,mat(0xbd9a6a));
        for(let i=0;i<9;i++){const roller=cylinder(g,-1.2+i*.3,1.76,0,.065,1.4,steel);roller.rotation.x=Math.PI/2;}
      }
      const anchor=new T.Vector3(g.position.x,4.1,g.position.z);
      const link=document.createElement('a');link.className='laboratory-marker';link.href=url;link.textContent=label;viewport.append(link);
      g.userData.station = link;
      objects.push({id,g,ring,link,anchor});
    }
    const meshes = objects.map(object => object.g);
    const raycaster = new T.Raycaster();
    const pointer = new T.Vector2();
    function pickStation(event) {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.set(
        (event.clientX - bounds.left) / bounds.width * 2 - 1,
        -(event.clientY - bounds.top) / bounds.height * 2 + 1
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(meshes, true).find(({object}) => object.visible);
      let node = hit?.object;
      while (node && !node.userData.station) node = node.parent;
      return node?.userData.station;
    }
    renderer.domElement.addEventListener('click', event => pickStation(event)?.click());
    renderer.domElement.addEventListener('pointermove', event => {
      renderer.domElement.style.cursor = pickStation(event) ? 'pointer' : '';
    });
    function renderPlan() {
      const app = window.findMyTubeApp;
      if (activeStation !== 'plan' || !app) return;
      const tests = app.getTestsByNames(app.getSelectedTestNames());
      const {plan} = app.getResolvedDrawPlan(tests);
      // Show a neutral slot for each collection item. The existing planner gives exact quantities,
      // collection types and alternatives, including specimens that don't use a tube.
      while (planTubes.children.length) {
        const mesh = planTubes.children[0];
        mesh.geometry.dispose();
        planTubes.remove(mesh);
      }
      plan.items.slice(0, 12).forEach((_, index) => {
        box(planTubes, -.95 + (index % 6) * .38, 1.96, index < 6 ? .22 : -.22, .24, .09, .24, teal);
      });
      renderScene();
    }
    const drawGroups = document.getElementById('drawGroups');
    if (drawGroups) new MutationObserver(renderPlan).observe(drawGroups, {childList: true});
    let target = new T.Vector3(...stations.find(s=>s[0]===currentStation())[4]);
    let aim = new T.Vector3(0,1.3,0);
    selectScene = id => {target.set(...stations.find(s=>s[0]===id)[4]); aim.set(...(locations[id]||[0,1.3,0]));aim.y=1.6;objects.forEach(o=>o.ring.visible=o.id===id);renderScene();};
    let width=0,height=0, frame=0;
    function draw() {
      frame=0;
      if(hidden || document.hidden) return;
      const w=viewport.clientWidth,h=viewport.clientHeight;
      if(!w || !h)return;
      if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
      const destination=target.clone(); if(w<600)destination.multiplyScalar(1.25);
      if(paused)camera.position.copy(destination);else camera.position.lerp(destination,.07);
      camera.lookAt(aim);
      camera.updateMatrixWorld();
      for(const o of objects){const p=o.anchor.clone().project(camera);o.link.style.left=`${(p.x+1)*w/2}px`;o.link.style.top=`${(-p.y+1)*h/2}px`;o.link.hidden=(w<600 && o.id!==activeStation)||p.z>1||Math.abs(p.x)>.9||Math.abs(p.y)>.64;}
      renderer.render(scene,camera);
      if(!paused && camera.position.distanceTo(destination)>.005)frame=requestAnimationFrame(draw);
    }
    renderScene=()=>{if(!frame)frame=requestAnimationFrame(draw);};
    new ResizeObserver(renderScene).observe(viewport);
    document.addEventListener('visibilitychange',renderScene);
    renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();status.textContent='3D paused. All laboratory tools remain available.';});
    renderer.domElement.addEventListener('webglcontextrestored', () => {
      status.textContent = '';
      renderScene();
    });
    selectScene(currentStation());
    renderPlan();
    document.documentElement.classList.add('laboratory-ready');
    status.textContent = '';
  } catch (error) {
    status.textContent='Standard view · All laboratory tools available';
    stage.classList.add('laboratory-fallback');
    motionButton.hidden=true;
    console.warn('Laboratory view unavailable:', error.message);
  }
}
boot();
})();
