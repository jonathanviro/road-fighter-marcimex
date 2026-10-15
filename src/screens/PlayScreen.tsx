import { useRef, useState } from "react";
import { useGameLoop, type GameEndReason } from "../game/useGameLoop";
import InstructionsOverlay from "../components/InstructionsOverlay";
import Confetti from "../components/Confetti";
export default function PlayScreen({ onGameEnd }: { onGameEnd: (score: number, reason: GameEndReason) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const { ready, hud, error } = useGameLoop({ canvasRef, onGameEnd, started });
  return <div style={{position:"fixed",inset:0,background:"#111"}}>
    {!ready && <div className="loading">{error || "CARGANDO MOTOPOWER…"}</div>}
    <canvas ref={canvasRef} style={{display:"block",width:"100%",height:"100%",touchAction:"none"}} />
    {ready && !started && <InstructionsOverlay onStart={() => setStarted(true)} />}
    {hud.finished && <Confetti />}
  </div>;
}
