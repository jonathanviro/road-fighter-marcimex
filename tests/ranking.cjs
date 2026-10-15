const {spawn}=require('child_process');
const fs=require('fs');
const assert=require('assert/strict');
const base='http://127.0.0.1:5567';
const project=require('path').resolve(__dirname,'..');
const data=fs.mkdtempSync(require('path').join(require('os').tmpdir(),'motopower-test-'));
process.on('exit',()=>fs.rmSync(data,{recursive:true,force:true}));
let server;
const start=async()=>{server=spawn(process.execPath,[project+'/server.cjs'],{env:{...process.env,PORT:'5567',DATA_DIR:data},stdio:'pipe'});await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('exit',c=>reject(Error('Server exit '+c)));});};
const stop=async()=>{const s=server;await new Promise(resolve=>{s.once('exit',resolve);s.kill();});};
async function api(route,data){const r=await fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:r.status,...await r.json()};}
(async()=>{await start();
  let out;
  for(let i=0;i<50;i++){
    const name='PILOTO '+String.fromCharCode(65+Math.floor(i/26))+String.fromCharCode(65+i%26);
    const r=await api('rounds',{name});assert.ok(r.round);
    out=await api('results',{roundId:r.round.id,score:5000-i*10,reason:'finished'});
    const twice=await api('results',{roundId:r.round.id,score:5000-i*10,reason:'finished'});assert.equal(twice.total,i+1);
  }
  assert.equal(out.top.length,10);assert.equal(out.current.rank,50);assert.equal(out.total,50);
  let duplicate=await api('rounds',{name:'  piloto   aa  '});assert.ok(duplicate.exists);
  assert.ok((await api('rounds',{name:'PILOTO AA',overwrite:true,revision:-1})).exists);
  let r=await api('rounds',{name:'PILOTO AA',overwrite:true,revision:duplicate.revision});
  out=await api('results',{roundId:r.round.id,score:0,reason:'crashes'});assert.equal(out.current.rank,50);assert.equal(out.current.score,0);assert.equal(out.total,50);
  assert.equal((await api('rounds',{name:'<script>'})).status,400);
  const bad=await api('rounds',{name:'PRUEBA'});assert.equal((await api('results',{roundId:bad.round.id,score:-1,reason:'finished'})).status,400);
  await stop();await start();assert.ok((await api('rounds',{name:'PILOTO AA'})).exists);
  console.log('PASS API: 50 participantes, top 10 + puesto 50, normalización, consentimiento, reemplazo menor, idempotencia, validación y persistencia tras reinicio.');
  await stop();
})().catch(async e=>{console.error(e);if(server)server.kill();process.exit(1);});
