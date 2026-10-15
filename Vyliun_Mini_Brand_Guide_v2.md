# VYLIUN - Mini Brand Guide
**v2.0 · Agosto 2026 · Uso interno**
*Reemplaza la v1.0 (basada en el mockup inicial). Esta versión documenta el sistema final aprobado.*

---

## 1. Logo

### 1.1 Construcción
El sistema consta de tres piezas, siempre usadas juntas en la composición horizontal oficial:

1. **Monograma VY** - geometría propia extraída y validada vectorialmente (no es una fuente). Simetría vertical exacta, mitades espejadas, tallo inferior partido.
2. **Wordmark "VYLIUN"** - V, L, I, U, N tipografiadas en **Michroma** (geométrica, licencia OFL), con la Y reemplazada por el monograma.
3. **Lockup horizontal** - composición oficial única. No se apila, no se separan las piezas, no se reordenan.

### 1.2 Ajustes finos aprobados (ya incorporados al master file)
Por si se necesita reconstruir el logo desde cero, estos son los parámetros finales sobre la geometría base:

| Elemento | Ajuste |
|---|---|
| Monograma | Grosor +6% (autoridad visual), altura +8% (4% sobre cap-height, 4% bajo baseline), posición final +1.5% más abajo |
| Letra V | Ancho -7% |
| Letra U | Ancho interno +5%, profundidad de curva -18% (acumulado), ancho total -4% |
| Letra N | Ancho -5%, banda diagonal adelgazada ~8% |
| Espaciado V→monograma | -4% adicional sobre el kerning natural |
| Espaciado monograma→L | -16% acumulado sobre el kerning natural |
| Espaciado L→I / I→U / U→N | -5% / -4% / -4% sobre el kerning natural |

### 1.3 Archivos maestros
- `vyliun-official-variants/` - 8 variantes de color (dark, light, monocromo x2, monograma solo x3, transparente)
- `vyliun-production/` - PNG 1x/2x/3x, PDF vectorial, favicon.ico, app icon 1024px

### 1.4 Reglas de uso
✅ Usar siempre el archivo vectorial maestro · respetar el lockup completo tal como está aprobado
🚫 No separar el monograma del wordmark en el lockup oficial (el monograma solo únicamente se usa como favicon/avatar/ícono de app) · no reescalar el monograma independiente del wordmark · no recolorear fuera de la paleta

---

## 2. Tipografía corporativa

| Nivel | Fuente | Uso |
|---|---|---|
| **Logotipo** | Michroma | Exclusivo del wordmark "VYLIUN". Nunca se usa para otro texto. |
| **Encabezados (H1-H3)** | Space Grotesk (Bold/Medium) | Títulos de documentos, presentaciones, secciones web |
| **Cuerpo de texto** | Inter (Regular/Medium) | Párrafos, UI, tablas, texto largo - en documentos, web y producto |

**Por qué esta combinación:** Space Grotesk comparte el carácter geométrico/técnico de Michroma sin ser tan decorativa, así que funciona para títulos sin competir con el logo. Inter es el estándar de facto para legibilidad en pantalla y en documentos largos - es lo que ya usan la mayoría de sistemas de diseño de software (Figma, Github, etc.), así que también reduce fricción si en el futuro se construye producto digital.

Ambas son de licencia libre (Google Fonts / OFL), sin costo de licenciamiento.

**Escala tipográfica sugerida (documentos/web):**

| Uso | Fuente | Tamaño aprox. |
|---|---|---|
| H1 | Space Grotesk Bold | 28-32pt |
| H2 | Space Grotesk Bold | 20-22pt |
| H3 | Space Grotesk Medium | 16-18pt |
| Cuerpo | Inter Regular | 10-11pt |
| Texto pequeño/caption | Inter Regular | 8-9pt |

---

## 3. Color

