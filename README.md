# MotoPower · Marcimex

Juego arcade de conducción desarrollado por **VYLIUN** para una activación presencial de MotoPower / Marcimex. El participante controla una moto, esquiva tráfico y recoge combustible para sumar puntos. Al terminar, ve el top 10 y su posición en el ranking.

Está diseñado para **una sola pantalla táctil vertical**, con un lienzo de referencia de **1080 × 1920**, y funciona **offline** después de preparar el equipo. El servidor se ejecuta en el mismo computador: no utiliza servicios en la nube.

## Características

- Un nivel de duración configurable y dificultad progresiva.
- Carretera de cuatro carriles; cuatro autos, una moto y una bicicleta como obstáculos.
- Movimiento del jugador con el dedo o arrastrando con el mouse, horizontal y verticalmente.
- Registro mediante un teclado propio con letras mayúsculas, Ñ, espacio y borrar; no abre el teclado del sistema.
- Energía que disminuye continuamente y vidas configurables.
- Combustible que recupera energía, suma puntos y activa un impulso.
- Aceite que resta puntos, cancela el impulso y reduce temporalmente la velocidad, sin quitar vidas.
- Ranking local persistente y confirmación para reemplazar participantes existentes.
- Menú de configuración con identidad VYLIUN y ayuda para cada ajuste.
- Imágenes, audio y tipografías disponibles localmente.

## Tecnologías y requisitos

React 19, TypeScript, Vite y Canvas 2D para la interfaz y el juego; Node.js y Express para servir la aplicación y guardar los resultados.

Para desarrollar o compilar:

- **Node.js 22.12 o superior**, o Node.js 20.19 dentro de la rama 20.
- npm.
- Google Chrome para probar el modo quiosco.

La primera instalación de dependencias requiere conexión, salvo que ya estén disponibles en la caché de npm. El juego preparado puede ejecutarse sin internet. El equipo debe tener permisos de escritura en la carpeta donde se guardará el ranking.

## Instalación

Desde la raíz del repositorio:

```bash
npm ci
npm run build
```

## Ejecutar la aplicación local

Con la compilación ya generada:

```bash
npm run server
```

Abrir **http://127.0.0.1:5550**. Mantener la terminal abierta mientras se utiliza el juego. Para detener el servidor, presionar **Control + C** en esa terminal.

También se puede compilar e iniciar en un solo paso:

```bash
npm start
```

`npm run server` utiliza la carpeta `dist/` existente. Después de modificar el código, ejecutar `npm run build` y recargar el navegador.

> Utilizar siempre la misma dirección del navegador y la misma carpeta de ejecución durante el evento. El ranking pertenece al servidor local utilizado y los ajustes se guardan por origen en el navegador.

## Desarrollo con recarga automática

Abrir dos terminales en la raíz del proyecto:

```bash
# Terminal 1: API y guardado local
npm run server
```

```bash
# Terminal 2: interfaz con recarga automática
npm run dev
```

Abrir la dirección que indique Vite, normalmente **http://localhost:5173**. Vite redirige las llamadas `/api` al servidor local en el puerto 5550.

**`npm run preview` no sustituye a Express**: sirve la interfaz compilada, pero no implementa el registro ni el ranking. Para probar el flujo completo, utilizar `npm run server` o el modo de desarrollo con ambas terminales.

## Pantalla completa y modo quiosco

La aplicación debe estar ejecutándose antes de abrir Chrome. En una pantalla horizontal se conserva la proporción vertical del juego, con espacio libre a los lados. Para el montaje final, configurar la pantalla del equipo en orientación vertical.

### macOS

Pantalla completa normal: abrir la aplicación en Chrome y presionar **Control + Command + F**.

Modo quiosco, desde otra terminal:

```bash
open -na "Google Chrome" --args --kiosk http://127.0.0.1:5550
```

Si Chrome reutiliza una ventana existente sin activar el modo, cerrarlo por completo y repetir el comando. Para salir del quiosco, presionar **Command + Q**; esto cierra Chrome y sus ventanas.

### Windows

Pantalla completa normal: abrir la aplicación en Chrome y presionar **F11**. Presionar F11 nuevamente para salir.

Modo quiosco desde PowerShell, ajustando la ruta si Chrome está instalado en otra ubicación:

