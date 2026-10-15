const fs=require('fs');const vm=require('vm');const assert=require('assert/strict');
const project=require('path').resolve(__dirname,'..');
const esbuild=require(project+'/node_modules/esbuild');
const bundle=esbuild.buildSync({entryPoints:[project+'/src/game/useGameLoop.ts'],bundle:true,platform:'node',format:'cjs',external:['react'],write:false}).outputFiles[0].text;
async function simulate(settings,mode){
 let slots=[],idx=0,effects=[],effectSlots=[],now=0,nextFrame,draws=[],labels=[],listeners={},snapshots=[],ended=[],timers=[];
 const react={useState(initial){let i=idx++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;if(slots[i]&&typeof slots[i]==='object'&&'progressPct'in slots[i])snapshots.push({...slots[i]});}];},useRef(value){let i=idx++;if(!(i in slots))slots[i]={current:value};return slots[i];},useEffect(fn,deps){let i=idx++;if(!effectSlots[i]||deps.some((v,j)=>v!==effectSlots[i].deps[j])){effects.push(()=>{effectSlots[i]?.cleanup?.();effectSlots[i]={deps,cleanup:fn()};});}}};
 const ctx=new Proxy({drawImage:(image,x,y,w,h)=>draws.push({src:image.src,x,y,w,h}),fillText:(text)=>labels.push(text),createRadialGradient:()=>({addColorStop(){}})}, {get:(t,k)=>t[k]||(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
 const canvas={width:1080,height:1920,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0}),addEventListener:(name,fn)=>listeners[name]=fn,removeEventListener(){},setPointerCapture(){},hasPointerCapture:()=>false};
 class Image {set src(v){this._src=v;const b=fs.readFileSync(project+'/public/'+v);this.width=b.readUInt32BE(16);this.height=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}get src(){return this._src;}}
 class Audio {play(){return Promise.resolve();}pause(){}}
 let seed=42;const math=Object.create(Math);math.random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 const sandbox={module:{exports:{}},exports:{},require:n=>n==='react'?react:require(n),Image,Audio,Math:math,performance:{now:()=>now},window:{innerWidth:1080,innerHeight:1920},localStorage:{getItem:()=>JSON.stringify(settings)},addEventListener(){},removeEventListener(){},setTimeout:(fn,ms)=>{const timer={fn,at:now+ms};timers.push(timer);return timer;},clearTimeout:t=>timers=timers.filter(x=>x!==t),requestAnimationFrame:fn=>(nextFrame=fn,1),cancelAnimationFrame(){},console};
 vm.runInNewContext(bundle,sandbox);
 const render=()=>{idx=0;sandbox.module.exports.useGameLoop({canvasRef:{current:canvas},started:true,onGameEnd:(score,reason)=>ended.push({score,reason,at:now})});const q=effects;effects=[];q.forEach(fn=>fn());};
 render();await new Promise(resolve=>setImmediate(resolve));render();
 let seen=new Set(),laneXs=new Set(),oilBefore,oilAfter,hitOil=false,pickedFuel=false,previousFuel=100;
 let fuelBirths=0,oilBirths=0,firstCarY; const lastY=new Map();
 const move=(x,y)=>listeners.pointerdown({pointerId:1,preventDefault(){},clientX:x,clientY:y});
 for(let i=0;i<2300&&!ended.length;i++){
  now+=50;draws=[];const fn=nextFrame;fn(now);
  for(const d of draws){if(d.src.includes('enemy_car_')){seen.add(d.src.match(/enemy_car_(.).png/)[1]);laneXs.add(d.x+d.w/2);}}
  for(const d of draws){
    const key=d.src+":"+(d.x+d.w/2);
    if(d.y<0 && (!lastY.has(key) || d.y<lastY.get(key)-30)){
      if(d.src.endsWith('/fuel_item.png'))fuelBirths++;
      if(d.src.endsWith('/obstacle_oilslick.png'))oilBirths++;
    }
    lastY.set(key,d.y);
  }
  if(now===6500)firstCarY=draws.find(d=>d.src.includes('enemy_car_'))?.y;
  const hud=snapshots.at(-1);
  if(mode==='fuel'){
   const target=draws.find(d=>d.src.endsWith('/fuel_item.png')&&d.y>430&&d.y<1600);
   if(target)move(target.x+target.w/2,target.y+target.h/2);
   if(hud?.fuel>previousFuel)pickedFuel=true;
  }
  if(mode==='oil'){
   const target=draws.find(d=>d.src.endsWith('/obstacle_oilslick.png')&&d.y>430&&d.y<1600);
   if(target&&!hitOil){oilBefore=hud.score;move(target.x+target.w/2,target.y+target.h/2);hitOil=true;}
   if(hitOil&&oilAfter===undefined&&hud.score<oilBefore)oilAfter=hud.score;
  }
  previousFuel=hud?.fuel ?? previousFuel;
  const due=timers.filter(t=>t.at<=now);timers=timers.filter(t=>t.at>now);due.forEach(t=>t.fn());
 }
 return {ended,snapshots,seen,laneXs,oilBefore,oilAfter,pickedFuel,labels,fuelBirths,oilBirths,firstCarY};
}
(async()=>{
 const short=await simulate({duration:5,lives:3,oilPenalty:100,oilSlowSeconds:3});assert.equal(short.ended[0].reason,'finished');assert.equal(short.snapshots[0].lives,3);assert.ok(short.ended[0].at>=8000 && short.ended[0].at<8700);
 const oil=await simulate({duration:90,lives:9,oilPenalty:100,oilSlowSeconds:3},'oil');assert.ok(oil.oilAfter<oil.oilBefore);assert.ok(oil.snapshots.every(h=>h.score>=0));assert.equal(oil.seen.size,6);assert.equal(oil.laneXs.size,4);
 const fuel=await simulate({duration:90,lives:9,oilPenalty:100,oilSlowSeconds:3},'fuel');assert.ok(fuel.pickedFuel);
 const reward=await simulate({duration:30,lives:9,fuelPoints:175,fuelInterval:2,oilInterval:30},'fuel');
 assert.ok(reward.labels.includes('+175 PUNTOS'));
 assert.ok(reward.labels.some(t=>typeof t==='string'&&t.includes('ENERGÍA')));
 const frequent=await simulate({duration:30,lives:9,fuelInterval:1,oilInterval:1});
 const rare=await simulate({duration:30,lives:9,fuelInterval:30,oilInterval:30});
 assert.ok(frequent.fuelBirths>rare.fuelBirths);assert.ok(frequent.oilBirths>rare.oilBirths);
 const slow=await simulate({duration:30,lives:9,fuelInterval:30,oilInterval:30,speedPercent:50});
 const fast=await simulate({duration:30,lives:9,fuelInterval:30,oilInterval:30,speedPercent:200});
 assert.ok(fast.firstCarY>slow.firstCarY);
 const config=esbuild.buildSync({entryPoints:[project+'/src/game/config.ts'],bundle:true,platform:'node',format:'cjs',write:false}).outputFiles[0].text;
 const scope={module:{exports:{}}};vm.runInNewContext(config,scope);
 const original=scope.module.exports.sanitizeSettings({lives:4});
 assert.equal(original.lives,4);assert.equal(original.fuelPoints,50);assert.equal(original.speedPercent,100);
 const invalid=scope.module.exports.sanitizeSettings({fuelInterval:0,oilInterval:Infinity,speedPercent:999,fuelPoints:-1});
 assert.equal(invalid.fuelInterval,1);assert.equal(invalid.oilInterval,5);assert.equal(invalid.speedPercent,200);assert.equal(invalid.fuelPoints,0);
 console.log('PASS nuevos ajustes: recompensa de 175 puntos y aviso de energía, intervalos alteran apariciones de combustible/aceite, velocidad altera el movimiento, valores antiguos compatibles y límites validados.');
 console.log('PASS motor: nivel único de 5s + cuenta atrás, vidas configurables, aceite resta puntos sin negativos, seis enemigos centrados en cuatro carriles, combustible recupera energía.');
})().catch(e=>{console.error(e);process.exit(1);});
