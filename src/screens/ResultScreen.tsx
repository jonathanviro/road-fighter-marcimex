import { useEffect, useState } from "react";
import BrandModal from "../components/BrandModal";
import type { GameEndReason } from "../game/useGameLoop";
import { api, type Round, type Ranking, type Entry } from "../game/ranking";
export default function ResultScreen({score,reason,round,onHome}:{score:number;reason:GameEndReason;round:Round;onHome:()=>void}) {
  const [ranking,setRanking] = useState<Ranking | null>(null);
  const [error,setError] = useState("");
  const [attempt,setAttempt] = useState(0);
  const [seconds,setSeconds] = useState(20);
  useEffect(()=>{
    let live = true;
    setError("");
    api<Ranking>("results",{roundId:round.id,score,reason}).then(r=>{if(live)setRanking(r);}).catch(e=>{if(live)setError(e.message);});
    return ()=>{live=false;};
  },[round.id,score,reason,attempt]);
  useEffect(()=>{
    if (!ranking) return;
    const timer = setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);
    return ()=>clearInterval(timer);
  },[ranking]);
  useEffect(()=>{if(ranking && seconds===0)onHome();},[seconds,ranking,onHome]);
  const row = (e:Entry) => <div className={`rank-row ${e.name===round.name ? "mine" : ""}`} key={e.name}><b>{String(e.rank).padStart(2,"0")}</b><span>{e.name}{e.name===round.name && <small> TÚ</small>}</span><strong>{e.score.toLocaleString("es-EC")}</strong></div>;
  return <BrandModal wide><p className="eyebrow">{reason==="finished" ? "¡COMPLETASTE EL RECORRIDO!" : reason==="fuel" ? "¡TE QUEDASTE SIN ENERGÍA!" : "¡TE QUEDASTE SIN VIDAS!"}</p>
    <h1>{round.name}</h1><p className="score-label">TU PUNTAJE</p><div className="final-score">{score.toLocaleString("es-EC")}</div>
    {ranking ? <><div className="ranking-title"><h2>TOP 10</h2><span>ESTÁS EN EL PUESTO #{ranking.current.rank}</span></div>
      <div className="rank-row rank-head"><span>#</span><span>PARTICIPANTE</span><span>PUNTOS</span></div>
      {ranking.top.map(row)}
      {ranking.current.rank>10 && <div className="own-rank"><p>TU POSICIÓN</p>{row(ranking.current)}</div>}
      <p className="muted">{ranking.total} PARTICIPANTES · RESULTADO GUARDADO</p>
      <button className="primary full" onClick={onHome}>VOLVER AL INICIO · {seconds}s</button>
    </> : error ? <><p className="error" role="alert">{error}</p><p>Tu resultado sigue aquí. Reintenta el guardado para continuar.</p><button className="primary full" onClick={()=>setAttempt(a=>a+1)}>REINTENTAR GUARDADO</button></> : <p role="status">GUARDANDO RESULTADO EN EL EQUIPO…</p>}
  </BrandModal>;
}