```powershell
& "$env:ProgramFiles\Google\Chrome\Application\chrome.exe" --kiosk http://127.0.0.1:5550
```

Para cerrar la ventana de quiosco, presionar **Alt + F4**. Cerrar el navegador no detiene el servidor.

El modo quiosco de Chrome oculta la interfaz del navegador; no configura un bloqueo de acceso al sistema operativo.

## Flujo y reglas

```text
Inicio → Nombre del participante → Instrucciones → Cuenta regresiva
       → Partida → Resultado y ranking → Inicio
```

- El recorrido dura 90 segundos por defecto, sin contar instrucciones ni cuentas regresivas por pérdida de vida.
- Cada choque con un vehículo consume una vida. Al agotarlas termina la partida.
- La energía comienza en 100 y se consume a razón de 1,5 unidades por segundo de juego activo. Agotarla también termina la partida.
- Cada combustible recupera hasta 15 unidades de energía, sin superar 100, y activa un impulso de 5 segundos. Sus puntos son configurables.
- Los avisos al recoger combustible muestran **puntos y energía por separado**. La energía indicada corresponde a lo recuperado efectivamente.
- Se suman 10 puntos por segundo de juego activo, además de los puntos por combustible. El puntaje nunca baja de cero.
- Recoger combustible elimina el freno del aceite. El aceite cancela el impulso.
- El resultado se guarda tanto si se completa el recorrido como si termina por choque o falta de energía. No hay descuentos ni cupones.
- El retorno automático al inicio ocurre 20 segundos después de guardar el resultado. Si falla el guardado, se ofrece reintentarlo.

## Configuración del evento

En el inicio, tocar **10 veces seguidas el fondo**, fuera del botón Jugar, sin dejar pausas de 5 segundos entre toques. El acceso está oculto, pero no protegido por contraseña.

El menú utiliza el fondo VYLIUN, los colores Charcoal / Soft White / Tech Lime y las tipografías Space Grotesk e Inter incluidas localmente. Los controles quedan debajo del logo. Deslizar el panel para acceder a todas las opciones.

| Opción | Inicial | Rango | Efecto principal |
| --- | --- | --- | --- |
| Duración | 90 s | 5–120 s | Más tiempo permite más puntos, pero también más consumo y exposición a obstáculos. |
| Vidas | 2 | 1–9 | Más vidas permiten más choques antes de perder. |
| Puntos por combustible | 50 | 0–1000 | Cambia la recompensa, sin modificar energía ni duración del impulso. |
| Intervalo de combustible | 3 s | 1–30 s | Menos segundos significa más apariciones, energía e impulsos. |
| Intervalo de aceite | 5 s | 1–30 s | Menos segundos significa más obstáculos y penalizaciones. |
| Velocidad | 100 % | 50–200 % | Escala el movimiento de carretera, tráfico y objetos; no modifica duración ni consumo por segundo. |
| Penalización del aceite | 100 puntos | 0–9999 | Aumenta o reduce los puntos descontados; 0 elimina ese descuento. |
| Duración del freno | 3 s | 1–15 s | Cambia cuánto dura la reducción de velocidad al pisar aceite. |

Los intervalos programan **intentos de aparición**, no garantizan un objeto si la zona está ocupada. El primer combustible puede aparecer desde el segundo 3 y dejan de aparecer objetos cuando se aproxima la meta. Un intervalo corto de combustible permite encadenar impulsos.

Pulsar **Guardar** para aplicar los valores a la próxima partida. Las instrucciones se actualizan con los valores guardados. Los cambios no recalculan los resultados existentes del ranking.

Los ajustes se conservan en `localStorage` bajo la clave `motopower-settings-v1`. Borrar los datos del sitio o cambiar de perfil/origen del navegador puede restablecerlos.

## Participantes y ranking offline

El nombre admite hasta 20 caracteres, usando letras mayúsculas, Ñ y espacios. Se normalizan mayúsculas y espacios para detectar duplicados.

Si el nombre ya existe, se ofrecen dos opciones:

- **Soy yo, continuar:** autoriza que el resultado de la nueva partida reemplace el anterior, incluso si el puntaje es menor. El reemplazo ocurre al terminar y guardar la partida.
- **Cambiar nombre:** permite registrar a otra persona con un nombre diferente.

