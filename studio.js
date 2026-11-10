const viewer = document.querySelector('#model-viewer');
const scene = viewer.querySelector('svg');
const angle = viewer.querySelector('input');
const modelButtons = [...viewer.querySelectorAll('[data-model]')];
const explode = viewer.querySelector('#explode');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const ns = 'http://www.w3.org/2000/svg';
const faces = [];
let currentModel = 'trailer';
let spread = 0;
let frame;

function solid(rings, colors, offset) {
  const [near, far] = rings;
  faces.push({points: near, color: colors[0], offset}, {points: far, color: colors[1], offset});
  near.forEach((point, i) => {
    const j = (i + 1) % near.length;
    faces.push({points: [point, near[j], far[j], far[i]], color: colors[2 + i % (colors.length - 2)], offset});
  });
}

function box(x,y,z,w,h,d,colors,offset=[0,0,0]) {
  solid([z-d/2,z+d/2].map(depth => [[x-w/2,y-h/2,depth],[x+w/2,y-h/2,depth],[x+w/2,y+h/2,depth],[x-w/2,y+h/2,depth]]), colors, offset);
}

function cylinder(x,y,z,r,length,axis,colors,offset=[0,0,0]) {
  solid([-length/2,length/2].map(end => Array.from({length:16},(_,i)=>{
    const a=i*Math.PI/8;
    const u=Math.cos(a)*r, v=Math.sin(a)*r;
    return axis==='x' ? [x+end,y+u,z+v] : [x+u,y+v,z+end];
  })),colors,offset);
}

const dark=['#29342d','#425148','#354038','#45544b','#637266'];
const orange=['#9b421f','#e57444','#ac4c27','#c85830','#fb925e','#e87545'];
const oak=['#a6744c','#b48154','#855637','#9a6844','#e4b986','#c29161'];
const metal=['#80948a','#a6baae','#617a70','#758f83','#9fb2a8'];
const rubber=['#323733','#303732','#111613','#1c231e','#242c26'];
function build() {
  faces.length=0;
  if (currentModel==='trailer') {
    box(-4,-8,0,164,12,70,dark);
    box(92,-8,0,32,8,12,orange);
    for (const x of [-45,38]) {
      box(x,-19,0,9,8,89,metal,[0,-8,0]);
      for (const side of [-1,1]) {
        cylinder(x,-25,side*40,21,13,'z',rubber,[0,-8,side*19]);
        cylinder(x,-25,side*47,9,4,'z',metal,[0,-8,side*19]);
      }
    }
    for (const x of [-52,35]) box(x,1,0,11,11,56,orange,[0,13,0]);
    cylinder(-9,29,0,29,143,'x',orange,[0,43,0]);
    box(-9,58,0,24,8,19,metal,[0,55,0]);
  } else {
    for (const x of [-65,65]) for (const z of [-25,25]) {
      box(x,-12,z,8,66,8,metal,[Math.sign(x)*15,-15,Math.sign(z)*12]);
    }
    box(0,23,0,157,8,74,oak,[0,24,0]);
    box(0,43,0,140,34,6,orange,[0,48,0]);
  }
}

function render() {
  const a=Number(angle.value)*Math.PI/180;
  const pitch=0.48;
  const projected=faces.map(face=>{
    const corners=face.points.map((point)=>{
      const [x,y,z]=point.map((value,i)=>value+face.offset[i]*spread);
      const rx=x*Math.cos(a)-z*Math.sin(a);
      const rz=x*Math.sin(a)+z*Math.cos(a);
      const screenY=y*Math.cos(pitch)-rz*Math.sin(pitch);
      const depth=y*Math.sin(pitch)+rz*Math.cos(pitch);
      const scale=370/(370-depth);
      return [220+rx*1.5*scale,168-screenY*1.5*scale,depth];
    });
    return {corners, depth:corners.reduce((sum,point)=>sum+point[2],0)/corners.length,color:face.color};
  }).sort((a,b)=>a.depth-b.depth);
  const shapes=projected.map(({corners,color})=>{
    const polygon=document.createElementNS(ns,'polygon');
    polygon.setAttribute('points',corners.map(([x,y])=>x.toFixed(1)+','+y.toFixed(1)).join(' '));
    polygon.setAttribute('fill',color);
    polygon.setAttribute('stroke',color);
    polygon.setAttribute('stroke-width','0.8');
    return polygon;
  });
  scene.querySelector('g').replaceChildren(...shapes);
}

function changeModel(model) {
  cancelAnimationFrame(frame);
  currentModel=model;
  spread=0;
  explode.setAttribute('aria-pressed','false');
  for(const button of modelButtons) button.setAttribute('aria-pressed',String(button.dataset.model===model));
  viewer.querySelector('#model-name').textContent=model==='trailer'?'Trailer-mounted tanker concept':'Modular workstation concept';
  build();
  render();
}

explode.addEventListener('click',()=>{
  const expanded=explode.getAttribute('aria-pressed')!=='true';
  const target=Number(expanded);
  explode.setAttribute('aria-pressed',String(expanded));
  cancelAnimationFrame(frame);
  if(motion.matches){spread=target;render();return;}
  const start=performance.now();
  const initial=spread;
  function animate(now){
    const t=Math.min((now-start)/330,1);
    spread=initial+(target-initial)*(1-(1-t)**3);
    render();
    if(t<1)frame=requestAnimationFrame(animate);
  }
  frame=requestAnimationFrame(animate);
});
for(const button of modelButtons)button.addEventListener('click',()=>changeModel(button.dataset.model));
angle.addEventListener('input',render);
viewer.querySelector('.viewer-controls').hidden=false;
changeModel(currentModel);
