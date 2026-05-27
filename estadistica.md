# estadistica.md — Análisis Estadístico Quini 6 + Prompt para Claude Code

## Instrucción para Claude Code

Agregar una sección de análisis estadístico avanzado al dashboard de Quini 6 existente
(`quini-dashboard/`). El análisis debe implementarse como un nuevo tab **"Análisis"** en la
página principal, usando los datos de Supabase. Todos los hallazgos de este documento están
basados en **469 sorteos reales** (Segunda Vuelta SALE + Revancha REV, mayo 2023 → mayo 2026).

---

## Dataset base

| Parámetro | Valor |
|-----------|-------|
| Total sorteos | 469 |
| SALE (Segunda Vuelta) | 235 |
| REV (Revancha) | 234 |
| Rango temporal | 10 may 2023 → 13 may 2026 |
| Rango numérico | 0 – 46 (47 bolas) |
| Número 46 | **NUNCA SALIÓ** en 469 sorteos |

---

## Bloque 1 — Semáforo de números (vista principal de decisión)

### Concepto
Panel de 47 casillas (0–46) con estado de alerta basado en el ratio **Ausencia ÷ Ciclo medio**:

- 🔴 **VENCIDO** (ratio ≥ 1.5): el número lleva más del 150% de su ciclo histórico sin aparecer
- 🟡 **ATRASADO** (ratio 1.0–1.49): supera su media de espera
- 🟢 **NORMAL** (ratio < 1.0): dentro de ciclo esperado
- ⚫ **CALIENTE** (ausencia = 0): salió en el último sorteo

### Fórmula
```
Ciclo medio(n) = promedio de gaps entre apariciones históricas de n
Ratio(n) = Ausencia actual(n) / Ciclo medio(n)
```

### Hallazgos reales al 13 may 2026

| Nº | Ratio | Ausencia | Ciclo medio | Estado |
|----|-------|----------|-------------|--------|
| 31 | 3.20  | 21 sort. | 6.6         | 🔴 VENCIDO |
| 39 | 2.89  | 25 sort. | 8.6         | 🔴 VENCIDO |
| 13 | 1.68  | 12 sort. | 7.1         | 🔴 VENCIDO |
| 42 | 1.62  | 11 sort. | 6.8         | 🔴 VENCIDO |
| 10 | 1.60  | 13 sort. | 8.1         | 🔴 VENCIDO |
| 14 | 1.47  | 10 sort. | 6.8         | 🟡 ATRASADO |
| 09 | 1.26  | 11 sort. | 8.7         | 🟡 ATRASADO |
| 11 | 1.21  | 10 sort. | 8.2         | 🟡 ATRASADO |
| 23 | 1.21  | 12 sort. | 9.9         | 🟡 ATRASADO |
| 02 | 1.16  | 11 sort. | 9.5         | 🟡 ATRASADO |
| 16 | 1.15  |  9 sort. | 7.8         | 🟡 ATRASADO |
| 19 | 1.06  |  7 sort. | 6.6         | 🟡 ATRASADO |
| 45 | 1.03  |  8 sort. | 7.8         | 🟡 ATRASADO |
| 29 | 1.02  |  7 sort. | 6.9         | 🟡 ATRASADO |

**Nota especial:** El **46** nunca apareció en 469 sorteos. Ratio técnicamente infinito.
Mostrarlo con un indicador especial "Sin registro histórico".

### Implementación UI
```tsx
// components/Semaforo.tsx
// Grid 5x10 con los 47 números
// Color de fondo según estado:
//   VENCIDO:  bg-red-100, border-red-400, texto rojo oscuro
//   ATRASADO: bg-yellow-100, border-yellow-400
//   NORMAL:   bg-white, border-gray-200
//   CALIENTE: bg-green-100, border-green-400 (ausencia === 0)
// En cada celda mostrar: el número grande + ratio pequeño abajo
// Tooltip al hover: ausencia, ciclo, frecuencia total, última fecha
```

---

## Bloque 2 — Ciclos de reaparición por número

