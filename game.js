import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.querySelector('#game-canvas');
const shell = document.querySelector('#game-shell');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9dce1');
scene.fog = new THREE.Fog('#b9e2e4', 25, 115);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .1, 180);
camera.position.set(0, 7.3, 12.8);
camera.lookAt(0, 1.2, -15);
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.17;
scene.add(new THREE.HemisphereLight(0xe4ffff, 0x7d6854, 2.25));
const sun = new THREE.DirectionalLight(0xfff0cf, 3.1); sun.position.set(-7, 15, 8); sun.castShadow = true;
sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.left=-18; sun.shadow.camera.right=18; sun.shadow.camera.top=20; sun.shadow.camera.bottom=-24; scene.add(sun);
const fill = new THREE.DirectionalLight(0x74c9e8, 1.3); fill.position.set(6,5,-12); scene.add(fill);
const mat = (color, roughness=.8, metalness=0) => new THREE.MeshStandardMaterial({color,roughness,metalness});
const M={asphalt:mat('#35444b'),rail:mat('#aeb9b5',.34,.66),dark:mat('#1d2c35'),concrete:mat('#8b9b95'),yellow:mat('#ffd340'),red:mat('#ed413a'),blue:mat('#437e9b'),cream:mat('#f2e7ca'),white:mat('#fffaf0'),black:mat('#191a1c'),skin:mat('#ffbd88'),pink:mat('#e98779'),green:mat('#478d6c'),leaf:mat('#418a70'),building:mat('#7ca5a6'),building2:mat('#d39e75'),window:mat('#b4dde0',.38),shiro:mat('#fff9ec'),coin:mat('#ffcf35',.26,.68)};
function mesh(geo, material, parent, x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(parent,w,h,d,material,x,y,z){return mesh(new THREE.BoxGeometry(w,h,d),material,parent,x,y,z)}
function sphere(parent,r,material,x,y,z,sx=1,sy=1,sz=1){const m=mesh(new THREE.SphereGeometry(r,16,12),material,parent,x,y,z);m.scale.set(sx,sy,sz);return m}
function cylinder(parent,rt,rb,h,material,x,y,z,segments=12){return mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material,parent,x,y,z)}

// Track bed, steel rails and ties.
const track = new THREE.Group(); scene.add(track);
box(track,9,.5,180,M.asphalt,0,-.55,-48);
for(const x of [-1.52,1.52]){box(track,.16,.17,180,M.rail,x,-.25,-48);box(track,.38,.28,180,M.dark,x,-.43,-48)}
for(let i=0;i<32;i++){const tie=box(track,5.6,.14,.42,i%2?M.concrete:M.dark,0,-.29,8-i*5.5);tie.userData.tie=true;}
for(const x of [-4.6,4.6])box(track,.28,.7,180,M.concrete,x,-.24,-48);
// Urban station backplate and distant skyline.
const world = new THREE.Group();scene.add(world);
const buildingMats=[M.building,M.building2,mat('#a8b8a5'),mat('#648b92'),mat('#ccaa83')];
for(let side of [-1,1]){
  for(let i=0;i<17;i++){
    const z=-8-i*8.6, h=5+((i*13)%7), w=3.4+((i*7)%3)*.35, x=side*(8.1+((i*11)%4)*.72);
    const b=new THREE.Group();world.add(b);b.position.set(x,h/2-.2,z);
    box(b,w,h,4.7,buildingMats[i%buildingMats.length],0,0,0);
    box(b,w+.16,.24,4.84,mat(i%2?'#e7d4ae':'#55767a'),0,h/2-.16,0);
    const winmat=i%3===0?mat('#e3c88a',.42):M.window;
    for(let row=0;row<Math.floor(h/1.35);row++)for(let col=0;col<2;col++)box(b,.55,.62,.06,winmat,(col-.5)*1.3,-h/2+.9+row*1.22,2.39);
    // roof vent and awning detail
    if(i%3===0)box(b,.7,.5,.75,M.dark,0,h/2+.28,-.35);
  }
}
// Station canopy in the middle distance.
const station = new THREE.Group();scene.add(station);station.position.set(0,0,-28);
box(station,11,.36,9,mat('#e9d8b0'),0,5.6,0);box(station,11,.22,9,mat('#2a5963'),0,5.34,0);
for(let x of [-5,5]){box(station,.3,5.5,.34,M.dark,x,2.55,0);box(station,.42,.3,.45,M.yellow,x,4.9,0)}
box(station,6,1.15,.22,mat('#164759'),0,4.55,4.56);
// trees, lamps and platform details
const scenery=[];
for(let i=0;i<12;i++){
 for(let side of [-1,1]){
  const g=new THREE.Group();scene.add(g);g.position.set(side*(6.3+(i%2)*.7),0,-5-i*11);scenery.push(g);
  cylinder(g,.12,.19,2.5,mat('#795a3a'),0,1.15,0);
  sphere(g,1.02,M.leaf,0,2.65,0,1,.95,.9);sphere(g,.7,mat('#559777'),-.42,3.15,.1,1,1,1);
  if(i%2===0){cylinder(g,.055,.07,4.1,M.dark,side*.8,2.0,0);box(g,.62,.18,.26,M.yellow,side*.8,4.0,0);}
 }
}
// Colored line markers along the track edge.
for(let s of [-1,1])for(let i=0;i<15;i++){
 const p=box(world,.13,.55,.25,i%2?M.yellow:M.red,s*4.3,.04,-6-i*10);p.userData.marker=true;
}

