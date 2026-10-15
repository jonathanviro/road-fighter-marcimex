const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const PORT = Number(process.env.PORT || 5550);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const FILE = path.join(DATA_DIR, 'ranking.json');
const START = new Date('2026-10-14T00:00:00-05:00').getTime();
const END = new Date('2027-01-14T23:59:59-05:00').getTime();
fs.mkdirSync(DATA_DIR, {recursive: true});
let database = {sequence: 0, entries: []};
if (fs.existsSync(FILE)) {
  // Fail visibly instead of replacing an unreadable ranking with an empty one.
  database = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  if (!Array.isArray(database.entries) || !Number.isSafeInteger(database.sequence)) throw new Error('Ranking local inválido. Restaure una copia de seguridad.');
}
function save(next) {
  const temp = FILE + '.tmp';
  const fd = fs.openSync(temp, 'w');
  try {fs.writeFileSync(fd, JSON.stringify(next, null, 2));fs.fsyncSync(fd);} finally {fs.closeSync(fd);}
  if (fs.existsSync(FILE)) fs.copyFileSync(FILE, FILE + '.bak');
  fs.renameSync(temp, FILE);
  database = next;
}
const pending = new Map();
app.use(express.json({limit: '8kb'}));
app.use((req,res,next) => {
  if (process.env.DISABLE_DATE_LOCK === '1' || (Date.now() >= START && Date.now() <= END)) return next();
  if(req.path.startsWith('/api/')) return res.status(403).json({error:'La campaña está fuera de su período de vigencia.'});
  res.status(403).send('<!doctype html><html lang="es"><meta charset="UTF-8"><title>MotoPower</title><body style="background:#123b74;color:white;font:24px system-ui;text-align:center;padding:20vh 10vw"><h1>MOTOPOWER</h1><p>Este juego está disponible del 14 de octubre de 2026 al 14 de enero de 2027.</p></body></html>');
});
function normalized(value) {return typeof value === 'string' ? value.toUpperCase().normalize('NFC').trim().replace(/\s+/g,' ') : '';}
function ranking(name) {
  const entries = [...database.entries].sort((a,b) => b.score-a.score || a.order-b.order);
  const ranked = entries.map((e,i) => ({name:e.name,score:e.score,rank:i+1}));
  return {top:ranked.slice(0,10),current:ranked.find(e=>e.name===name),total:ranked.length};
}
app.get('/api/health',(req,res)=>res.json({app:'motopower-marcimex',offline:true}));
app.post('/api/rounds',(req,res) => {
  const name = normalized(req.body.name);
  if(!/^[A-ZÑ ]{1,20}$/.test(name)) return res.status(400).json({error:'Escribe entre 1 y 20 letras, usando el teclado del juego.'});
  const existing = database.entries.find(e=>e.name===name);
  if(existing && (!req.body.overwrite || req.body.revision!==existing.order)) return res.json({exists:true,revision:existing.order});
  // Only one screen plays at a time. Expire abandoned registrations.
  for(const [id,round] of pending) if(Date.now()-round.created>24*60*60*1000) pending.delete(id);
  const id = crypto.randomUUID();
  pending.set(id,{name,revision:existing?.order ?? null,created:Date.now()});
  res.json({round:{id,name}});
});
app.post('/api/results',(req,res) => {
  const {roundId,score,reason} = req.body;
  const already = database.entries.find(e=>e.roundId===roundId);
  if(already) return res.json(ranking(already.name));
  const round = pending.get(roundId);
  if(!round) return res.status(400).json({error:'No se encontró la partida local. Mantén el servidor abierto durante el juego.'});
  if(!Number.isSafeInteger(score) || score<0 || score>1000000 || !['finished','fuel','crashes'].includes(reason)) return res.status(400).json({error:'Resultado inválido.'});
  const previous = database.entries.find(e=>e.name===round.name);
  if((previous?.order ?? null)!==round.revision) return res.status(409).json({error:'Este participante fue actualizado por otra partida. No se ha reemplazado su resultado.'});
  const order = database.sequence+1;
  const entry = {name:round.name,score,reason,order,roundId,updatedAt:new Date().toISOString()};
  try {
    save({sequence:order,entries:[...database.entries.filter(e=>e.name!==round.name),entry]});
    pending.delete(roundId);
    res.json(ranking(round.name));
  } catch(e) {console.error('No se pudo guardar el ranking:',e.message);res.status(500).json({error:'No se pudo guardar en el disco local. Revisa el espacio y los permisos y vuelve a intentar.'});}
});
app.use('/api',(req,res)=>res.status(404).json({error:'Operación local no disponible.'}));
app.use(express.static(path.join(__dirname,'dist')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'dist','index.html')));
app.use((err,req,res,next)=>res.status(400).json({error:'Solicitud inválida.'}));
app.listen(PORT,'127.0.0.1',()=>console.log(`MotoPower offline: http://localhost:${PORT} · Datos: ${FILE}`));