### Concepto
Cada número tiene un ritmo estadístico de aparición. Útil para saber el **gap máximo histórico**
(cuánto tiempo aguantó sin salir) y el **ciclo promedio** (cada cuántos sorteos sale normalmente).

### Tabla de referencia rápida (ciclos históricos reales)

| Nº | Ciclo medio | Max gap | Frecuencia |
|----|------------|---------|-----------|
| 36 | **5.8** sort. | 24 | 82 (más frecuente) |
| 33 | 6.6 | 35 | 69 |
| 19 | 6.6 | 36 | 70 |
| 20 | 6.6 | 32 | 71 |
| 31 | 6.6 | 39 | 67 |
| 08 | 7.0 | 29 | 67 |
| 14 | 6.8 | 33 | 68 |
| 18 | **9.9** | 28 | 48 (lento pero regular) |
| 23 | **9.9** | 59 | 47 |
| 09 | 8.7 | **57** | 53 |
| 46 | — | — | **0 (anomalía)** |

### Insight clave
El número **23** tiene el gap máximo histórico de **59 sorteos** sin aparecer y
actualmente lleva 12 ausente. El **09** tuvo un gap de 57 sorteos — su ausencia
actual de 11 está dentro de ciclo pero próxima al umbral histórico.

### Implementación UI
```tsx
// components/CiclosChart.tsx
// Tabla interactiva ordenable: Nº | Ciclo | Max Gap | Freq | Ausencia actual | Ratio
// Barra de progreso visual: [██████░░░░] ausencia/max_gap
// Highlight en rojo si ausencia > max_gap histórico (situación inédita)
// Filtros: "Solo vencidos", "Solo calientes", "Por decena"
```

---

## Bloque 3 — Distribución por decenas (colores)

### Hallazgos reales

| Decena | Color | Bolas totales | % del total | Prom/sorteo |
|--------|-------|--------------|-------------|-------------|
| 0–9    | 🟢 Verde  | 561 | 19.9% | **1.20** |
| 10–19  | 🟡 Ámbar  | 616 | 21.9% | **1.31** |
| 20–29  | 🔴 Rojo   | 604 | 21.5% | **1.29** |
| 30–39  | 🔵 Azul   | 649 | **23.1%** | **1.38** |
| 40–46  | ⚫ Negro  | 384 | **13.6%** | **0.82** |

### Interpretaciones
- La **decena 30–39** (azul) es la más dominante: sale 1.38 veces por sorteo.
- La **decena 40–46** (negro) es la menos frecuente: solo 7 números posibles vs 10 de las demás.
- Una tarjeta sin ningún número entre 30–39 va contra la tendencia estadística fuerte.
- Una tarjeta con 3+ números entre 40–46 es estadísticamente inusual.

### Patrón de combinación más común por sorteo
El patrón de decenas más frecuente es **1-1-1-2-1** (una de cada decena excepto
30–39 que aporta dos). Seguido de **1-2-1-1-1** y **2-1-1-1-1**.

### Implementación UI
```tsx
// components/DecenasDonut.tsx — recharts PieChart
// 5 sectores con colores exactos del sistema de coloreado
// Mostrar: % real de aparición + promedio por sorteo
// Segundo gráfico: BarChart de distribución en últimos 30 sorteos vs histórico
//   para detectar si alguna decena está sobrerepresentada o subrepresentada recientemente
```

---

## Bloque 4 — Análisis de paridad (pares vs impares)

### Hallazgos reales

| Pares en el sorteo | Sorteos | % |
|--------------------|---------|---|
| 0 pares (6 impares) | 5 | 1.1% |
| 1 par | 33 | 7.0% |
| 2 pares | 128 | 27.3% |
| **3 pares** | **149** | **31.8% ← más común** |
| 4 pares | 101 | 21.5% |
| 5 pares | 47 | 10.0% |
| 6 pares (todos pares) | 6 | 1.3% |

### Regla de decisión
**El 60% de los sorteos tienen exactamente 2, 3 o 4 números pares.**
Una tarjeta con 0 o 6 pares tiene solo 2.4% de probabilidad histórica.
Recomendar siempre 2–4 números pares en la tarjeta generada.