// Shinchan: playful, chunky hand-built character.
function makeShinchan(){
 const root=new THREE.Group();scene.add(root);
 const body=new THREE.Group();root.add(body);body.position.y=.08;
 // little legs and bright yellow shoes
 for(const s of [-1,1]){
   const leg=cylinder(body,.15,.17,.48,mat('#e7c7a2'),s*.27,.62,0,12);leg.rotation.x=-.06;
   const shoe=sphere(body,.19,M.yellow,s*.28,.31,.11,1.28,.68,1.3);shoe.rotation.y=s*.08;
   const sock=cylinder(body,.12,.12,.17,M.cream,s*.27,.5,0,12);
 }
 // red shirt torso, hands, collar
 const torso=sphere(body,.44,M.red,0,1.08,0,.91,1.05,.68);
 box(body,.4,.15,.4,M.red,0,1.42,0);
 for(const s of [-1,1]){
   const arm=cylinder(body,.115,.14,.57,M.skin,s*.48,1.1,.02,12);arm.rotation.z=s*.48;arm.rotation.x=-.1;
   sphere(body,.15,M.skin,s*.66,.85,.05,1,1,.9);
 }
 // neck + oversized round head
 cylinder(body,.16,.18,.26,M.skin,0,1.62,0);
 sphere(body,.64,M.skin,0,2.15,0,1.04,1.03,.86);
 // iconic cap of black bowl-cut hair with scalloped edge
 sphere(body,.63,M.black,0,2.58,-.025,1.08,.61,.92);
 for(let i=-2;i<=2;i++){sphere(body,.18,M.black,i*.22,2.28,.47,1.05,.8,.55)}
 // ears, eyebrows and expressive eyes
 for(const s of [-1,1]){
   sphere(body,.15,M.skin,s*.61,2.08,-.02,1,.88,.65);
   sphere(body,.08,M.black,s*.21,2.19,.67,.8,1.2,.7);
   sphere(body,.035,M.white,s*.22,2.22,.72,.7,1,.45);
 }
 // nose and grin
 sphere(body,.085,mat('#ef916e'),0,2.02,.76,1,.72,.65);
 const smile=mesh(new THREE.TorusGeometry(.14,.025,6,16,Math.PI),M.black,body,0,1.84,.695);smile.rotation.z=Math.PI;
 // brows
 for(const s of [-1,1]){const brow=box(body,.18,.045,.045,M.black,s*.2,2.39,.69);brow.rotation.z=s*.1}
 return {root,body};
}
// Shiro, the little fluffy white companion.
function makeShiro(){
 const root=new THREE.Group();scene.add(root);const body=new THREE.Group();root.add(body);
 sphere(body,.44,M.shiro,0,.59,0,1.14,.86,1.08);
 sphere(body,.35,M.shiro,0,.91,-.03,1,.91,.92);
 for(const s of [-1,1]){
   const ear=sphere(body,.17,M.shiro,s*.31,.99,-.01,1.15,.58,.7);ear.rotation.z=s*-.35;
   sphere(body,.045,M.black,s*.13,.91,.285,.8,1,.55);
   sphere(body,.025,M.white,s*.14,.925,.309,.65,1,.5);
   const leg=cylinder(body,.105,.12,.35,M.shiro,s*.25,.24,.05,10);leg.rotation.z=s*.1;
 }
 sphere(body,.08,M.black,0,.79,.34,1,.72,.72);
 const tail=sphere(body,.16,M.shiro,0,.65,-.48,.65,.7,1.8);tail.rotation.x=.35;
 for(let i=0;i<3;i++)sphere(body,.06,M.shiro,-.12+i*.12,.55,.42,1.1,1,.8);
 return {root,body};
}
const shin=makeShinchan(), shiro=makeShiro();
shin.root.position.set(-.6,0,0);shiro.root.position.set(.9,0,.45);

