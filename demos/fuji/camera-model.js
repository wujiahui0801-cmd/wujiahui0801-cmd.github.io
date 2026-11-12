import * as THREE from './vendor/three.module.js';

// A procedural exterior study and an educational internal arrangement.
// No downloaded geometry, photographs, or proprietary teardown data is used.
export function createCameraModel() {
  const root = new THREE.Group();
  root.name = 'FUJIFILM X-S10 / XC 50–230mm';
  const parts = [], clickable = [];
  const black = new THREE.MeshStandardMaterial({ color: 0x111418, roughness: .53, metalness: .38 });
  const satin = new THREE.MeshStandardMaterial({ color: 0x20262c, roughness: .34, metalness: .75 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x090c10, roughness: .88, metalness: .04 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xaab8c2, roughness: .27, metalness: .94 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x3a434d, roughness: .31, metalness: .91 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xcba656, roughness: .28, metalness: .85 });
  const copper = new THREE.MeshStandardMaterial({ color: 0xb46e37, roughness: .38, metalness: .84 });
  const cyan = new THREE.MeshStandardMaterial({ color: 0x41d6e8, emissive: 0x087a89, emissiveIntensity: .22, roughness: .3, metalness: .5 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x133e4b, roughness: .08, metalness: .48, clearcoat: 1, clearcoatRoughness: .07, transparent: true, opacity: .91 });
  const circuit = new THREE.MeshStandardMaterial({ color: 0x18574b, roughness: .5, metalness: .42 });
  const chip = new THREE.MeshStandardMaterial({ color: 0x15191d, roughness: .52, metalness: .25 });
  const white = new THREE.MeshStandardMaterial({ color: 0xb9c3c8, roughness: .55 });

  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function texture(c, repeat = false) {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    return t;
  }
  const grain = canvas(256, 256), gc = grain.getContext('2d');
  gc.fillStyle = '#777'; gc.fillRect(0, 0, 256, 256);
  let seed = 1071;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  for (let i = 0; i < 5500; i++) {
    const a = Math.floor(65 + rand() * 135); gc.fillStyle = `rgb(${a},${a},${a})`;
    gc.beginPath(); gc.ellipse(rand() * 256, rand() * 256, .6 + rand() * 1.3, .6 + rand(), 0, 0, Math.PI * 2); gc.fill();
  }
  const grainTex = texture(grain, true); grainTex.repeat.set(3, 2);
  const leather = new THREE.MeshStandardMaterial({ color: 0x131619, roughness: .83, metalness: .04, bumpMap: grainTex, bumpScale: .055 });
  const ribs = canvas(1024, 128), rc = ribs.getContext('2d');
  rc.fillStyle = '#333'; rc.fillRect(0, 0, 1024, 128);
  for (let i = 0; i < 160; i++) {
    const x = i * 6.4; rc.fillStyle = '#999'; rc.fillRect(x, 0, 2, 128);
    rc.fillStyle = '#111'; rc.fillRect(x + 3, 0, 2.1, 128);
  }
  const ribbed = new THREE.MeshStandardMaterial({ color: 0x101316, roughness: .76, metalness: .08, bumpMap: texture(ribs), bumpScale: .045 });

  function part(id, pos, explode, anchor) {
    const group = new THREE.Group(); group.name = id; group.position.set(...pos); root.add(group);
    const p = { id, group, base: group.position.clone(), explode: new THREE.Vector3(...explode), labelAnchor: new THREE.Vector3(...anchor) };
    parts.push(p); return group;
  }
  function mesh(g, geometry, material, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geometry, material); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
  }
  function box(g, w, h, d, mat, x = 0, y = 0, z = 0, bevel = .035) {
    if (!bevel) return mesh(g, new THREE.BoxGeometry(w, h, d), mat, x, y, z);
    const s = roundedShape(w, h, Math.min(bevel * 2, h / 3, w / 3));
    const e = new THREE.ExtrudeGeometry(s, { depth: Math.max(.001, d - bevel * 2), bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, steps: 1, curveSegments: 5 });
    e.translate(0, 0, -d / 2 + bevel); return mesh(g, e, mat, x, y, z);
  }
  function roundedShape(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  function cyl(g, r, length, mat, x = 0, y = 0, z = 0, r2 = r, segments = 64, open = false) {
    const m = mesh(g, new THREE.CylinderGeometry(r, r2, length, segments, 1, open), mat, x, y, z); m.rotation.x = Math.PI / 2; return m;
  }
  function ring(g, r, t, mat, x = 0, y = 0, z = 0) { return mesh(g, new THREE.TorusGeometry(r, t, 8, 72), mat, x, y, z); }
  function circle(g, r, mat, x, y, z) { return mesh(g, new THREE.CircleGeometry(r, 72), mat, x, y, z); }
  function annulus(g, outer, inner, d, mat, x = 0, y = 0, z = 0) {
    const s = new THREE.Shape(); s.absarc(0, 0, outer, 0, Math.PI * 2, false);
    const hole = new THREE.Path(); hole.absarc(0, 0, inner, 0, Math.PI * 2, true); s.holes.push(hole);
    const geom = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 48 }); geom.translate(0, 0, -d / 2);
    return mesh(g, geom, mat, x, y, z);
  }
  function text(g, str, w, h, x, y, z, opt = {}) {
    const c = canvas(1024, 160), ctx = c.getContext('2d');
    ctx.fillStyle = opt.color || '#dce2e5'; ctx.textAlign = opt.align || 'center'; ctx.textBaseline = 'middle';
    ctx.font = `${opt.weight || 500} ${opt.fontSize || 78}px ${opt.font || 'Arial, sans-serif'}`;
    ctx.fillText(str, opt.align === 'left' ? 6 : 512, 83, 1008);
    const material = new THREE.MeshBasicMaterial({ map: texture(c), transparent: true, depthWrite: false, opacity: opt.opacity ?? .95, side: THREE.DoubleSide });
    const m = mesh(g, new THREE.PlaneGeometry(w, h), material, x, y, z);
    m.castShadow = false; if (opt.back) m.rotation.y = Math.PI; if (opt.top) m.rotation.x = -Math.PI / 2; return m;
  }
  function screw(g, x, y, z, r = .039, mat = darkMetal, back = false) {
    const m = cyl(g, r, .018, mat, x, y, z, r, 16);
    const slot = box(g, r * 1.25, .009, .006, rubber, x, y, z + (back ? -.012 : .012), 0); slot.rotation.z = Math.PI / 4;
    if (back) m.rotation.x *= -1; return m;
  }
  function topDial(g, x, y, z, r, h, mode = false) {
    const s = new THREE.Shape(), n = 96;
    for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = r * (i % 2 ? .955 : 1); const p = [Math.cos(a) * rr, Math.sin(a) * rr]; i ? s.lineTo(...p) : s.moveTo(...p); }
    s.closePath(); const geom = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false });
    const m = mesh(g, geom, black, x, y - h / 2, z); m.rotation.x = -Math.PI / 2;
    const cap = cyl(g, r * .89, .025, satin, x, y + h / 2 + .005, z, r * .89, 64); cap.rotation.x = 0;
    const trim = ring(g, r * .87, .014, darkMetal, x, y + h / 2 + .021, z); trim.rotation.x = -Math.PI / 2;
    if (mode) {
      const c = canvas(512, 512), ctx = c.getContext('2d'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const modes = ['P', 'S', 'A', 'M', 'C1', 'C2', 'C3', 'C4', 'AUTO'];
      modes.forEach((v, i) => { const a = i / modes.length * Math.PI * 2 - Math.PI / 2; ctx.save(); ctx.translate(256 + Math.cos(a) * 171, 256 + Math.sin(a) * 171); ctx.rotate(a + Math.PI / 2); ctx.font = 'bold 39px Arial'; ctx.fillStyle = v === 'AUTO' ? '#72c6b3' : '#d4dbdf'; ctx.fillText(v, 0, 0); ctx.restore(); });
      ctx.fillStyle = '#697783'; ctx.fillRect(249, 92, 14, 35);
      const label = mesh(g, new THREE.PlaneGeometry(r * 1.7, r * 1.7), new THREE.MeshBasicMaterial({ map: texture(c), transparent: true, depthWrite: false }), x, y + h / 2 + .026, z); label.rotation.x = -Math.PI / 2;
    }
    return m;
  }

  // Exterior shell: through aperture, stepped shoulder, and deep right-hand grip.
  const body = part('body', [0, 0, 0], [0, -.55, -.85], [-1.85, -.45, .8]);
  const outline = roundedShape(4.48, 2.57, .21), aperture = new THREE.Path(); aperture.absarc(.14, -.08, .81, 0, Math.PI * 2, true); outline.holes.push(aperture);
  const shellGeo = new THREE.ExtrudeGeometry(outline, { depth: 1.37, bevelEnabled: true, bevelSize: .075, bevelThickness: .075, bevelSegments: 3, curveSegments: 28 }); shellGeo.translate(0, 0, -.74);
  mesh(body, shellGeo, black);
  // A leather front plate follows the same optical opening.
  const face = roundedShape(4.34, 2.03, .16), faceHole = new THREE.Path(); faceHole.absarc(.14, .12, .84, 0, Math.PI * 2, true); face.holes.push(faceHole);
  const fg = new THREE.ExtrudeGeometry(face, { depth: .025, bevelEnabled: false, curveSegments: 24 }); mesh(body, fg, leather, 0, -.2, .713);
  const gripShape = new THREE.Shape(); gripShape.moveTo(-2.18, -1.19); gripShape.quadraticCurveTo(-2.38, -.65, -2.29, .61); gripShape.quadraticCurveTo(-2.23, 1.17, -1.83, 1.15); gripShape.quadraticCurveTo(-1.26, 1.11, -1.28, .55); gripShape.lineTo(-1.34, -1.12); gripShape.quadraticCurveTo(-1.76, -1.42, -2.18, -1.19);
  const gg = new THREE.ExtrudeGeometry(gripShape, { depth: .96, bevelEnabled: true, bevelSize: .14, bevelThickness: .12, bevelSegments: 4, curveSegments: 12 }); gg.translate(0, 0, -.04); mesh(body, gg, leather);
  box(body, .31, .65, .13, rubber, -1.22, .3, .83, .06);
  box(body, 4.26, .12, 1.35, satin, 0, -1.29, -.02, .035);
  box(body, .95, .045, .74, rubber, -1.69, -1.365, -.06, .015);
  text(body, 'X-S10', .59, .145, 1.74, .91, .739, { weight: 600 });
  text(body, 'FUJIFILM', .49, .09, -1.65, -.96, 1.085, { opacity: .6 });
  cyl(body, .076, .04, satin, 1.28, .77, .772); circle(body, .038, new THREE.MeshBasicMaterial({ color: 0x4b3030 }), 1.28, .77, .797);
  cyl(body, .106, .075, satin, 1.23, -.53, .76); text(body, 'LENS', .24, .045, 1.25, -.75, .758, { opacity: .6 });
  for (const x of [-2.22, 2.22]) {
    const lug = ring(body, .116, .033, metal, x, .91, -.18); lug.rotation.y = Math.PI / 2;
    box(body, .14, .23, .25, darkMetal, x, .91, -.18, .025);
  }
  [[-2.08,-1.1], [2.08,-1.1], [2.07,.95], [-1.12,1.02]].forEach(([x,y]) => screw(body,x,y,.75));
  // Rear thumb rest, joystick, controls and port covers.
  box(body, .73, 1.7, .1, leather, -1.73, -.05, -.84, .09);
  box(body, .48, .72, .23, leather, -1.87, .61, -.89, .1);
  const rearButtons = [[-1.5,.41,.08],[-1.64,-.03,.1],[-1.61,-.65,.135],[-1.61,-1.01,.085],[1.67,.98,.065],[1.27,.98,.065]];
  rearButtons.forEach(([x,y,r]) => cyl(body,r,.05,rubber,x,y,-.94));
  text(body,'Q',.09,.07,-1.5,.41,-.973,{back:true}); text(body,'MENU',.18,.055,-1.61,-.62,-.982,{back:true}); text(body,'OK',.12,.05,-1.61,-.69,-.982,{back:true}); text(body,'DISP/BACK',.36,.048,-1.61,-1.16,-.925,{back:true});
  for (const y of [-.77,-.13,.49]) box(body,.06,.54,.73,rubber,2.268,y,-.1,.015);
  for (const x of [-2.07,2.07]) screw(body,x,-1.1,-.82,.035,darkMetal,true);

  // Interchangeable bayonet and electronic contacts.
  const mount = part('mount', [.14, -.08, .815], [0, 0, 1.48], [.94, .57, .06]);
  annulus(mount,.89,.705,.11,metal); ring(mount,.858,.018,darkMetal,0,0,.069); annulus(mount,.712,.638,.08,black,0,0,-.015);
  for(let i=0;i<4;i++){ const a=i/4*Math.PI*2+Math.PI/4; screw(mount,Math.cos(a)*.795,Math.sin(a)*.795,.077,.037,metal); }
  for(let i=0;i<10;i++){ const a=Math.PI*1.18+i*.067; cyl(mount,.025,.034,gold,Math.cos(a)*.665,Math.sin(a)*.665,.065,.025,12); }
  for(let i=0;i<3;i++){ const a=i/3*Math.PI*2+.1; const tab=box(mount,.25,.08,.035,darkMetal,Math.cos(a)*.75,Math.sin(a)*.75,.089,.012); tab.rotation.z=a+Math.PI/2; }
  circle(mount,.035,new THREE.MeshBasicMaterial({color:0xdd322f}),.09,.837,.089);

  // XC 50–230 mm: nested barrels, two rubber rings and engraved front annulus.
  const lens = part('lens', [.14, -.08, .93], [.15, -.15, 3.2], [1.07, .85, 2.35]);
  cyl(lens,.746,.23,darkMetal,0,0,.05); annulus(lens,.81,.64,.12,metal,0,0,-.025);
  cyl(lens,.94,.28,black,0,0,.28,.77); ring(lens,.933,.018,satin,0,0,.408);
  cyl(lens,1.045,.16,satin,0,0,.49,.94);
  cyl(lens,1.075,1.12,ribbed,0,0,1.13,1.075,96); ring(lens,1.073,.022,black,0,0,.57); ring(lens,1.073,.025,black,0,0,1.69);
  cyl(lens,1.054,.46,black,0,0,1.94); ring(lens,1.052,.014,satin,0,0,1.74); ring(lens,1.045,.015,satin,0,0,2.15);
  cyl(lens,1.024,.70,ribbed,0,0,2.51,1.024,96); ring(lens,1.027,.025,black,0,0,2.17); ring(lens,1.027,.025,black,0,0,2.86);
  cyl(lens,1.004,.48,black,0,0,3.10); ring(lens,1.008,.025,satin,0,0,3.32); annulus(lens,1.008,.807,.14,rubber,0,0,3.37);
  ring(lens,.858,.013,darkMetal,0,0,3.445); annulus(lens,.813,.742,.08,black,0,0,3.37);
  // The zoom scale wraps around the barrel, printed entirely in a canvas.
  const scaleC=canvas(2048,256), sc=scaleC.getContext('2d'); sc.textAlign='center'; sc.textBaseline='middle'; sc.fillStyle='#d9dde0'; sc.font='42px Arial';
  ['50','70','100','135','200','230'].forEach((v,i)=>{const x=520+i*165;sc.fillText(v,x,136);sc.fillRect(x-2,176,4,22);});
  sc.font='26px Arial'; sc.fillStyle='#919ba2'; sc.fillText('XC 50–230mm',160,133); sc.fillText('FUJINON',1710,133);
  const scaleMat=new THREE.MeshStandardMaterial({map:texture(scaleC),transparent:true,roughness:.6,depthWrite:false});
  const scaleMesh=cyl(lens,1.058,.31,scaleMat,0,0,1.94,1.058,128,true); scaleMesh.rotation.y=-.3;
  text(lens,'50–230',.48,.10,0,.973,.42,{top:true});
  box(lens,.055,.012,.14,white,0,1.069,1.71,.003);
  const circleC=canvas(1024,1024), cc=circleC.getContext('2d');
  const ringWords='FUJINON ASPHERICAL LENS · SUPER EBC XC 50-230mm 1:4.5-6.7 OIS II · Ø58 · ';
  cc.translate(512,512); cc.fillStyle='#d0d6da'; cc.font='27px Arial';cc.textAlign='center';cc.textBaseline='middle';
  [...ringWords].forEach((letter,i)=>{const a=-Math.PI/2+i/ringWords.length*Math.PI*2;cc.save();cc.translate(Math.cos(a)*456,Math.sin(a)*456);cc.rotate(a+Math.PI/2);cc.fillText(letter,0,0);cc.restore();});
  const ringLabel=mesh(lens,new THREE.PlaneGeometry(1.985,1.985),new THREE.MeshBasicMaterial({map:texture(circleC),transparent:true,depthWrite:false}),0,0,3.448); ringLabel.castShadow=false;
  circle(lens,.745,glass,0,0,3.355); ring(lens,.724,.009,cyan,0,0,3.363);
  const innerGlass = new THREE.MeshPhysicalMaterial({color:0x151b37,metalness:.59,roughness:.06,clearcoat:1,transparent:true,opacity:.88});
  circle(lens,.57,innerGlass,0,0,3.36); ring(lens,.47,.011,new THREE.MeshBasicMaterial({color:0x497e8b,transparent:true,opacity:.55}),0,0,3.371);
  circle(lens,.29,new THREE.MeshBasicMaterial({color:0x050a15}),0,0,3.38);
  const reflMat=new THREE.MeshBasicMaterial({color:0x80d4c0,transparent:true,opacity:.23,depthWrite:false});
  const refl=mesh(lens,new THREE.TorusGeometry(.58,.022,4,64,1.45),reflMat,-.02,.01,3.387);refl.rotation.z=.7;
  const refl2=mesh(lens,new THREE.CircleGeometry(.26,40),new THREE.MeshBasicMaterial({color:0x8c67ca,transparent:true,opacity:.14,depthWrite:false}),-.28,.3,3.39);refl2.scale.set(1,.37,1);refl2.rotation.z=-.45;
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const blade=mesh(lens,new THREE.CircleGeometry(.105,3),new THREE.MeshBasicMaterial({color:0x28353a,transparent:true,opacity:.3}),Math.cos(a)*.325,Math.sin(a)*.325,3.375);blade.rotation.z=a+.4;}

  // Sensor cover glass, ceramic carrier and fine bond-pad border.
  const sensor = part('sensor', [.14, -.08, .43], [.1, 1.75, 1.88], [.83, .55, .12]);
  box(sensor,1.94,1.44,.12,darkMetal,0,0,0,.045); box(sensor,1.65,1.16,.065,chip,0,0,.09,.025);
  box(sensor,1.37,.91,.035,gold,0,0,.135,.012);
  const sensorC=canvas(512,340), sec=sensorC.getContext('2d'), grad=sec.createLinearGradient(0,0,512,340);
  grad.addColorStop(0,'#439f8e');grad.addColorStop(.35,'#315e70');grad.addColorStop(.68,'#7773a0');grad.addColorStop(1,'#295f69');sec.fillStyle=grad;sec.fillRect(0,0,512,340);
  sec.globalAlpha=.15;for(let y=0;y<340;y+=4){for(let x=0;x<512;x+=4){sec.fillStyle=((x+y)%8===0)?'#9de7bc':'#1b3350';sec.fillRect(x,y,2,2);}}
  const sensorMat=new THREE.MeshPhysicalMaterial({map:texture(sensorC),roughness:.13,metalness:.53,clearcoat:1});box(sensor,1.285,.842,.017,sensorMat,0,0,.159,.006);
  text(sensor,'X-TRANS CMOS 4',1.1,.07,0,-.64,.071,{opacity:.8});
  for(const x of [-.88,.88])for(const y of [-.61,.61])screw(sensor,x,y,.082,.032,metal);

  // Educational IBIS cradle: moving central aperture, coils and flex connection.
  const ibis = part('ibis', [.14, -.08, .13], [2.85, -.9, .7], [1.05, .6, .2]);
  const is=roundedShape(2.32,1.86,.15), ih=new THREE.Path();ih.moveTo(-.73,-.48);ih.lineTo(-.73,.48);ih.lineTo(.73,.48);ih.lineTo(.73,-.48);ih.closePath();is.holes.push(ih);
  const ig=new THREE.ExtrudeGeometry(is,{depth:.16,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:1});mesh(ibis,ig,darkMetal,0,0,-.07);
  for(const x of [-.99,.99]){box(ibis,.22,1.03,.14,copper,x,0,.13,.015);for(let y=-.44;y<=.44;y+=.085)box(ibis,.245,.016,.018,gold,x,y,.211,.002);}
  for(const y of [-.76,.76]){box(ibis,1.11,.2,.14,copper,0,y,.13,.015);for(let x=-.48;x<=.48;x+=.09)box(ibis,.017,.22,.018,gold,x,y,.211,.002);}
  for(const x of [-.99,.99])for(const y of [-.76,.76])screw(ibis,x,y,.16,.052,metal);
  box(ibis,.53,.32,.035,new THREE.MeshStandardMaterial({color:0xbf8432,roughness:.4,metalness:.6}),.79,-1.03,-.03,.01);
  text(ibis,'5-AXIS IBIS',1.07,.095,0,.62,.121,{opacity:.9});

  // Main board and X-Processor 4. Components are a schematic arrangement.
  const processor = part('processor', [0, -.01, -.32], [-3.05, 1.05, -.15], [-1.3, .75, .18]);
  box(processor,3.48,2.16,.08,circuit,0,0,0,.08);
  const traceMat=new THREE.MeshStandardMaterial({color:0x6aa385,metalness:.7,roughness:.5});
  for(let i=0;i<13;i++){const yy=-.88+i*.143;box(processor,1.11,.009,.004,traceMat,.86,yy,.043,0);box(processor,.008,.045+i*.036,.004,traceMat,.29+i*.095,yy+.1,.044,0);}
  box(processor,1.08,.94,.15,chip,-.49,.23,.12,.025);box(processor,.91,.77,.012,satin,-.49,.23,.204,.008);
  text(processor,'FUJIFILM',.64,.095,-.49,.38,.214,{opacity:.8});text(processor,'X-Processor 4',.76,.09,-.49,.19,.214);text(processor,'IMAGE PROCESSOR',.65,.044,-.49,.05,.214,{opacity:.65});
  const components=[[-1.27,.57,.38,.48],[-1.23,-.2,.4,.53],[-.57,-.65,.54,.3],[.14,-.65,.49,.3],[.89,.6,.56,.32],[1.22,-.2,.39,.66],[.82,-.69,.39,.22]];
  components.forEach(([x,y,w,h],i)=>{box(processor,w,h,.1,chip,x,y,.11,.012);text(processor,i%2?'MEMORY':'IC',w*.76,.055,x,y,.168,{opacity:.55});for(let j=0;j<4;j++){box(processor,.045,.021,.025,metal,x-w/2-.023,y-h*.32+j*h*.21,.085,0);box(processor,.045,.021,.025,metal,x+w/2+.023,y-h*.32+j*h*.21,.085,0);}});
  for(const x of [-1.55,1.55])for(const y of [-.91,.91]){ring(processor,.055,.018,gold,x,y,.055);screw(processor,x,y,.056,.027,metal);}
  box(processor,.7,.19,.13,new THREE.MeshStandardMaterial({color:0xc9c3a7,roughness:.5,metalness:.4}),.6,.92,.11,.01);
  text(processor,'MAIN PCB / SCHEMATIC',1.6,.075,-.13,-.96,.047,{opacity:.7});

  // EVF housing with characteristic central prism silhouette.
  const viewfinder=part('viewfinder',[.12,1.17,-.035],[.25,2.45,-.65],[.75,.62,.2]);
  const vs=new THREE.Shape();vs.moveTo(-.91,-.04);vs.lineTo(-.83,.39);vs.lineTo(-.53,.71);vs.quadraticCurveTo(0,.81,.53,.71);vs.lineTo(.83,.39);vs.lineTo(.91,-.04);vs.closePath();
  const vg=new THREE.ExtrudeGeometry(vs,{depth:.94,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:3});vg.translate(0,0,-.57);mesh(viewfinder,vg,black);
  text(viewfinder,'FUJIFILM',1.28,.215,0,.31,.437,{weight:700,fontSize:86});
  box(viewfinder,1.17,.77,.29,rubber,0,.24,-.74,.11);box(viewfinder,.9,.54,.03,satin,0,.24,-.91,.06);box(viewfinder,.73,.4,.035,glass,0,.24,-.94,.055);
  const eyeGlow=box(viewfinder,.51,.24,.004,new THREE.MeshBasicMaterial({color:0x143343}),0,.24,-.963,.025);eyeGlow.rotation.y=Math.PI;
  // Hotshoe rails and five contacts on the EVF roof.
  box(viewfinder,.67,.047,.54,darkMetal,0,.804,-.04,.015);
  box(viewfinder,.055,.07,.57,metal,-.3,.842,-.04,.009);box(viewfinder,.055,.07,.57,metal,.3,.842,-.04,.009);
  for(let i=0;i<5;i++){const pin=cyl(viewfinder,.027,.02,gold,-.18+i*.09,.842,.1);pin.rotation.x=0;}
  topDial(viewfinder,-.72,.13,-.68,.12,.07);

  // Top plate, mode dial, front/rear command dials and shutter button.
  const top=part('top',[0,1.29,0],[-.15,2.97,.45],[-1.57,.4,.3]);
  box(top,4.35,.22,1.35,black,0,0,-.035,.07);box(top,.94,.2,1.47,black,-1.68,.025,.15,.07);
  topDial(top,1.58,.22,-.1,.43,.2);topDial(top,-1.38,.24,-.32,.43,.22,true);topDial(top,-1.83,.12,.7,.27,.14);
  const shutter=cyl(top,.185,.06,satin,-1.76,.235,.67);shutter.rotation.x=0;
  const shutterCap=cyl(top,.126,.04,black,-1.76,.284,.67);shutterCap.rotation.x=0;
  const shRing=ring(top,.189,.015,metal,-1.76,.27,.67);shRing.rotation.x=-Math.PI/2;
  const red=cyl(top,.081,.023,new THREE.MeshStandardMaterial({color:0x7a2927,metalness:.45,roughness:.4}),-1.18,.145,.58);red.rotation.x=0;
  text(top,'ON',.13,.053,-2.04,.134,.5,{top:true});text(top,'OFF',.16,.053,-2.03,.134,.74,{top:true});text(top,'Fn',.115,.06,-1.02,.135,.36,{top:true});
  const fn=cyl(top,.076,.035,rubber,-.93,.15,.32);fn.rotation.x=0;
  for(const x of [-.99,-.88,-.77])for(const z of [-.52,-.41]){const vent=cyl(top,.016,.01,rubber,x,.126,z,.016,8);vent.rotation.x=0;}
  for(const x of [-2.01,2.02]){const ss=screw(top,x,.134,-.47,.028);ss.rotation.x=0;}

  // Fully articulated rear LCD, shown in its folded-in position at assembly.
  const screen=part('screen',[.39,-.12,-.87],[.45,-.15,-3.2],[1.28,.62,-.08]);
  box(screen,2.81,1.88,.15,rubber,0,0,0,.075);box(screen,2.57,1.62,.032,black,0,.025,-.097,.027);
  const display=canvas(1000,620), dc=display.getContext('2d');
  const dg=dc.createLinearGradient(0,0,0,620);dg.addColorStop(0,'#102329');dg.addColorStop(.56,'#213e40');dg.addColorStop(1,'#0b151a');dc.fillStyle=dg;dc.fillRect(0,0,1000,620);
  dc.fillStyle='#345b5a';dc.beginPath();dc.moveTo(0,430);dc.lineTo(180,263);dc.lineTo(346,402);dc.lineTo(549,195);dc.lineTo(812,426);dc.lineTo(1000,304);dc.lineTo(1000,620);dc.lineTo(0,620);dc.fill();
  dc.fillStyle='#172b30';dc.beginPath();dc.moveTo(0,507);dc.lineTo(332,392);dc.lineTo(550,480);dc.lineTo(813,334);dc.lineTo(1000,420);dc.lineTo(1000,620);dc.lineTo(0,620);dc.fill();
  dc.strokeStyle='#90c8bf55';dc.lineWidth=1;for(let i=1;i<3;i++){dc.beginPath();dc.moveTo(i*1000/3,72);dc.lineTo(i*1000/3,533);dc.stroke();dc.beginPath();dc.moveTo(20,72+i*461/3);dc.lineTo(980,72+i*461/3);dc.stroke();}
  dc.strokeStyle='#79d4bd';dc.lineWidth=3;dc.strokeRect(437,241,126,110);dc.fillStyle='#d3dfdf';dc.font='27px Arial';dc.fillText('M',27,45);dc.fillText('AF-S',109,45);dc.fillText('RAW + F',716,45);dc.fillText('1/250',34,587);dc.fillText('F 5.6',261,587);dc.fillText('ISO 400',732,587);dc.strokeRect(907,22,58,25);dc.fillRect(912,27,43,15);
  dc.font='21px Arial';dc.fillStyle='#9faeaf';dc.fillText('−3···2···1···0···1···2···3',327,548);
  const displayMat=new THREE.MeshBasicMaterial({map:texture(display),toneMapped:false});const displayMesh=mesh(screen,new THREE.PlaneGeometry(2.42,1.49),displayMat,0,.033,-.12);displayMesh.rotation.y=Math.PI;
  text(screen,'FUJIFILM',.5,.073,0,-.827,-.087,{back:true,opacity:.65});
  const hinge=cyl(screen,.12,1.35,darkMetal,1.49,.05,.045,.12,32);hinge.rotation.x=0;
  for(const y of [-.62,.67]){const cap=cyl(screen,.14,.11,black,1.49,y,.045,.14,32);cap.rotation.x=0;}

  // NP-W126S Li-ion battery with contact pads and a readable generated label.
  const battery=part('battery',[-1.64,-.32,-.12],[-3.03,-1.91,.69],[-.44,.48,.43]);
  box(battery,.79,1.62,.65,black,0,0,0,.075);box(battery,.67,.18,.57,satin,0,.69,0,.025);
  for(let i=0;i<4;i++)box(battery,.088,.055,.04,gold,-.22+i*.145,.82,.15,.004);
  box(battery,.64,1.16,.009,new THREE.MeshStandardMaterial({color:0x262c31,roughness:.75}),0,-.1,.337,.02);
  text(battery,'FUJIFILM',.54,.09,0,.34,.345,{weight:600});text(battery,'NP-W126S',.56,.095,0,.1,.347,{weight:600});text(battery,'Li-ion',.4,.07,0,-.11,.347);text(battery,'7.2V  ·  1260mAh',.58,.06,0,-.28,.347,{opacity:.75});text(battery,'8.7Wh',.32,.06,0,-.4,.347,{opacity:.75});text(battery,'▲',.12,.1,0,.64,.345,{opacity:.8});
  for(let i=0;i<15;i++)box(battery,.009,.12,.003,white,-.26+i*.035,-.61,.346,0);

  // Match the 111 mm retracted lens length relative to the 126 mm body width.
  lens.scale.z = 1.13;
  // All descendants inherit a stable part ID for picking and highlighting.
  for(const p of parts){
    p.group.userData.partId=p.id;
    p.group.traverse(o=>{o.userData.partId=p.id;if(o.isMesh){clickable.push(o);o.userData.originalMaterial=o.material;}});
  }
  root.updateMatrixWorld(true);
  return { root, parts, clickable };
}