### Implementación UI
```tsx
// components/ParidadChart.tsx — recharts BarChart
// Eje X: 0-6 pares, Eje Y: % de sorteos
// Highlight de la barra "3 pares" como óptima
// Indicador dinámico: "Tu tarjeta actual tiene X pares → Y% de probabilidad histórica"
```

---

## Bloque 5 — Análisis de consecutivos

### Hallazgos reales

| Pares consecutivos | Sorteos | % |
|-------------------|---------|---|
| **0 consecutivos** | **222** | **47.3% ← más común** |
| 1 par consecutivo | 188 | 40.1% |
| 2 pares consecutivos | 55 | 11.7% |
| 3+ pares consecutivos | 4 | 0.9% |

### Regla de decisión
El **87.4%** de los sorteos tiene **0 o 1 par consecutivo**.
Una tarjeta con 3 o más números seguidos (ej: 14-15-16) tiene solo 0.9% de ocurrencia histórica.
El generador de tarjetas debe penalizar fuertemente los consecutivos.

### Implementación UI
```tsx
// Validador en tiempo real en PredictionCard:
// Al generar tarjeta, mostrar debajo: "Consecutivos: X par(es) → percentil histórico Y%"
// Si X >= 2: warning amarillo
// Si X >= 3: warning rojo "Combinación atípica"
```

---

## Bloque 6 — Suma de las 6 bolas (rango óptimo)

### Hallazgos reales

| Rango de suma | Sorteos | % |
|--------------|---------|---|
| 0 – 90 | 34 | 7.2% |
| 91 – 110 | 59 | 12.6% |
| **111 – 130** | **89** | **19.0%** |
| **131 – 150** | **118** | **25.2%** |
| **151 – 180** | **119** | **25.4%** |
| 181+ | 50 | 10.7% |

- Media: **138.7** | Mediana: **139** | Desv. std: **31.9**
- Rango absoluto histórico: **62 – 230**

### Zona óptima
El **69.6%** de los sorteos cae entre suma **111 y 180**.
El generador de tarjetas debe validar que la suma esté en ese rango.
Fuera de 91–181: probabilidad histórica acumulada < 20%.

### Implementación UI
```tsx
// components/SumaRangoMeter.tsx
// Medidor tipo gauge o barra horizontal
// Zonas marcadas: rojo (<91), amarillo (91-110), verde (111-180), amarillo (181-200), rojo (200+)
// En PredictionCard: mostrar suma de tarjeta + posición en la escala en tiempo real
// Rechazar automáticamente tarjetas generadas con suma fuera del rango 100–185
```

---

## Bloque 7 — Pares más frecuentes (afinidad entre números)

### Top 20 pares históricos (más de 13 coocurrencias)

| Par | Veces | | Par | Veces |
|-----|-------|-|-----|-------|
| 34–38 | **18** | | 07–36 | 14 |
| 08–15 | 16 | | 19–22 | 14 |
| 19–36 | 16 | | 33–36 | 14 |
| 13–35 | 15 | | 36–42 | 14 |
| 27–33 | 15 | | 36–41 | 14 |
| 25–36 | 15 | | 13–14 | 14 |
| 19–32 | 14 | | 33–44 | 14 |
| 07–41 | 14 | | 20–27 | 14 |
| 35–41 | 14 | | 03–22 | 14 |

### Top 10 tripletas históricas

| Tripleta | Veces |
|----------|-------|
| 07–35–41 | 6 |
| 07–19–36 | 6 |
| 20–34–38 | 5 |
| 09–32–42 | 5 |
| 03–19–21 | 5 |
| 30–33–44 | 5 |
| 35–37–43 | 5 |
| 32–35–39 | 5 |
| 25–36–40 | 5 |
| 26–41–44 | 5 |

### Insight: el 36 es el eje de la red
El **36** es el número más frecuente (82 veces, 17.5%) y aparece en 5 de los top 20 pares.
Sus compañeros más frecuentes: **19** (16×), **25** (15×), **07** (14×), **33** (14×), **42** (14×), **41** (14×).

