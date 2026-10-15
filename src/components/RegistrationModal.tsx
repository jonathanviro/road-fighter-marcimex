import { useState } from "react";
import BrandModal from "./BrandModal";
import { api, type Round } from "../game/ranking";
export default function RegistrationModal({onStart,onCancel}: {onStart: (round:Round)=>void;onCancel:()=>void}) {
  const [name,setName] = useState("");
  const [duplicate,setDuplicate] = useState(false);
  const [revision,setRevision] = useState<number | null>(null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const edit = (next:string) => {setName(next);setDuplicate(false);setRevision(null);setError("");};
  async function submit(overwrite = false) {
    if (!name.trim() || busy) return;
    setBusy(true);setError("");
    try {
      const result = await api<{exists?:boolean;revision?:number;round?:Round}>("rounds", {name,overwrite,revision});
      if (result.exists) {setDuplicate(true);setRevision(result.revision ?? null);}
      else if (result.round) onStart(result.round);
    } catch(e) {setError((e as Error).message);} finally {setBusy(false);}
  }
  return <BrandModal wide>
    <p className="eyebrow">BIKE LIFE · MARCIMEX</p><h1>¿CÓMO TE LLAMAS?</h1>
    <p>Tu nombre aparecerá en el ranking.</p>
    <div role="textbox" aria-label="Nombre del participante" aria-readonly="true" className="name-display">{name || <span>ESCRIBE TU NOMBRE</span>}</div>
    <div className="keyboard" aria-label="Teclado MotoPower">
      {["QWERTYUIOP","ASDFGHJKLÑ","ZXCVBNM"].map(row => <div className="key-row" key={row}>{[...row].map(key => <button disabled={busy || name.length>=20} key={key} onClick={()=>edit(name+key)}>{key}</button>)}</div>)}
      <div className="key-row"><button disabled={busy || !name.length} className="key-action" onClick={()=>edit(name.slice(0,-1))}>⌫ BORRAR</button><button disabled={busy || name.length>=20 || !name.length || name.endsWith(" ")} className="key-space" onClick={()=>edit(name+" ")}>ESPACIO</button></div>
    </div>
    {duplicate && <div className="notice">Ya existe un participante llamado <strong>{name.trim()}</strong>. Si eres tú, el resultado de esta partida reemplazará tu puntaje anterior, aunque sea menor. Si eres otra persona, utiliza otro nombre.
      <div className="actions"><button className="primary" disabled={busy} onClick={()=>submit(true)}>SOY YO, CONTINUAR</button><button className="secondary" disabled={busy} onClick={()=>edit("")}>CAMBIAR NOMBRE</button></div>
    </div>}
    {error && <p role="alert" className="error">{error}</p>}
    {!duplicate && <button className="primary full" disabled={!name.trim() || busy} onClick={()=>submit()}>{busy ? "PREPARANDO…" : "CONFIRMAR Y CONTINUAR"}</button>}
    <button className="text-button" disabled={busy} onClick={onCancel}>VOLVER</button>
  </BrandModal>;
}