| Nombre | Hex | Uso |
|---|---|---|
| Charcoal | `#1B1E1F` | Fondo oscuro, texto sobre fondo claro |
| Soft White | `#F5F5F5` | Fondo claro, texto sobre fondo oscuro |
| Tech Lime | `#A6F00D` | Acento - monograma, CTAs, subrayados, highlights. Nunca como color de texto extenso ni fondo grande |

### 3.1 Reglas de contraste (medidas, no estimadas)

Calculado con la fórmula de contraste WCAG 2.1 sobre los tres colores exactos de marca:

| Combinación | Ratio | Texto normal (AA ≥4.5) | Texto grande / UI (AA ≥3.0) |
|---|---|---|---|
| Charcoal bg + Soft White texto | **15.4:1** | ✅ Pasa | ✅ Pasa |
| Soft White bg + Charcoal texto | **15.4:1** | ✅ Pasa | ✅ Pasa |
| Charcoal bg + Tech Lime texto/ícono | **12.1:1** | ✅ Pasa | ✅ Pasa |
| Tech Lime bg + Charcoal texto | **12.1:1** | ✅ Pasa | ✅ Pasa |
| Soft White bg + Tech Lime texto | **1.3:1** | ❌ Falla | ❌ Falla |
| Tech Lime bg + Soft White texto | **1.3:1** | ❌ Falla | ❌ Falla |

**Conclusiones prácticas:**
- **Lima sobre charcoal funciona muy bien** incluso para texto normal (12.1:1) - no solo para el monograma, también se puede usar en highlights de texto, tags, badges sobre fondo oscuro.
- **Lima sobre blanco casi no se lee (1.3:1)** - nunca usar texto lima sobre fondo blanco/claro. Si se necesita un acento lima en fondo claro, debe ser una forma sólida (línea, ícono, bloque), nunca texto.
- **Lima como fondo de botón + texto charcoal encima = excelente** (12.1:1) - es la combinación recomendada para CTAs/botones de acento.
- **Nunca combinar lima de fondo con texto blanco** (1.3:1, ilegible).

### 3.2 Combinaciones prohibidas
🚫 Texto lima sobre blanco/claro · Texto blanco sobre lima · Lima como fondo de bloques grandes de texto · Cualquier color fuera de esta paleta de 3

---

## 4. Espacio de seguridad y tamaños

*(Sin cambios respecto a v1.0 - siguen vigentes)*

- **Safe area:** margen mínimo alrededor del logo = altura de la "Y"/monograma en los 4 lados.
- **Clear space:** espacio mínimo respecto a otros elementos ≥ safe area.
- **Tamaños mínimos:** favicon funcional desde 32px (16px pierde definición, es normal); ícono de app desde 64px recomendado, 1024px como fuente maestra.

---

## 5. Manifiesto de archivos (dónde vive cada cosa)

| Necesitas... | Archivo/carpeta |
|---|---|
| Logo completo, cualquier color/fondo | `vyliun-official-variants/01-08` |
| PNG en alta resolución | `vyliun-production/png/` |
| PDF vectorial para imprenta | `vyliun-production/pdf/` |
| Favicon del sitio | `vyliun-production/favicon/favicon.ico` |
| Ícono de app | `vyliun-production/app-icon/` |
| Firma de email | `vyliun-email-signature.html` |
| Avatar de redes/perfiles | `vyliun-avatar-512.png` |
| Plantilla de propuesta comercial | `Vyliun-Propuesta-Comercial-Ejemplo.docx` |

---

## 6. Pendientes conocidos (no cubiertos por esta guía)

- Sistema visual de componentes para web/software (botones, estados, tokens de espaciado)
- Header/nav del sitio web
- Banners para perfiles sociales (LinkedIn, X, Facebook - solo existe el avatar cuadrado/circular)
- Plantilla de presentaciones (.pptx)
- Plantilla `.dotx` reutilizable (hoy la propuesta es un `.docx` de ejemplo, no una plantilla con un clic)
- Tono de voz / lineamientos verbales de marca

---

*Vyliun · Guayaquil, Ecuador · Documento vivo - actualizar cada vez que se apruebe un cambio de sistema.*