### Implementación UI
```tsx
// components/AffinityMatrix.tsx
// Heatmap 47x47 de coocurrencias (simplificado: top 20 números × top 20)
// Color de celda: gradiente blanco → azul intenso según frecuencia del par
// Al hacer click en un número: destacar todos sus pares frecuentes
// Sección de tripletas: tabla con filtro por número
```

---

## Bloque 8 — Sesgo SALE vs REV

### Números con mayor sesgo hacia SALE

| Nº | SALE% | REV% | Δ |
|----|-------|------|---|
| 06 | 17.0% | 7.7% | **+9.3pp** |
| 26 | 15.3% | 7.7% | **+7.6pp** |
| 04 | 14.5% | 10.3% | +4.2pp |
| 07 | 15.3% | 11.1% | +4.2pp |
| 23 | 11.9% | 8.1% | +3.8pp |
| 28 | 14.9% | 11.1% | +3.8pp |

### Números con mayor sesgo hacia REV

| Nº | REV% | SALE% | Δ |
|----|------|-------|---|
| 34 | 17.9% | 11.1% | **+6.9pp** |
| 43 | 15.0% | 8.9% | **+6.0pp** |
| 08 | 16.7% | 11.9% | +4.8pp |
| 15 | 15.4% | 11.9% | +3.5pp |
| 24 | 15.0% | 11.5% | +3.5pp |
| 11 | 13.7% | 10.2% | +3.5pp |

### Interpretación
Si bien la misma máquina sortea ambos juegos, los sesgos pueden reflejar diferencias
en el orden de las bolas al inicio de cada juego. La tarjeta SALE debería favorecer
06, 26, 07; la tarjeta REV debería incluir 34, 43, 08 con mayor peso.

### Implementación UI
```tsx
// components/SaleRevChart.tsx
// BarChart horizontal comparativo de todos los números
// Barra izquierda = SALE%, barra derecha = REV%
// Filtro "Solo sesgos > 3pp" para ver los relevantes
// En PredictionCard: checkbox "Modo SALE" o "Modo REV" que ajusta los pesos del generador
```

---

## Bloque 9 — Análisis de repetición SALE↔REV del mismo día

### Hallazgos

| Nros en común mismo día | Sorteos | % |
|-------------------------|---------|---|
| 0 compartidos | 100 | 42.7% |
| **1 compartido** | **101** | **43.2%** |
| 2 compartidos | 29 | 12.4% |
| 3 compartidos | 3 | 1.3% |
| 6 compartidos (todos) | 1 | 0.4% |

**Caso extremo:** el 5 de noviembre de 2023 los 6 números del SALE y REV fueron idénticos:
12-27-31-33-38-44.

### Regla de decisión
Hay **55.7%** de probabilidad de que al menos 1 número se repita entre el SALE y el REV del mismo día.
Si ya jugás el SALE y querés el REV, conviene incluir 1 número en común como "ancla".

### Implementación UI
```tsx
// components/RepeticionDiariaPanel.tsx
// Mostrar últimos 20 pares SALE-REV del mismo día
// En cada fila resaltar qué números se repitieron
// Distribución en donut: 0, 1, 2, 3+ compartidos
// Insight textual: "En el 55.7% de los días se repite al menos 1 número"
```

---

## Bloque 10 — Tendencia de los últimos 30 sorteos

### Números dominantes (últimos 30 sorteos, frecuencia sobre la media)

| Nº | Veces en últ. 30 | Media histórica | Δ |
|----|------------------|-----------------|---|
| 36 | **10** | 5.2/30 | +4.8 🔥 |
| 12 | 8 | 4.0/30 | +4.0 🔥 |
| 40 | 7 | 4.5/30 | +2.5 ↑ |
| 03 | 6 | 3.7/30 | +2.3 ↑ |
| 07 | 6 | 4.0/30 | +2.0 ↑ |
| 08 | 6 | 4.3/30 | +1.7 ↑ |
| 41 | 6 | 4.4/30 | +1.6 ↑ |

