import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const icons = {
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.4 2.4 0 0 1 4.6 1c0 1.8-2.3 1.8-2.3 3.5M12 17h.01"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  tag: '<path d="M20 13 12 21 3 12V3h9l8 8z"/><circle cx="7.5" cy="7.5" r="1"/>',
  rotate: '<path d="M20 8A8 8 0 1 0 21 14M20 3v5h-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  reset: '<path d="M3 11a9 9 0 1 1 2.7 7M3 4v7h7"/>',
  fullscreen: '<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/>',
  mouse: '<rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 2v7M6 9h12"/>',
  scroll: '<path d="m9 5 3-3 3 3M12 2v7m-3 10 3 3 3-3M12 15v7"/><path d="M5 12h14"/>',
  pointer: '<path d="m5 3 14 10-7 1-3 7z"/>',
  detach: '<path d="m4 9 8 4 8-4M4 9v10l8 4 8-4V9M12 13v10M8 5l4-3 4 3M12 2v7"/>',
  explode: '<path d="m12 2 5 3-5 3-5-3zM4 9l8 4 8-4M4 14l8 4 8-4M4 19l8 4 8-4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  body: '<path d="M3 7h5l2-3h6l2 3h3v13H3z"/><circle cx="12" cy="13" r="4"/>',
  lens: '<ellipse cx="8" cy="12" rx="4" ry="8"/><path d="M8 4h8c2.2 0 4 3.6 4 8s-1.8 8-4 8H8M12 4v16M16 4v16"/>',
  mount: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6"/><path d="M12 3v3M21 12h-3M12 21v-3M3 12h3"/>',
  sensor: '<rect x="5" y="5" width="14" height="14" rx="1"/><path d="M8 2v3M12 2v3M16 2v3M8 19v3M12 19v3M16 19v3M2 8h3M2 12h3M2 16h3M19 8h3M19 12h3M19 16h3M8 8h8v8H8z"/>',
  ibis: '<rect x="7" y="7" width="10" height="10" rx="1"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3m-8-10 3 3 3-3m-6 18 3-3 3 3M2 9l3 3-3 3m20-6-3 3 3 3"/>',
  processor: '<rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4M9 9h6v6H9z"/>',
  viewfinder: '<path d="M3 8h18v12H3zM7 8V4h10v4"/><rect x="7" y="11" width="10" height="6" rx="1"/>',
  screen: '<rect x="2" y="4" width="20" height="15" rx="1"/><path d="M8 22h8M12 19v3m-6-8 4-4 3 3 3-5 3 7H6"/>',
  battery: '<rect x="6" y="4" width="12" height="18" rx="2"/><path d="M9 4V2h6v2M9 10h6M12 7v6M9 17h6"/>',
  top: '<path d="M3 15h18v5H3zM5 15V9h6v6M16 15V5h4v10M6 6h4M17 2h2"/>'
};
function icon(name, cls = '') { return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.layers}</svg>`; }
$$('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));

const PARTS = [
 {id:'body',name:'机身框架',en:'Camera body',category:'机身结构',hint:'镁合金结构 · 深握柄',description:'紧凑机身与深握柄兼顾轻量和持握稳定性。顶部、前部与握柄区域采用镁合金，容纳影像系统与操控组件。',specs:[['机身尺寸','126 × 85.1 × 65.4 mm'],['机身重量','约 465 g（含电池、存储卡）'],['结构特征','深握柄 / 镁合金部件']]},
 {id:'lens',name:'XC 50–230mm 镜头',en:'Fujinon telephoto zoom',category:'光学系统',hint:'F4.5–6.7 · OIS II',description:'轻巧的 X 卡口长焦变焦镜头，从中长焦覆盖到远摄。光学防抖辅助稳定取景，适合远景、动物与细节特写。',specs:[['焦距','50–230 mm'],['等效焦距','76–350 mm（35 mm 等效）'],['最大光圈','F4.5–F6.7'],['滤镜口径','Ø 58 mm'],['镜头重量','约 375 g']]},
 {id:'mount',name:'X 卡口组件',en:'Fujifilm X mount',category:'光学系统',hint:'金属卡口 · 电子触点',description:'连接机身与镜头的精密接口。金属卡口负责定位，电子触点传递对焦、光圈与防抖控制信息。',specs:[['卡口类型','Fujifilm X 卡口'],['法兰距','17.7 mm'],['功能','镜头连接 / 电子通信']]},
 {id:'sensor',name:'X-Trans CMOS 4',en:'APS-C imaging sensor',category:'影像核心',hint:'2610 万像素 · APS-C',description:'背照式 APS-C 传感器采用 X-Trans 色彩滤镜阵列，将光线转化为影像信号，为细节、色彩与高感光表现奠定基础。',specs:[['有效像素','约 2610 万'],['传感器尺寸','23.5 × 15.6 mm'],['传感器类型','背照式 X-Trans CMOS 4'],['常用感光度','ISO 160–12800']]},
 {id:'ibis',name:'五轴防抖组件',en:'In-body image stabilization',category:'影像核心',hint:'五轴补偿 · 最高 6.0 挡',description:'机身防抖通过精密移动传感器，补偿俯仰、偏航、滚转与水平和垂直位移。与兼容镜头共同改善手持拍摄稳定性。',specs:[['补偿方式','传感器位移式五轴防抖'],['官方标称效果','最高 6.0 挡'],['说明','效果随镜头与测试条件变化']]},
 {id:'processor',name:'X-Processor 4',en:'Image processing engine',category:'影像核心',hint:'四核处理 · 胶片模拟',description:'四核影像处理引擎协同处理传感器数据、自动对焦与视频编码。富士胶片模拟也在这里完成色彩演绎。',specs:[['影像处理器','X-Processor 4'],['处理架构','四核'],['胶片模拟','18 种'],['视频','DCI 4K / UHD 4K，最高 29.97p']]},
 {id:'viewfinder',name:'电子取景器',en:'OLED electronic viewfinder',category:'取景与操控',hint:'236 万点 · OLED',description:'眼平式 OLED 电子取景器可实时预览曝光与色彩。中央取景器隆起也是 X-S10 外观的重要识别特征。',specs:[['取景器类型','0.39 英寸彩色 OLED'],['分辨率','约 236 万点'],['放大倍率','约 0.62×（35 mm 等效）'],['视野率','约 100%']]},
 {id:'screen',name:'侧翻触控屏',en:'Vari-angle touch display',category:'取景与操控',hint:'3.0 英寸 · 侧翻结构',description:'可变角度触控屏支持高低机位与自拍取景。侧向铰链让屏幕调整角度时避开机身底部的支撑设备。',specs:[['显示屏','3.0 英寸彩色 LCD'],['分辨率','约 104 万点'],['结构','可变角度侧翻屏'],['操作','触控操作']]},
 {id:'battery',name:'NP-W126S 电池',en:'Rechargeable Li-ion battery',category:'供电系统',hint:'锂离子电池 · 可更换',description:'可拆卸锂离子电池安装在握柄内部，为相机供电。握柄既形成稳定的持握空间，也为电池预留容积。',specs:[['电池型号','NP-W126S'],['电池类型','可充电锂离子电池'],['标称电压','7.2 V'],['标称容量','1260 mAh']]},
 {id:'top',name:'顶部操控组件',en:'Top plate & control dials',category:'取景与操控',hint:'PASM 拨盘 · 快门按键',description:'PASM 模式拨盘与前后指令拨盘组成直观的操控逻辑。快门、电源与专用按键集中在右手容易触达的位置。',specs:[['曝光模式','P / S / A / M 等'],['主要操控','模式拨盘 / 指令拨盘'],['辅助结构','热靴 / 内置闪光灯']]}
];
let selected = 'body', filterDetached = false, globalTarget = 0, labelsVisible = true;
let model, renderer, camera, controls, scene, outlines, hovered = null, zoomTween = null, viewTween = null;
const partBounds=new Map();
const fractions = new Map(PARTS.map(p => [p.id, {current:0,target:0}]));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2400); }
function isDetached(id) { return fractions.get(id).target > .01; }
function renderList() {
  const visible = PARTS.filter(p=>!filterDetached || isDetached(p.id));
  $('#parts-list').innerHTML = visible.length ? visible.map(p=>`<button class="part-row ${p.id===selected?'active':''} ${isDetached(p.id)?'detached':''}" data-part="${p.id}" aria-pressed="${p.id===selected}"><span class="part-number">${String(PARTS.indexOf(p)+1).padStart(2,'0')}</span><span class="part-icon">${icon(p.id)}</span><span class="part-copy"><strong>${p.name}</strong><small>${p.hint}</small></span><span class="part-state">${isDetached(p.id)?'↗':'+'}</span></button>`).join('') : '<p class="list-empty">尚未拆解任何部件<br><span>点击模型或使用底部滑块开始。</span></p>';
  $$('#parts-list [data-part]').forEach(el=>el.addEventListener('click',()=>selectPart(el.dataset.part)));
  const count=PARTS.filter(p=>isDetached(p.id)).length;
  $('#detached-count').textContent=count; $('#part-progress').textContent=`${String(count).padStart(2,'0')} / 10`;
  $('#view-status').textContent=count===0?'整机视图':count===10?'完全拆解':'局部拆解';
  $('#part-action-text').textContent=isDetached(selected)?'装回此部件':'拆解此部件';
  $('#explode-all-text').textContent=count===10?'合拢整机':'一键拆解';
  $$('#labels-layer [data-part]').forEach(el=>{el.classList.toggle('is-selected',el.dataset.part===selected);el.classList.toggle('is-detached',isDetached(el.dataset.part));});
}
function renderDetails() {
  const p=PARTS.find(p=>p.id===selected);
  $('#detail-title').textContent=p.name; $('#detail-english').textContent=p.en; $('#detail-category').textContent=p.category;
  $('#detail-description').textContent=p.description; $('#detail-index').textContent=`${String(PARTS.indexOf(p)+1).padStart(2,'0')} / 10`;
  $('#detail-specs').innerHTML=p.specs.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  $('#detail-diagram').innerHTML=`<div class="diagram-grid"></div>${icon(p.id)}<span class="diagram-cross cross-a">+</span><span class="diagram-cross cross-b">+</span><span class="diagram-id">FIG. ${String(PARTS.indexOf(p)+1).padStart(2,'0')}</span>`;
}
function selectPart(id) { selected=id; renderList(); renderDetails(); updateHighlight(); }
function setPart(id) { selectPart(id); const s=fractions.get(id); s.target=s.target>.01?0:1; syncRange(); renderList(); updateHighlight();if(s.target)fitExploded(); }
function syncRange() { globalTarget=PARTS.reduce((sum,p)=>sum+fractions.get(p.id).target,0)/PARTS.length; const v=Math.round(globalTarget*100); $('#explode-range').value=v; $('#explode-value').textContent=`${v}%`; $('#explode-range').style.setProperty('--progress',`${v}%`); }
function setExplosion(value) { globalTarget=value; fractions.forEach(s=>s.target=value);syncRange();renderList();updateHighlight(); if(value>.01)fitExploded(); }
function resetAll() { fractions.forEach(s=>s.target=0);syncRange();renderList();updateHighlight(); goView('perspective',true);toast('已还原整机与初始视角'); }
function valueTweenDistance(){ return camera&&controls ? camera.position.distanceTo(controls.target):18; }
function fitPose(direction){
  const box=new THREE.Box3(),boxes=[];for(const part of model.parts){const b=partBounds.get(part.id).clone().translate(part.explode.clone().multiplyScalar(fractions.get(part.id).target));box.union(b);boxes.push(b);}
  const target=box.getCenter(new THREE.Vector3());target.y+=.12;
  const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),direction).normalize();if(right.lengthSq()<.01)right.set(1,0,0);
  const up=new THREE.Vector3().crossVectors(direction,right).normalize(),tanV=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),tanH=tanV*camera.aspect;
  let distance=12;for(const b of boxes)for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const rel=new THREE.Vector3(x,y,z).sub(target);distance=Math.max(distance,Math.abs(rel.dot(right))/(tanH*.88)+rel.dot(direction),Math.abs(rel.dot(up))/(tanV*.82)+rel.dot(direction));}
  return{target,to:target.clone().addScaledVector(direction,distance*1.04)};
}
function fitExploded() { if(!model||!camera||!controls)return;const pose=fitPose(camera.position.clone().sub(controls.target).normalize());viewTween={from:camera.position.clone(),to:pose.to,targetFrom:controls.target.clone(),targetTo:pose.target,time:0}; }
function updateHighlight() {
  if(!model)return;
  for(const p of model.parts) p.group.traverse(obj=>{if(!obj.isMesh||!obj.material)return;for(const mat of (Array.isArray(obj.material)?obj.material:[obj.material])){if(!mat.emissive)continue;if(!mat.userData.originalEmissive)mat.userData.originalEmissive=mat.emissive.clone();if(mat.userData.originalEmissiveIntensity===undefined)mat.userData.originalEmissiveIntensity=mat.emissiveIntensity;mat.emissive.copy(mat.userData.originalEmissive);mat.emissiveIntensity=mat.userData.originalEmissiveIntensity; if(p.id===hovered||(p.id===selected&&isDetached(p.id))){mat.emissive.lerp(new THREE.Color('#c87940'),.055);mat.emissiveIntensity=Math.max(mat.emissiveIntensity,p.id===hovered?.10:.075);}}});
  if(outlines) { outlines.parent?.remove(outlines); const materials=new Set();outlines.traverse(o=>{o.geometry?.dispose();if(o.material)materials.add(o.material);});materials.forEach(m=>m.dispose()); }
  const part=model.parts.find(p=>p.id===(hovered||(isDetached(selected)?selected:null))); if(!part)return;
  outlines=new THREE.Group();const lineMat=new THREE.LineBasicMaterial({color:0xf2b17d,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending});
  part.group.updateWorldMatrix(true,true);
  part.group.traverse(obj=>{if(!obj.isMesh||!obj.geometry||obj.userData.noOutline)return; const edge=new THREE.LineSegments(new THREE.EdgesGeometry(obj.geometry,38),lineMat);edge.position.copy(obj.position);edge.rotation.copy(obj.rotation);edge.scale.copy(obj.scale);if(obj.parent!==part.group){const relative=new THREE.Matrix4().copy(part.group.matrixWorld).invert().multiply(obj.matrixWorld);edge.matrix.copy(relative);edge.matrixAutoUpdate=false;}outlines.add(edge);});
  part.group.add(outlines);
}
function goView(view,reset=false) {
  if(!camera||!controls)return;
  const vectors={perspective:new THREE.Vector3(8,4.9,12),front:new THREE.Vector3(0,1,15),back:new THREE.Vector3(0,2,-15),top:new THREE.Vector3(.01,15,.5)};
  const pose=fitPose(vectors[view].normalize()),target=pose.target,to=pose.to;
  viewTween={from:camera.position.clone(),to,targetFrom:controls.target.clone(),targetTo:target,time:0};
  $$('.view-presets button').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',b.dataset.view===view);});
}
function dialogOpen(id) { const d=$(id); if(!d.open)d.showModal(); }
$('#help-button').addEventListener('click',()=>dialogOpen('#help-dialog'));
$('#specs-tab').addEventListener('click',()=>dialogOpen('#specs-dialog'));
$('#explore-tab').addEventListener('click',()=>{if($('#specs-dialog').open)$('#specs-dialog').close();$('#stage').scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'center'});});
$$('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('#all-filter').addEventListener('click',()=>{filterDetached=false;setFilters();});
$('#detached-filter').addEventListener('click',()=>{filterDetached=true;setFilters();});
function setFilters(){ $('#all-filter').classList.toggle('selected',!filterDetached);$('#all-filter').setAttribute('aria-pressed',!filterDetached);$('#detached-filter').classList.toggle('selected',filterDetached);$('#detached-filter').setAttribute('aria-pressed',filterDetached);renderList(); }
$('#part-action').addEventListener('click',()=>setPart(selected));
$('#explode-range').addEventListener('input',e=>setExplosion(Number(e.target.value)/100));
$('#explode-all').addEventListener('click',()=>{const all=PARTS.every(p=>isDetached(p.id));setExplosion(all?0:1);if(!all)toast('已展开全部部件 · 拖动可观察内部结构');});
$('#reset-all').addEventListener('click',resetAll);
$('#labels-button').addEventListener('click',()=>{labelsVisible=!labelsVisible;$('#labels-button').classList.toggle('active',labelsVisible);$('#labels-button').setAttribute('aria-pressed',labelsVisible);$('#labels-layer').hidden=!labelsVisible;});
$('#rotate-button').addEventListener('click',()=>{if(!controls){toast('3D 视图尚未就绪');return;}controls.autoRotate=!controls.autoRotate;$('#rotate-button').classList.toggle('active',controls.autoRotate);$('#rotate-button').setAttribute('aria-pressed',controls.autoRotate);});
$('#reset-view').addEventListener('click',()=>goView('perspective'));
$('#zoom-in').addEventListener('click',()=>{if(!camera)return;const direction=camera.position.clone().sub(controls.target);zoomTween=controls.target.clone().add(direction.multiplyScalar(Math.max(.72,controls.minDistance/direction.length())));});
$('#zoom-out').addEventListener('click',()=>{if(!camera)return;const direction=camera.position.clone().sub(controls.target);zoomTween=controls.target.clone().add(direction.multiplyScalar(Math.min(1.28,controls.maxDistance/direction.length())));});
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>goView(b.dataset.view)));
$('#fullscreen-button').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#stage').requestFullscreen();}catch{toast('当前浏览器暂不支持全屏');}});
$('#retry-button').addEventListener('click',()=>location.reload());
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.target.matches('input,textarea')||$$('dialog').some(d=>d.open))return;if(e.key.toLowerCase()==='e')$('#explode-all').click();if(e.key.toLowerCase()==='r')resetAll();});
$('#full-specs').innerHTML=[['影像核心',[['有效像素','约 2610 万'],['传感器','23.5 × 15.6 mm X-Trans CMOS 4'],['处理器','X-Processor 4'],['机身防抖','五轴，最高 6.0 挡'],['视频','DCI 4K / UHD 4K，最高 29.97p']]],['机身与取景',[['机身尺寸','126 × 85.1 × 65.4 mm'],['机身重量','约 465 g，含电池与存储卡'],['电子取景器','0.39 英寸，约 236 万点 OLED'],['显示屏','3.0 英寸，约 104 万点可变角度触控屏'],['电池','NP-W126S']]],['XC 50–230mm OIS II',[['实际焦距','50–230 mm'],['等效焦距','76–350 mm（35 mm 等效）'],['最大光圈','F4.5–F6.7'],['镜头结构','10 组 13 片'],['滤镜口径','58 mm'],['镜头重量','约 375 g']]]].map(([title,rows])=>`<section class="spec-section"><h3>${title}</h3><dl>${rows.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></section>`).join('');
renderList();renderDetails();

async function init() {
 try {
  const {createCameraModel}=await import('./camera-model.js');
  const wrap=$('#canvas-wrap');
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(wrap.clientWidth,wrap.clientHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-label','可旋转与缩放的富士 X-S10 三维模型');renderer.domElement.setAttribute('role','img');wrap.appendChild(renderer.domElement);
  scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#191c1f',.025);
  camera=new THREE.PerspectiveCamera(37,wrap.clientWidth/wrap.clientHeight,.1,150);
  camera.position.set(7.9,4.8,13.3);
  controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,1.2);controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=6.4;controls.maxDistance=65;controls.maxPolarAngle=Math.PI*.9;controls.autoRotateSpeed=.6;controls.enablePan=true;controls.panSpeed=.5;controls.update();
  controls.addEventListener('start',()=>{viewTween=null;zoomTween=null;});
  scene.add(new THREE.HemisphereLight(0xd8e5ef,0x49403a,2.4));
  const key=new THREE.DirectionalLight(0xfff0de,5);key.position.set(-4,7,9);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-10;key.shadow.camera.right=10;key.shadow.camera.top=12;key.shadow.camera.bottom=-10;key.shadow.normalBias=.04;key.shadow.bias=-.0002;scene.add(key);
  const fill=new THREE.DirectionalLight(0xc1d8ef,3);fill.position.set(6,3,-6);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xe9ac7e,2.1);rim.position.set(-6,0,-3);scene.add(rim);
  const envScene=new THREE.Scene();envScene.background=new THREE.Color('#555a60');
  for(const [position,scale,intensity] of [[[0,8,0],[12,1,10],3.5],[[-8,3,3],[1,7,8],2],[[7,1,-5],[1,6,6],2]]){const panel=new THREE.Mesh(new THREE.BoxGeometry(...scale),new THREE.MeshBasicMaterial({color:new THREE.Color(intensity,intensity,intensity)}));panel.position.set(...position);envScene.add(panel);}
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(envScene,.02).texture;pmrem.dispose();envScene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  model=createCameraModel();scene.add(model.root);
  for(const part of model.parts){const copies=new Map();part.group.traverse(o=>{if(!o.isMesh||!o.material)return;const clone=m=>{if(!copies.has(m))copies.set(m,m.clone());return copies.get(m);};o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material);});}
  model.root.updateMatrixWorld(true);for(const part of model.parts)partBounds.set(part.id,new THREE.Box3().setFromObject(part.group));
  const initialPose=fitPose(camera.position.clone().sub(controls.target).normalize());camera.position.copy(initialPose.to);controls.target.copy(initialPose.target);controls.update();
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({color:0x030405,opacity:.32}));ground.rotation.x=-Math.PI/2;ground.position.y=-2;ground.receiveShadow=true;scene.add(ground);
  const grid=new THREE.GridHelper(35,35,0x515658,0x41474a);grid.position.y=-2.025;grid.material.transparent=true;grid.material.opacity=.13;scene.add(grid);
  const ring=new THREE.Mesh(new THREE.RingGeometry(4.4,4.415,128),new THREE.MeshBasicMaterial({color:0x787c7a,transparent:true,opacity:.15,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(0,-2.02,1);scene.add(ring);
  $('#labels-layer').innerHTML=PARTS.map(p=>`<button class="part-label ${p.id===selected?'is-selected':''}" data-part="${p.id}" aria-label="${p.name}，点击拆解或装回"><span class="label-dot"></span><span class="label-text">${p.name}</span></button>`).join('');
  $$('.part-label').forEach(el=>el.addEventListener('click',()=>setPart(el.dataset.part)));
  updateHighlight();
  const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();let down=null;const activePointers=new Set();
  function hit(e){const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(model.clickable,false).find(h=>h.object.visible)?.object.userData.partId;}
  renderer.domElement.addEventListener('pointerdown',e=>{activePointers.add(e.pointerId);if(activePointers.size>1||!e.isPrimary||e.button!==0){down=null;return;}down={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now()};});
  renderer.domElement.addEventListener('pointermove',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)down=null;});
  renderer.domElement.addEventListener('pointerup',e=>{if(down&&down.id===e.pointerId&&e.button===0&&activePointers.size===1&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<6&&performance.now()-down.time<600){const id=hit(e);if(id)setPart(id);}down=null;activePointers.delete(e.pointerId);});
  renderer.domElement.addEventListener('pointercancel',e=>{down=null;activePointers.delete(e.pointerId);});
  let lastHover=0;
  renderer.domElement.addEventListener('pointermove',e=>{if(e.buttons||performance.now()-lastHover<70)return;lastHover=performance.now();const id=hit(e)||null;if(hovered!==id){hovered=id;renderer.domElement.style.cursor=id?'pointer':'grab';updateHighlight();}});
  renderer.domElement.addEventListener('pointerleave',()=>{hovered=null;updateHighlight();});
  const resize=new ResizeObserver(()=>{const w=wrap.clientWidth,h=wrap.clientHeight;if(w&&h){camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);fitExploded();}});resize.observe(wrap);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#error-state').hidden=false;$('#loader').hidden=true;});
  $('#loader').classList.add('loaded');setTimeout(()=>$('#loader').hidden=true,450);
  const projection=new THREE.Vector3(),anchorWorld=new THREE.Vector3(),clock=new THREE.Clock();
  function labels(){
   if(!labelsVisible)return; const width=wrap.clientWidth,height=wrap.clientHeight;
   const fullyAssembled=!PARTS.some(p=>fractions.get(p.id).current>.04);
   const placed=[];
   // Prioritise active part and exterior parts; collision avoidance keeps labels legible.
   const ordered=[...model.parts].sort((a,b)=>(a.id===selected?-100:b.id===selected?100:PARTS.findIndex(p=>p.id===a.id)-PARTS.findIndex(p=>p.id===b.id)));
   for(const part of ordered){
    const el=$(`#labels-layer [data-part="${part.id}"]`);
    if(fullyAssembled&&!['lens','body','viewfinder'].includes(part.id)&&part.id!==selected){el.style.display='none';continue;}
    anchorWorld.copy(part.labelAnchor);part.group.localToWorld(anchorWorld);projection.copy(anchorWorld).project(camera);
    if(projection.z>1||projection.z<-1){el.style.display='none';continue;}
    el.style.display='';const w=el.offsetWidth||130,h=el.offsetHeight||31;
    let x=THREE.MathUtils.clamp((projection.x*.5+.5)*width+14,8,width-w-58),y=(-projection.y*.5+.5)*height-12;
    for(let attempt=0;attempt<12;attempt++){const collision=placed.find(r=>x<r.x+r.w+8&&x+w+8>r.x&&y<r.y+r.h+6&&y+h+6>r.y);if(!collision)break;y=collision.y+collision.h+7;}
    if(y<125||y>height-92){el.style.display='none';continue;}
    el.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px)`;placed.push({x,y,w,h});
   }
  }
  function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);for(const part of model.parts){const s=fractions.get(part.id);s.current=reducedMotion?s.target:THREE.MathUtils.damp(s.current,s.target,5.5,dt);part.group.position.copy(part.base).addScaledVector(part.explode,s.current);}if(viewTween){viewTween.time+=dt;const t=reducedMotion?1:Math.min(viewTween.time/.9,1),e=1-Math.pow(1-t,3);camera.position.lerpVectors(viewTween.from,viewTween.to,e);controls.target.lerpVectors(viewTween.targetFrom,viewTween.targetTo,e);if(t===1)viewTween=null;}if(zoomTween){camera.position.lerp(zoomTween,reducedMotion?1:.17);if(camera.position.distanceTo(zoomTween)<.015)zoomTween=null;}controls.update();model.root.updateMatrixWorld(true);renderer.render(scene,camera);labels();}
  animate();
  window.__cameraLab={getState:()=>({selected,targets:Object.fromEntries([...fractions].map(([k,v])=>[k,v.target])),current:Object.fromEntries([...fractions].map(([k,v])=>[k,v.current])),meshes:model.clickable.length,autoRotate:controls.autoRotate,camera:camera.position.toArray(),labelsVisible}),projectPart:(id)=>{const p=model.parts.find(p=>p.id===id);const v=p.group.localToWorld(p.labelAnchor.clone()).project(camera);const r=renderer.domElement.getBoundingClientRect();return{x:r.left+(v.x*.5+.5)*r.width,y:r.top+(-v.y*.5+.5)*r.height};}};
 }catch(error){ console.error('Camera viewer initialization failed:',error);$('#loader').hidden=true;$('#error-state').hidden=false; }
}
init();