Se conserva **un resultado por nombre**. El ranking ordena por puntaje descendente y, en un empate, por el orden en que se guardó el resultado vigente. Siempre muestra el top 10; si el jugador está fuera, muestra su puesto en una fila aparte. Dentro del top 10 se resalta su fila.

### Ubicación de los datos

El archivo `data/ranking.json` se crea al guardar el primer resultado, relativo a la ubicación de `server.cjs`:

| Ejecución | Ranking |
| --- | --- |
| Desde la raíz | `data/ranking.json` |
| Desde la distribución | `road-figther-marcimex-app/data/ranking.json` |

**Son archivos independientes.** No alternar entre ambas opciones durante un evento si se desea conservar un único ranking.

El guardado escribe un archivo temporal y reemplaza el principal; desde el segundo guardado conserva la versión anterior en `ranking.json.bak`. Para respaldar o restaurar, detener el servidor y copiar la carpeta `data/`. No borrar los datos al actualizar la compilación.

Si el archivo de ranking es inválido, el servidor no lo reemplaza por uno vacío: se debe restaurar una copia válida. Mantener el servidor abierto durante la partida, ya que el registro de la partida en curso se conserva en memoria hasta guardar el resultado.

## Distribución para el equipo del evento

La carpeta `road-figther-marcimex-app/` contiene la versión preparada. Su nombre histórico se conserva para mantener las rutas existentes.

Antes de trasladarla a un equipo offline, incluir:

- `dist/`, generado con los últimos cambios.
- `server.cjs`, `package.json` y `package-lock.json`.
- Las dependencias de producción en `node_modules/`.
- Los lanzadores correspondientes.

Preparar las dependencias en esa carpeta mientras haya conexión:

```bash
cd road-figther-marcimex-app
npm ci --omit=dev
```

El computador del evento necesita tener Node.js y Chrome instalados previamente. Para actualizar el paquete, compilar desde la raíz, sustituir **solo el `dist/` de la distribución** por el nuevo y actualizar `server.cjs` si cambió. Conservar su carpeta `data/`.

### Lanzadores

- **Windows:** doble clic en `run-app.bat`. Inicia el servidor si el puerto 5550 está libre y abre Chrome en modo quiosco. No instala dependencias al arrancar.
- **macOS:** doble clic en `run-app.command`. Inicia el servidor en segundo plano si no responde la comprobación local y abre la página en el navegador predeterminado. Este lanzador no activa el modo quiosco; para ello usar el comando de Chrome indicado anteriormente. Su salida se guarda en `server.log`.
- **Manual, desde la distribución:** `npm start`. Ejecuta la versión ya compilada y permite detenerla con Control + C.

## Vigencia y variables de entorno

La campaña está habilitada del **14 de octubre de 2026, 00:00:00**, al **14 de enero de 2027, 23:59:59**, en UTC−5 (Ecuador continental).

El bloqueo existe en dos lugares: `EVENT_START` / `EVENT_END` en `src/game/config.ts` y `START` / `END` en `server.cjs`. Para otra campaña, actualizar ambos, recompilar y sincronizar la distribución. La validación depende del reloj del equipo.

| Variable | Predeterminado | Uso |
| --- | --- | --- |
| `PORT` | `5550` | Puerto del servidor local. |
| `DATA_DIR` | `data/` junto a `server.cjs` | Carpeta de almacenamiento; una ruta absoluta permite fijar una ubicación única. |
| `DISABLE_DATE_LOCK` | Sin definir | El valor `1` omite solamente el bloqueo del servidor para pruebas. |

**Desactivar el bloqueo del servidor no desactiva el de la interfaz.** Para probar fuera de vigencia también hay que ajustar las fechas de la interfaz y recompilar.

Ejemplo de ubicación fija de datos en macOS/Linux:

```bash
DATA_DIR="/ruta/absoluta/datos-motopower" npm run server
```

PowerShell:

```powershell
$env:DATA_DIR = "C:\MotoPower\datos"
npm run server
```

`.env.example` es una referencia: el servidor no carga archivos `.env` automáticamente. Configurar las variables en la terminal o en el lanzador.

## Pruebas

```bash
npm test
npm run build
```