### Interpretación
El **36** está en una racha extraordinaria: 10 apariciones en 30 sorteos vs media histórica
de 5.2 — aparece el **doble** de lo esperado. Puede indicar racha (incluirlo) o
reversión a la media próxima (evitarlo).

### Implementación UI
```tsx
// components/TendenciaChart.tsx
// LineChart con dos series: frecuencia últimos 30 vs media histórica por número
// Slider para cambiar la ventana: 10, 20, 30, 50, 100 sorteos
// Botón "Ver rachas": resaltar números con Δ > 50% sobre su media
// Botón "Ver reversiones": resaltar números calientes que estadísticamente deberían enfriarse
```

---

## Bloque 11 — Generador de tarjeta inteligente (versión mejorada)

### Algoritmo con todos los filtros estadísticos

```typescript
// lib/analysis.ts — función generarTarjetaAvanzada

interface ConfigTarjeta {
  modo: 'SALE' | 'REV' | 'AMBOS';
  incluirVencidos: boolean;     // priorizar números con ratio > 1
  respetoDecenas: boolean;      // al menos 1 de cada decena 0-39
  filtroParidad: [number, number]; // [min_pares, max_pares], default [2,4]
  filtroSuma: [number, number];    // [min_suma, max_suma], default [111,180]
  penalizarConsecutivos: boolean;  // reducir probabilidad de pares consecutivos
}

function generarTarjetaAvanzada(
  stats: EstadisticaNumero[],
  config: ConfigTarjeta = { modo:'AMBOS', incluirVencidos:true, respetoDecenas:true,
                             filtroParidad:[2,4], filtroSuma:[111,180], penalizarConsecutivos:true }
): { numeros: number[]; score: Score } {
  // Score compuesto por número:
  //   peso_frecuencia   × 0.20  (base histórica)
  //   peso_ausencia     × 0.30  (overdue factor)
  //   peso_sesgo_tipo   × 0.15  (SALE vs REV según modo)
  //   peso_tendencia30  × 0.20  (momentum reciente)
  //   peso_decena       × 0.15  (balance de colores)
  //   penalización_cons × 0.00–0.50 (si forma consecutivo penalizar 50%)

  // Proceso:
  // 1. Calcular score ponderado para los 47 números
  // 2. Garantizar mínimo 1 número por decena 0-9, 10-19, 20-29, 30-39
  // 3. Completar los restantes por ruleta sesgada
  // 4. Validar suma en filtroSuma → si no cumple, reemplazar número de mayor impacto
  // 5. Validar paridad en filtroParidad → ajustar si necesario
  // 6. Retornar con Score explicativo

  return {
    numeros: [...], // 6 números ordenados
    score: {
      suma: number,
      pares: number,
      consecutivos: number,
      ratioVencidos: number,    // cuántos números vencidos incluye
      decenasUsadas: number[],  // qué decenas están representadas
      confianza: number,        // 0-100 score global de la tarjeta
    }
  };
}
```

### Implementación UI del generador avanzado
```tsx
// components/GeneradorAvanzado.tsx
// Panel de configuración colapsable:
//   - Toggle "Modo": SALE / REV / Ambos
//   - Toggle "Priorizar vencidos": ON/OFF
//   - Slider "Rango de suma": 80 ←→ 200
//   - Slider "Pares mínimos/máximos": 0 ←→ 6
//   - Toggle "Penalizar consecutivos": ON/OFF
// Botones: [1 Tarjeta] [5 Tarjetas] [10 Tarjetas]
// Score card por cada tarjeta generada:
//   Suma: 143 ✓ | Pares: 3 ✓ | Consec: 0 ✓ | Vencidos: 2 (31,39) | Confianza: 78/100
// Botón "Guardar favorita" → localStorage
// Botón "Comparar con último sorteo" → cuántos hubiera acertado
```

---

## Estructura de archivos nuevos a crear