// Repeating obstacle and collectible field. Obstacles approach along the rails.
const entities=[];
function addCoin(lane,z,y=1.45){
 const g=new THREE.Group();scene.add(g);g.position.set([-2.35,0,2.35][lane],y,z);
 const c=mesh(new THREE.TorusGeometry(.34,.105,10,20),M.coin,g);c.rotation.y=Math.PI/2;
 const inner=sphere(g,.13,M.yellow,0,0,0,.35,1,.35);entities.push({kind:'coin',group:g,spin:c});
}
function addBarrier(lane,z){
 const g=new THREE.Group();scene.add(g);g.position.set([-2.35,0,2.35][lane],0,z);
 box(g,1.48,.82,.62,M.yellow,0,.72,0);box(g,1.52,.23,.7,M.red,0,1.12,0);
 for(let x of [-.43,.43])box(g,.1,.76,.72,M.red,x,.72,.01);
 box(g,.18,.18,.75,M.cream,0,.73,.02);
 entities.push({kind:'barrier',group:g});
}
function addTrain(lane,z){
 const g=new THREE.Group();scene.add(g);g.position.set([-2.35,0,2.35][lane],0,z);
 const tm=lane===1?mat('#3b8991'):mat('#e28a50');
 box(g,1.88,2.5,5.2,tm,0,1.4,0);box(g,1.94,.18,5.25,M.cream,0,2.66,0);box(g,1.94,.34,5.26,M.dark,0,.22,0);
 box(g,1.72,.24,.08,M.yellow,0,.38,2.64);
 for(let zz of [-1.5,-.35,.8,1.95]){box(g,.65,.74,.08,M.window,0,1.75,zz);box(g,.08,.8,.1,M.dark,0,1.75,zz+.05)}
 for(let x of [-.7,.7])for(let zz of [-1.7,1.7])cylinder(g,.25,.25,.14,M.dark,x,.22,zz,14).rotation.x=Math.PI/2;
 entities.push({kind:'train',group:g});
}
let nextSpawn=-21;
function spawnPattern(){
 while(nextSpawn>-90){nextSpawn-=11.5;const r=Math.random();const lane=Math.floor(Math.random()*3);
  if(r<.25){addTrain(lane,nextSpawn);for(let n=0;n<5;n++)addCoin((lane+1)%3,nextSpawn-1.6-n*.95,1.5)}
  else if(r<.56){addBarrier(lane,nextSpawn);for(let n=0;n<5;n++)addCoin((lane+1)%3,nextSpawn-1-n,1.5)}
  else {for(let n=0;n<6;n++)addCoin(lane,nextSpawn-n*1.15,1.45+(n===2? .7:0)); if(r>.83)addBarrier((lane+2)%3,nextSpawn-2)}
 }
}
spawnPattern();