- `tests/ranking.cjs`: registro, 50 participantes, top 10, puesto individual, nombres normalizados, consentimiento de reemplazo, puntaje menor, guardado sin duplicados, validación y persistencia tras reiniciar. Utiliza un directorio temporal y el puerto **5567**; no modifica el ranking del evento. Necesita estar dentro de la vigencia o ejecutarse con el bloqueo del servidor desactivado para esa prueba.
- `tests/game.cjs`: simulación del motor con Canvas e imágenes simulados, nivel único, vidas, seis enemigos, cuatro carriles, energía, aceite, recompensa configurable, intervalos, velocidad y validación de ajustes. No sustituye una revisión visual o táctil.
- `npm run build`: comprueba TypeScript y genera la versión de producción.

### Comprobación manual antes del evento

1. Abrir el inicio y comprobar fondo, botón Jugar y proporción vertical.
2. Registrar un nombre usando el teclado del juego, incluyendo Ñ, espacio y borrar.
3. Probar un nombre existente y sus dos alternativas.
4. Completar una partida y comprobar por separado los avisos de energía y puntos.
5. Verificar que el aceite resta puntos y frena; probar la derrota por vidas y por energía.
6. Comprobar top 10, resaltado del jugador y fila individual cuando queda fuera del top.
7. Guardar nuevos parámetros y comprobar sus efectos en la siguiente partida.
8. Reiniciar la aplicación y verificar la persistencia del ranking y los ajustes.
9. Desconectar internet y repetir el flujo completo en modo quiosco, con sonido y pantalla táctil.

## Estructura

```text
src/
  screens/          Inicio, juego, resultado, configuración y bloqueo
  components/       Registro, teclado, instrucciones y composición visual
  game/             Motor, ajustes, imágenes, audio, indicadores y cliente de ranking
public/assets/      Imágenes, sonidos y fuentes locales
server.cjs          Servidor local, registro y persistencia del ranking
tests/             Pruebas de ranking y motor
dist/              Compilación de la aplicación
road-figther-marcimex-app/
  dist/             Compilación preparada para el evento
  server.cjs        Servidor de la distribución
  run-app.bat       Lanzador Windows con quiosco
  run-app.command   Lanzador macOS
```

La guía visual de administración está en `Vyliun_Mini_Brand_Guide_v2.md`. Las fuentes incluidas tienen sus licencias OFL en `public/assets/fonts/`.

## Problemas frecuentes

| Problema | Qué revisar |
| --- | --- |
| No se ven los últimos cambios | Ejecutar `npm run build`, actualizar el `dist/` utilizado y recargar sin caché: Command + Shift + R en Mac o Control + Shift + R en Windows. |
| Registro o ranking no funcionan | Utilizar Express, no abrir `index.html` directamente ni usar Vite Preview como servidor del evento. Comprobar `http://127.0.0.1:5550/api/health`. |
| Puerto ocupado (`EADDRINUSE`) | Detener el servidor anterior desde su terminal. Si se cambia `PORT`, ajustar URL, lanzadores y proxy de desarrollo. |
| Juego bloqueado | Comprobar vigencia, reloj del equipo y ambos bloqueos de fecha. |
| No se puede guardar | Revisar permisos y espacio de disco en `data/`; conservar la pantalla del resultado y reintentar. |
| Ranking distinto al esperado | Revisar qué copia de `server.cjs` está ejecutándose y su carpeta de datos. |
| Configuración restablecida | Revisar perfil y dirección del navegador. `localhost` y `127.0.0.1` tienen almacenamientos de ajustes distintos. |
| Chrome no entra en quiosco | Cerrar las ventanas existentes de Chrome y volver a iniciarlo con `--kiosk`. |
| Pruebas del ranking no arrancan | Comprobar que 5567 esté libre, que el entorno permita conexiones locales y que el bloqueo del servidor no esté activo. |

## Notas para Git

El archivo `.gitignore` excluye las dependencias, ambas carpetas `dist/`, cachés, archivos de entorno locales, registros y datos del evento. Se conservan los archivos de bloqueo, el ejemplo de entorno y los lanzadores.

No versionar `node_modules/`, los rankings reales (`data/` y su equivalente en la distribución), archivos de respaldo de participantes ni `server.log`. Las dependencias se reconstruyen con el archivo de bloqueo; los datos del evento se respaldan aparte. Las compilaciones se generan con `npm run build` y se copian al paquete offline antes de entregarlo.

El proyecto está marcado como privado en `package.json`. No incluye una licencia general de redistribución; las marcas y los recursos gráficos corresponden a sus respectivos titulares.