```
components/
├── analisis/
│   ├── Semaforo.tsx              # Bloque 1: semáforo 0-46
│   ├── CiclosTable.tsx           # Bloque 2: tabla de ciclos ordenable
│   ├── DecenasDonut.tsx          # Bloque 3: donut por decenas
│   ├── ParidadChart.tsx          # Bloque 4: distribución de paridad
│   ├── ConsecutivosBar.tsx       # Bloque 5: gráfico de consecutivos
│   ├── SumaRangoMeter.tsx        # Bloque 6: medidor de suma óptima
│   ├── AffinityMatrix.tsx        # Bloque 7: heatmap de pares
│   ├── SaleRevChart.tsx          # Bloque 8: comparativa SALE vs REV
│   ├── RepeticionDiariaPanel.tsx # Bloque 9: repetición mismo día
│   ├── TendenciaChart.tsx        # Bloque 10: tendencia ventana móvil
│   └── GeneradorAvanzado.tsx     # Bloque 11: generador con todos los filtros
└── AnalisisTab.tsx               # Contenedor del nuevo tab con todos los bloques
```

---

## Queries nuevas en `lib/db.ts`

```typescript
// Obtener todos los sorteos para análisis completo (sin limit)
export async function getAllSorteos(): Promise<Sorteo[]> {
  const { data, error } = await supabase
    .from('sorteos')
    .select('*')
    .order('fecha', { ascending: false })
    .order('tipo', { ascending: true });
  if (error) throw error;
  return data as Sorteo[];
}

// Obtener sorteos agrupados por fecha (para análisis SALE↔REV)
export async function getSorteosPorFecha(): Promise<Record<string, Sorteo[]>> {
  const todos = await getAllSorteos();
  return todos.reduce((acc, s) => {
    if (!acc[s.fecha]) acc[s.fecha] = [];
    acc[s.fecha].push(s);
    return acc;
  }, {} as Record<string, Sorteo[]>);
}
```

---

## Integración en `app/page.tsx`

Agregar el tab "Análisis" al componente de tabs existente:

```tsx
// En el Server Component page.tsx
import { getAllSorteos } from '@/lib/db';
import { calcularEstadisticasCompletas } from '@/lib/analysis';
import { AnalisisTab } from '@/components/AnalisisTab';

// Dentro del render:
const todosLosSorteos = await getAllSorteos(); // para análisis completo
const statsCompletas = calcularEstadisticasCompletas(todosLosSorteos);

// En el JSX de tabs:
<Tab id="analisis" label="📊 Análisis">
  <AnalisisTab sorteos={todosLosSorteos} stats={statsCompletas} />
</Tab>
```

---

## Notas de implementación para Claude Code

1. **Todos los cálculos son client-side** (no requieren API adicional). Los datos de Supabase
   se cargan en el Server Component y se pasan como props.

2. **`calcularEstadisticasCompletas`** debe reemplazar/extender `calcularEstadisticas` existente
   para incluir: ciclo medio, max gap, ratio ausencia/ciclo, sesgo SALE/REV, tendencia 30 sorteos,
   pares frecuentes, y análisis de paridad/suma/consecutivos.

3. **El Semáforo** (Bloque 1) debe ser lo primero visible en el tab de Análisis,
   ya que es la vista de decisión más directa para el usuario.

4. **El Generador Avanzado** (Bloque 11) reemplaza al `PredictionCard` básico existente.
   El tab "Predicción" puede unificarse con "Análisis" o mantenerse separado.

5. **Tooltips**: cada número en el Semáforo debe tener tooltip con: ausencia actual,
   ciclo medio, ratio, frecuencia total, y fecha de última aparición.

6. **Advertencia estadística** siempre visible en el tab de Análisis:
   _"El Quini 6 es un juego de azar. Estos análisis son descriptivos, no predictivos.
   El número 46 nunca ha salido en 469 sorteos — la máquina no tiene memoria."_

7. **Performance**: `getAllSorteos()` retorna 469 registros ≈ 50KB. Sin paginación en el
   tab de análisis. Cache con `unstable_cache` de Next.js con revalidación de 5 minutos.

8. **Color consistency**: todos los gráficos deben respetar el sistema de colores
   por decena: verde (#006100), ámbar (#9C6500), rojo (#9C0006), azul (#0070C0), negro (#1a1a1a).