let state='menu', lane=1, distance=0, coinCount=0, speed=19, jumpTime=0, slideTime=0, invuln=0;
let best=Number(localStorage.getItem('raildash-best')||0), last=performance.now(), elapsed=0, soundOn=false;
const ui={distance:document.querySelector('#distance'),coins:document.querySelector('#coins'),best:document.querySelector('#best'),intro:document.querySelector('#intro-screen'),result:document.querySelector('#result-screen'),pause:document.querySelector('#pause-screen'),finalDist:document.querySelector('#final-distance'),finalCoins:document.querySelector('#final-coins'),finalBest:document.querySelector('#final-best'),toast:document.querySelector('#toast')};
ui.best.textContent=best;
function setToast(text){ui.toast.textContent=text;ui.toast.classList.add('show');setTimeout(()=>ui.toast.classList.remove('show'),900)}
function startGame(){
 entities.forEach(e=>scene.remove(e.group));entities.length=0;nextSpawn=-21;spawnPattern();
 state='playing';lane=1;distance=0;coinCount=0;speed=19;jumpTime=0;slideTime=0;invuln=0;elapsed=0;
 shin.root.position.set(0,0,0);shiro.root.position.set(.92,0,.45);shin.body.scale.y=1;
 ui.distance.textContent='000';ui.coins.textContent='0';ui.intro.classList.add('hidden');ui.result.classList.add('hidden');ui.pause.classList.add('hidden');shell.classList.add('playing');
}
function finishGame(){if(state!=='playing')return;state='over';const d=Math.floor(distance);if(d>best){best=d;localStorage.setItem('raildash-best',best)}ui.best.textContent=best;ui.finalDist.innerHTML=`${d}<small>m</small>`;ui.finalCoins.textContent=coinCount;ui.finalBest.innerHTML=`${best}<small>m</small>`;ui.result.classList.remove('hidden');shell.classList.remove('playing')}
function pauseGame(){if(state==='playing'){state='paused';ui.pause.classList.remove('hidden');shell.classList.remove('playing')}}
function resumeGame(){if(state==='paused'){state='playing';ui.pause.classList.add('hidden');shell.classList.add('playing');last=performance.now()}}
function action(a){if(state!=='playing')return;
 if(a==='left')lane=Math.max(0,lane-1);if(a==='right')lane=Math.min(2,lane+1);
 if(a==='up'&&jumpTime<=0&&slideTime<=0){jumpTime=.78;setToast('NICE HOP!')}
 if(a==='down'&&jumpTime<=0){slideTime=.62;setToast('SLIDE!')}
}
window.addEventListener('keydown',e=>{const key=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup','arrowdown',' ','a','d','w','s'].includes(key))e.preventDefault();if(key==='arrowleft'||key==='a')action('left');else if(key==='arrowright'||key==='d')action('right');else if(key==='arrowup'||key==='w'||key===' ')action('up');else if(key==='arrowdown'||key==='s')action('down');else if(key==='escape'||key==='p'){state==='paused'?resumeGame():pauseGame()}else if(key==='enter'&&(state==='menu'||state==='over'))startGame()});
document.querySelector('#play-btn').onclick=startGame;document.querySelector('#retry-btn').onclick=startGame;document.querySelector('#resume-btn').onclick=resumeGame;document.querySelector('#pause-btn').onclick=()=>state==='paused'?resumeGame():pauseGame;
document.querySelector('#home-btn').onclick=()=>{state='menu';ui.result.classList.add('hidden');ui.intro.classList.remove('hidden');shell.classList.remove('playing')};document.querySelector('#quit-btn').onclick=()=>{state='over';ui.pause.classList.add('hidden');finishGame()};
document.querySelector('#sound-btn').onclick=e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?'♫':'♪';e.currentTarget.style.color=soundOn?'#ffdc4b':'';setToast(soundOn?'SOUND ON':'SOUND OFF')};
for(const b of document.querySelectorAll('.mobile-controls button')){b.addEventListener('pointerdown',e=>{e.preventDefault();action(b.dataset.action)})}
let touchStart=null;canvas.addEventListener('touchstart',e=>{if(state!=='playing')return;const t=e.changedTouches[0];touchStart=[t.clientX,t.clientY]},{passive:true});canvas.addEventListener('touchend',e=>{if(!touchStart)return;const t=e.changedTouches[0],dx=t.clientX-touchStart[0],dy=t.clientY-touchStart[1];if(Math.max(Math.abs(dx),Math.abs(dy))>24){action(Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down'))}touchStart=null},{passive:true});
