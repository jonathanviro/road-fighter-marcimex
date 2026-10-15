import { useCallback, useState } from "react";
import StartScreen from "./screens/StartScreen";
import PlayScreen from "./screens/PlayScreen";
import ResultScreen from "./screens/ResultScreen";
import LockedScreen from "./screens/LockedScreen";
import SettingsScreen from "./screens/SettingsScreen";
import RegistrationModal from "./components/RegistrationModal";
import { isEventActive } from "./game/config";
import type { GameEndReason } from "./game/useGameLoop";
import type { Round } from "./game/ranking";
export default function App() {
  const [screen,setScreen] = useState<"start"|"register"|"playing"|"result"|"settings">("start");
  const [round,setRound] = useState<Round | null>(null);
  const [result,setResult] = useState<{score:number;reason:GameEndReason}>({score:0,reason:"crashes"});
  const end = useCallback((score:number,reason:GameEndReason)=>{setResult({score,reason});setScreen("result");},[]);
  const home = useCallback(()=>{setRound(null);setScreen("start");},[]);
  if (!isEventActive()) return <LockedScreen />;
  if (screen==="settings") return <SettingsScreen onBack={home}/>;
  return <>
    {(screen==="start" || screen==="register") && <StartScreen onPlay={()=>setScreen("register")} onOpenSettings={()=>setScreen("settings")}/>}
    {screen==="register" && <RegistrationModal onCancel={home} onStart={r=>{setRound(r);setScreen("playing");}}/>}
    {(screen==="playing" || screen==="result") && round && <PlayScreen key={round.id} onGameEnd={end}/>}
    {screen==="result" && round && <ResultScreen {...result} round={round} onHome={home}/>}
  </>;
}
