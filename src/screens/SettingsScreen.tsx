import { useState } from "react";
import { defaultSettings, loadSettings, saveSettings, type GameSettings } from "../game/config";
import ScreenScale from "../components/ScreenScale";

const fields: {key:keyof GameSettings;label:string;min:number;max:number;step:number;unit?:string;help:string}[] = [
  {key:"duration",label:"DURACIÓN",min:5,max:120,step:5,unit:"s",help:"Subir: más tiempo para sumar puntos, pero también para gastar energía y sufrir choques. Bajar: partidas más cortas y menos oportunidades de puntuar."},
  {key:"lives",label:"VIDAS",min:1,max:9,step:1,help:"Subir: permite más choques antes de perder. Bajar: hace el recorrido más exigente. Quedarse sin energía termina la partida aunque queden vidas."},
  {key:"fuelPoints",label:"PUNTOS POR COMBUSTIBLE",min:0,max:1000,step:5,unit:"pts",help:"Subir: cada combustible suma más puntos al ranking. Bajar: reduce su recompensa. No cambia la energía recuperada ni la duración del impulso."},
  {key:"fuelInterval",label:"INTERVALO DE COMBUSTIBLE",min:1,max:30,step:1,unit:"s",help:"Subir los segundos: aparece menos combustible y cuesta más mantener la energía. Bajar: aparece más seguido, con más puntos e impulsos; puede mantener el impulso activo al recogerlo continuamente."},
  {key:"oilInterval",label:"INTERVALO DE ACEITE",min:1,max:30,step:1,unit:"s",help:"Subir los segundos: aparece menos aceite y hay menos penalizaciones. Bajar: aparece más seguido y aumenta la dificultad."},
  {key:"speedPercent",label:"VELOCIDAD DEL JUEGO",min:50,max:200,step:10,unit:"%",help:"100% es la velocidad original. Subir: la carretera, el tráfico y los objetos pasan más rápido y hay menos tiempo para reaccionar. Bajar: pasan más despacio. La duración y el consumo de energía por segundo se mantienen."},
  {key:"oilPenalty",label:"PUNTOS QUE RESTA EL ACEITE",min:0,max:9999,step:10,unit:"pts",help:"Subir: pisar aceite descuenta más puntos. Bajar: reduce la penalización; 0 desactiva el descuento. El puntaje nunca baja de cero."},
  {key:"oilSlowSeconds",label:"DURACIÓN DEL FRENO DEL ACEITE",min:1,max:15,step:1,unit:"s",help:"Subir: el freno dura más. Bajar: se recupera la velocidad antes. El aceite cancela el impulso; recoger combustible elimina el freno y activa uno nuevo."},
];

export default function SettingsScreen({onBack}:{onBack:()=>void}) {
  const [settings,setSettings] = useState(loadSettings);
  const [message,setMessage] = useState("");
  function change(key:keyof GameSettings,value:number) {
    setSettings(current=>({...current,[key]:value}));
    setMessage("CAMBIOS SIN GUARDAR");
  }
  function save() {
    try {saveSettings(settings);setSettings(loadSettings());setMessage("CONFIGURACIÓN GUARDADA. SE APLICARÁ A LA PRÓXIMA PARTIDA.");}
    catch {setMessage("NO SE PUDO GUARDAR LA CONFIGURACIÓN");}
  }
  return <ScreenScale background="assets/vyliun/background-vyliun-with-logo.png">
    <section className="vyliun-settings" aria-labelledby="settings-title">
      <header><p className="vyliun-settings-kicker">CONTROL DEL EVENTO</p><h1 id="settings-title"><span className="sr-only">VYLIUN · </span>Configuración del juego</h1><p className="vyliun-settings-intro">Ajusta la experiencia. Cada opción explica el efecto de subir o bajar su valor.</p></header>
      <div className="vyliun-settings-fields" role="region" aria-label="Parámetros del juego" tabIndex={0}>
        {fields.map(f=><div className="vyliun-setting-group" key={f.key}>
          <div className="setting"><span id={`label-${f.key}`}>{f.label}</span><div className="stepper" role="group" aria-labelledby={`label-${f.key}`} aria-describedby={`help-${f.key}`}>
            <button aria-label={`Reducir ${f.label}`} disabled={settings[f.key]<=f.min} onClick={()=>change(f.key,Math.max(f.min,settings[f.key]-f.step))}>−</button>
            <output aria-label={f.label} aria-live="polite">{settings[f.key]}<small>{f.unit}</small></output>
            <button aria-label={`Aumentar ${f.label}`} disabled={settings[f.key]>=f.max} onClick={()=>change(f.key,Math.min(f.max,settings[f.key]+f.step))}>+</button>
          </div></div>
          <p id={`help-${f.key}`} className="vyliun-setting-help">{f.help}</p>
          <p className="vyliun-setting-default">VALOR INICIAL: {defaultSettings[f.key]} {f.unit}</p>
        </div>)}
        <p className="vyliun-settings-note">Los intervalos indican cada cuánto se intenta crear un objeto. Si no hay espacio seguro, esa aparición se omite. El primer combustible puede aparecer desde el segundo 3. Al acercarse la meta dejan de aparecer objetos.</p>
        <p className="vyliun-settings-note">Cambiar estos valores puede favorecer o dificultar las próximas partidas. El ranking existente conserva sus puntajes.</p>
        <p className="vyliun-settings-note">VIGENCIA: 14 OCT 2026 — 14 ENE 2027<br/>RESULTADOS GUARDADOS EN ESTE EQUIPO</p>
      </div>
      <footer className="vyliun-settings-footer"><p className="vyliun-settings-status" role="status" aria-live="polite">{message || "DESLIZA PARA VER TODAS LAS OPCIONES"}</p><div className="actions"><button className="primary" onClick={save}>GUARDAR</button><button className="secondary" onClick={onBack}>VOLVER</button></div></footer>
    </section>
  </ScreenScale>;
}
