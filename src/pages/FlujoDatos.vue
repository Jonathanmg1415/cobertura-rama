<template>
  <q-page class="flujo-page">
    <header class="hero">
      <div class="hero-inner">
        <router-link to="/" class="back-link">&larr; Volver al índice</router-link>
        <h1 class="hero-title">Prueba de Flujo de Datos</h1>
        <p class="hero-subtitle">Caja Blanca Dinámica &middot; Estados D / R / U</p>
      </div>
    </header>

    <main class="content">
      <div class="grid-top">
        <!-- Mockup de editor de código -->
        <section class="panel code-panel">
          <div class="panel-header">
            <span class="dot dot-red"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-green"></span>
            <span class="panel-title">descuento.js</span>
          </div>

          <div class="du-legend">
            <span class="legend-item"
              ><span class="legend-swatch legend-d">D</span> Definida: se asigna un valor a la
              variable</span
            >
            <span class="legend-item"
              ><span class="legend-swatch legend-r">R</span> Referenciada: se lee el valor de la
              variable</span
            >
            <span class="legend-item"
              ><span class="legend-swatch legend-u">U</span> Indefinida: aún no se ha definido, o ya
              salió de su ámbito</span
            >
          </div>

          <pre class="code-body"><code
            ><div
              v-for="line in codeLines"
              :key="line.num"
              class="code-line"
              :class="{
                'code-line--active': highlightedLines.includes(line.num),
                'code-line--selected': selectedLines.includes(line.num),
              }"
            ><span class="line-num">{{ line.num }}</span><span class="line-code" v-html="line.html"></span><span class="line-tags"><button
                v-for="tag in tagsForLine(line.num)"
                :key="tag.id"
                type="button"
                class="tag-btn"
                :class="['tag-' + tag.type.toLowerCase(), { 'tag-dead': tag.dead, 'tag-selected': selectedTagId === tag.id }]"
                @click="selectTag(tag.id)"
              >{{ tag.type }}: {{ tag.label }}</button></span></div
          ></code></pre>
        </section>

        <!-- Panel de interacción -->
        <section class="panel interact-panel">
          <h2 class="panel-title-lg">Casos de prueba</h2>

          <div class="quick-cases">
            <button
              v-for="c in quickCases"
              :key="c.label"
              class="quick-case-btn"
              :style="{ borderColor: c.color }"
              @click="ejecutarCasoRapido(c)"
            >
              {{ c.label }}
            </button>
          </div>

          <div class="divider">o ingresa valores manualmente</div>

          <div class="form">
            <q-input
              v-model.number="precio"
              type="number"
              label="Precio base"
              dense
              outlined
              class="form-field"
            />
            <q-select
              v-model="categoria"
              :options="['Premium', 'Regular']"
              label="Categoría del cliente"
              dense
              outlined
              class="form-field"
            />
            <q-btn class="run-btn" label="Ejecutar prueba" unelevated @click="ejecutarPrueba" />
          </div>

          <div v-if="resultado" class="resultado resultado-ok">
            {{ resultado }}
          </div>
        </section>
      </div>

      <!-- Modelo de estados y anomalías -->
      <section class="panel model-panel">
        <h2 class="panel-title-lg">Modelo de estados y anomalías</h2>
        <div class="model-grid">
          <table class="mini-table">
            <thead>
              <tr>
                <th colspan="2">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="mini-badge tag-u">U</span></td>
                <td>Indefinida</td>
              </tr>
              <tr>
                <td><span class="mini-badge tag-d">D</span></td>
                <td>Definida</td>
              </tr>
              <tr>
                <td><span class="mini-badge tag-r">R</span></td>
                <td>Referenciada</td>
              </tr>
            </tbody>
          </table>

          <table class="mini-table">
            <thead>
              <tr>
                <th colspan="2">Secuencia anómala</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(desc, pair) in ANOMALY_INFO" :key="pair">
                <td>
                  <code class="anomaly-code">{{ pair }}</code>
                </td>
                <td>{{ desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Secuencia de estados por variable -->
      <section class="panel sequence-panel">
        <h2 class="panel-title-lg">Secuencia de estados por variable</h2>
        <p class="flow-hint">Haz clic en una letra para ver esa ocurrencia en el código.</p>

        <div class="var-sequence" v-for="v in variableSequences" :key="v.variable">
          <span class="var-name">{{ v.variable }}</span>
          <span class="var-arrow">&rarr;</span>
          <span class="var-seq">
            <button
              v-for="(s, idx) in v.sequence"
              :key="idx"
              type="button"
              class="seq-letter"
              :class="[
                'tag-' + s.toLowerCase(),
                {
                  'seq-anomaly': v.anomalies.some((a) => a.index === idx || a.index === idx - 1),
                  'tag-selected': selectedTagId === v.occurrences[idx].tagId,
                },
              ]"
              @click="selectTag(v.occurrences[idx].tagId)"
            >
              {{ s.toLowerCase() }}
            </button>
          </span>
          <span v-if="v.anomalies.length" class="var-anomaly-note">
            Anomalía "{{ v.anomalies[0].pair }}": {{ ANOMALY_INFO[v.anomalies[0].pair] }}
          </span>
          <span v-else class="var-anomaly-note var-anomaly-note--ok">Secuencia correcta</span>
        </div>
      </section>

      <!-- Explorador de estados -->
      <section class="panel explain-du-panel">
        <h2 class="panel-title-lg">Explorador de estados (D / R / U)</h2>

        <div v-if="selectedTag" class="du-detail">
          <span class="du-detail-badge" :class="'tag-' + selectedTag.type.toLowerCase()">
            {{ selectedTag.type }}
          </span>
          <div>
            <p class="du-detail-title">
              <code>{{ selectedTag.label }}</code> &middot; línea {{ selectedTag.line }}
            </p>
            <p class="du-detail-state">
              Estado:
              <strong
                >{{ typeLabel(selectedTag.type) }} ({{ selectedTag.type.toLowerCase() }})</strong
              >
            </p>
            <p class="du-detail-text">{{ selectedTag.explanation }}</p>
          </div>
        </div>
        <p v-else class="du-detail-empty">
          Haz clic en cualquier etiqueta <strong>D</strong>, <strong>R</strong> o
          <strong>U</strong> del código, en una letra de las secuencias de arriba, o en una fila de
          la matriz de abajo, para ver qué ocurre exactamente en ese punto y con qué otras líneas
          está conectado.
        </p>
      </section>

      <!-- Matriz de pares definición-uso -->
      <section class="panel coverage-panel">
        <div class="coverage-header">
          <h2 class="panel-title-lg">Cobertura de pares definición-referencia (DR-paths)</h2>
          <q-btn
            flat
            dense
            label="Reiniciar cobertura"
            class="reset-btn"
            @click="reiniciarCobertura"
          />
        </div>

        <div class="progress-track">
          <div class="progress-fill" :style="{ width: coveragePercent + '%' }"></div>
        </div>
        <p class="progress-label">
          {{ coveredCount }} / {{ pairs.length }} pares cubiertos ({{ coveragePercent }}%)
        </p>

        <table class="coverage-table">
          <thead>
            <tr>
              <th>Par</th>
              <th>Variable</th>
              <th>Camino definición &rarr; referencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(p, i) in pairs"
              :key="p.id"
              class="clickable-row"
              :class="{ covered: p.covered, 'branch-current': selectedTagId === p.tagId }"
              @click="selectTag(p.tagId)"
            >
              <td>{{ i + 1 }}</td>
              <td>
                <code>{{ p.variable }}</code>
              </td>
              <td>{{ p.camino }}</td>
              <td>
                <span class="badge" :class="p.covered ? 'badge-ok' : 'badge-pending'">
                  {{ p.covered ? 'Cubierto' : 'Pendiente' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Explicación -->
      <section class="explain-grid">
        <div
          v-for="(card, i) in explainCards"
          :key="card.title"
          class="explain-card"
          :style="{ animationDelay: i * 0.15 + 's' }"
        >
          <div class="avatar" :style="{ background: card.color }">
            <q-icon :name="card.icon" size="24px" color="white" />
          </div>
          <h3 class="explain-title">{{ card.title }}</h3>
          <p class="explain-text">{{ card.text }}</p>
        </div>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const rawCodeLines = [
  'function calcularDescuento(precio, categoria) {',
  '  let descuento = 0;',
  '  let bono;',
  "  console.log('Bono inicial:', bono);",
  "  if (categoria === 'premium') {",
  '    descuento = precio * 0.2;',
  '    bono = precio * 0.05;',
  '  } else {',
  '    descuento = precio * 0.1;',
  '  }',
  '  let total = precio - descuento;',
  '  return total;',
  '}',
]

function highlightSyntax(code) {
  return code
    .replace(/'([^']*)'/g, '<span class="tok-string">\'$1\'</span>')
    .replace(/\b(function|if|else|let|return)\b/g, '<span class="tok-keyword">$1</span>')
}

const codeLines = rawCodeLines.map((code, idx) => ({
  num: idx + 1,
  html: highlightSyntax(code),
}))

// Modelo de análisis de flujo de datos por estados: cada variable pasa por una
// secuencia de estados a lo largo del programa:
//   D = Definida     (se le asigna un valor)
//   R = Referenciada (se lee su valor)
//   U = Indefinida   (no existe todavía, o ya salió de su ámbito)
// Cada etiqueta es una ocurrencia de un estado en una línea concreta, con la
// explicación que se muestra al hacer clic.
const duTags = [
  {
    id: 'p1',
    line: 1,
    type: 'D',
    label: 'precio',
    highlightLines: [1, 6, 7, 9, 11],
    explanation:
      '"precio" queda Definida (D) en el momento en que se invoca la función, como parámetro. Su valor viaja hasta las referencias de las líneas 6, 7, 9 y 11.',
  },
  {
    id: 'p2',
    line: 1,
    type: 'D',
    label: 'categoria',
    highlightLines: [1, 5],
    explanation: '"categoria" queda Definida (D) como parámetro. Se referencia en la línea 5.',
  },
  {
    id: 'p3',
    line: 5,
    type: 'R',
    label: 'categoria',
    highlightLines: [1, 5],
    explanation:
      '"categoria" es Referenciada (R): se lee su valor para decidir qué rama ejecutar, sin calcular ninguna otra variable.',
  },
  {
    id: 'p4',
    line: 6,
    type: 'R',
    label: 'precio',
    highlightLines: [1, 6],
    explanation:
      '"precio" es Referenciada (R): su valor se multiplica por 0.2 para calcular "descuento" en la ruta premium.',
  },
  {
    id: 'p7',
    line: 7,
    type: 'R',
    label: 'precio',
    highlightLines: [1, 7],
    explanation:
      '"precio" es Referenciada (R): su valor se multiplica por 0.05 para calcular el bono VIP en la ruta premium.',
  },
  {
    id: 'p5',
    line: 9,
    type: 'R',
    label: 'precio',
    highlightLines: [1, 9],
    explanation:
      '"precio" es Referenciada (R): su valor se multiplica por 0.1 para calcular "descuento" en la ruta regular.',
  },
  {
    id: 'p6',
    line: 11,
    type: 'R',
    label: 'precio',
    highlightLines: [1, 11],
    explanation: '"precio" es Referenciada (R): se le resta "descuento" para calcular "total".',
  },
  {
    id: 't0',
    line: 2,
    type: 'D',
    label: 'descuento',
    dead: true,
    highlightLines: [2],
    explanation:
      '"descuento" queda Definida (D) con el valor 0, pero nunca es Referenciada antes de volver a Definirse en la línea 6 o la línea 9. La secuencia D→D sin una R en medio es la anomalía "dd": la primera definición se pierde sin haberse usado.',
  },
  {
    id: 'b1',
    line: 3,
    type: 'U',
    label: 'bono',
    highlightLines: [3],
    explanation:
      '"bono" se declara con `let bono;` pero sin un valor inicial: queda Indefinida (U) desde este mismo punto.',
  },
  {
    id: 'b2',
    line: 4,
    type: 'R',
    label: 'bono',
    highlightLines: [3, 4],
    explanation:
      '"bono" es Referenciada (R) aquí, en el "console.log" — pero todavía está Indefinida: nunca se le asignó un valor antes de esta línea. La secuencia U→R es la anomalía "ur": un uso antes de definir, un bug real (en este punto "bono" vale undefined sin importar la categoría).',
  },
  {
    id: 't1',
    line: 6,
    type: 'D',
    label: 'descuento',
    highlightLines: [6, 11],
    explanation:
      '"descuento" queda Definida (D) en la ruta premium. Su valor viaja hasta la línea 11, donde se Referencia para calcular "total". Para cubrir este camino hace falta una prueba con categoría "Premium".',
  },
  {
    id: 'b3',
    line: 7,
    type: 'D',
    label: 'bono',
    highlightLines: [4, 7],
    explanation:
      '"bono" queda Definida (D) aquí, solo en la ruta premium — pero ya fue Referenciada antes (línea 4) mientras estaba indefinida, y no vuelve a referenciarse después. Sobre esta variable ocurren dos anomalías: "ur" (líneas 3-4) y, a continuación, "du".',
  },
  {
    id: 't2',
    line: 9,
    type: 'D',
    label: 'descuento',
    highlightLines: [9, 11],
    explanation:
      '"descuento" queda Definida (D) en la ruta regular. Su valor viaja hasta la línea 11, donde se Referencia para calcular "total". Para cubrir este camino hace falta una prueba con categoría "Regular".',
  },
  {
    id: 't3',
    line: 11,
    type: 'R',
    label: 'descuento',
    highlightLines: [6, 9, 11],
    explanation:
      '"descuento" es Referenciada (R) al calcular "total". Este valor pudo llegar desde la línea 6 (premium) o la línea 9 (regular), según el camino que tomó la última prueba ejecutada.',
  },
  {
    id: 't4',
    line: 11,
    type: 'D',
    label: 'total',
    highlightLines: [11, 12],
    explanation:
      '"total" queda Definida (D) a partir de "precio" y "descuento". Su valor viaja hasta la línea 12, donde se Referencia. Cualquier prueba ejecutada cubre este camino.',
  },
  {
    id: 't5',
    line: 12,
    type: 'R',
    label: 'total',
    highlightLines: [11, 12],
    explanation:
      '"total" es Referenciada (R) en el "return": aquí es donde el valor calculado en la línea 11 se entrega como resultado de la función.',
  },
  {
    id: 'end-precio',
    line: 13,
    type: 'U',
    label: 'precio',
    highlightLines: [1, 13],
    explanation:
      'Al terminar la función, "precio" sale de su ámbito y queda Indefinida (U) de nuevo.',
  },
  {
    id: 'end-categoria',
    line: 13,
    type: 'U',
    label: 'categoria',
    highlightLines: [1, 13],
    explanation:
      'Al terminar la función, "categoria" sale de su ámbito y queda Indefinida (U) de nuevo.',
  },
  {
    id: 'end-descuento',
    line: 13,
    type: 'U',
    label: 'descuento',
    highlightLines: [11, 13],
    explanation:
      'Al terminar la función, "descuento" sale de su ámbito y queda Indefinida (U) de nuevo.',
  },
  {
    id: 'end-total',
    line: 13,
    type: 'U',
    label: 'total',
    highlightLines: [12, 13],
    explanation:
      'Al terminar la función, "total" sale de su ámbito y queda Indefinida (U) de nuevo.',
  },
  {
    id: 'b4',
    line: 13,
    type: 'U',
    label: 'bono',
    highlightLines: [7, 13],
    explanation:
      'Al terminar la función, "bono" sale de su ámbito y vuelve a quedar Indefinida (U). Como nunca fue Referenciada después de definirse en la línea 7, la secuencia D→U también es la anomalía "du": una definición que se pierde sin usarse.',
  },
]

function tagsForLine(num) {
  return duTags.filter((t) => t.line === num)
}

const TYPE_LABELS = { D: 'Definida', R: 'Referenciada', U: 'Indefinida' }
function typeLabel(type) {
  return TYPE_LABELS[type] || type
}

const ANOMALY_INFO = {
  dd: 'definición duplicada: la primera asignación se pierde sin haberse referenciado.',
  du: 'definición sin uso: el valor calculado nunca se referencia antes de perderse.',
  ur: 'uso antes de definir: se referencia la variable estando indefinida (bug real).',
}

const variableSequences = computed(() => {
  const byVar = {}
  for (const tag of duTags) {
    if (!byVar[tag.label]) byVar[tag.label] = []
    byVar[tag.label].push({ type: tag.type, line: tag.line, tagId: tag.id })
  }
  return Object.entries(byVar).map(([variable, occurrences]) => {
    const sorted = [...occurrences].sort((a, b) => a.line - b.line)
    const sequence = sorted.map((o) => o.type)
    const anomalies = []
    for (let i = 0; i < sequence.length - 1; i++) {
      const pair = (sequence[i] + sequence[i + 1]).toLowerCase()
      if (ANOMALY_INFO[pair]) anomalies.push({ index: i, pair })
    }
    return { variable, occurrences: sorted, sequence, anomalies }
  })
})

const selectedTagId = ref(null)
const selectedTag = computed(() => duTags.find((t) => t.id === selectedTagId.value) || null)
const selectedLines = computed(() => (selectedTag.value ? selectedTag.value.highlightLines : []))

function selectTag(tagId) {
  selectedTagId.value = selectedTagId.value === tagId ? null : tagId
}

const precio = ref(200)
const categoria = ref('Premium')
const resultado = ref('')
const highlightedLines = ref([])

const pairs = reactive([
  {
    id: 'p1',
    tagId: 't1',
    variable: 'descuento',
    camino: 'Definida en línea 6 (ruta premium) → referenciada en línea 11',
    covered: false,
  },
  {
    id: 'p2',
    tagId: 't2',
    variable: 'descuento',
    camino: 'Definida en línea 9 (ruta regular) → referenciada en línea 11',
    covered: false,
  },
  {
    id: 'p3',
    tagId: 't4',
    variable: 'total',
    camino: 'Definida en línea 11 → referenciada en línea 12 (return)',
    covered: false,
  },
])

const coveredCount = computed(() => pairs.filter((p) => p.covered).length)
const coveragePercent = computed(() => Math.round((coveredCount.value / pairs.length) * 100))

function calcularDescuento(precioVal, categoriaVal) {
  const esPremium = categoriaVal === 'Premium'
  const defLine = esPremium ? 6 : 9
  const descuento = esPremium ? precioVal * 0.2 : precioVal * 0.1
  const total = precioVal - descuento

  highlightedLines.value = [defLine, 11, 12]
  if (esPremium) {
    pairs[0].covered = true
  } else {
    pairs[1].covered = true
  }
  pairs[2].covered = true

  return total
}

function ejecutar(precioVal, categoriaVal) {
  const total = calcularDescuento(precioVal, categoriaVal)
  resultado.value = `Total a pagar: $${total.toFixed(2)} (descuento aplicado: ${categoriaVal})`
}

function ejecutarPrueba() {
  ejecutar(precio.value, categoria.value)
}

const quickCases = [
  { label: 'Cliente Premium', color: '#667eea', precio: 200, categoria: 'Premium' },
  { label: 'Cliente Regular', color: '#764ba2', precio: 150, categoria: 'Regular' },
]

function ejecutarCasoRapido(c) {
  precio.value = c.precio
  categoria.value = c.categoria
  ejecutar(c.precio, c.categoria)
}

function reiniciarCobertura() {
  pairs.forEach((p) => {
    p.covered = false
  })
  resultado.value = ''
  highlightedLines.value = []
}

const explainCards = [
  {
    title: 'Objetivo',
    icon: 'flag',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    text: 'Verificar que cada definición (D) de una variable llegue efectivamente a una referencia (R) posterior, y detectar anomalías como variables indefinidas (U) que se leen sin haberse definido, o definiciones que se pierden sin usarse.',
  },
  {
    title: 'Ventajas',
    icon: 'thumb_up',
    color: 'linear-gradient(135deg, #38a169 0%, #276749 100%)',
    text: 'Detecta variables definidas pero nunca usadas, usos de datos no inicializados y errores de flujo que la cobertura de sentencias o de rama no siempre revela.',
  },
  {
    title: 'Aplicaciones',
    icon: 'build',
    color: 'linear-gradient(135deg, #dd6b20 0%, #9c4221 100%)',
    text: 'Muy útil en sistemas con lógica de estado compleja: cálculos financieros encadenados, máquinas de estado y pipelines de transformación de datos.',
  },
]
</script>

<style scoped>
.flujo-page {
  min-height: 100vh;
  background: #f4f5fb;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 48px 24px;
  text-align: center;
}

.hero-inner {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
}

.back-link {
  position: absolute;
  left: 0;
  top: 0;
  color: white;
  text-decoration: none;
  opacity: 0.85;
  font-size: 0.9rem;
}

.back-link:hover {
  opacity: 1;
  text-decoration: underline;
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 8px 0 4px;
}

.hero-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

.content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.grid-top {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 860px) {
  .grid-top {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* Code editor mockup */
.code-panel {
  background: #1e1e2e;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: #171722;
}

.dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}

.dot-red {
  background: #ff5f56;
}
.dot-yellow {
  background: #ffbd2e;
}
.dot-green {
  background: #27c93f;
}

.panel-title {
  margin-left: 10px;
  color: #9a9ab0;
  font-size: 0.82rem;
  font-family: 'Courier New', monospace;
}

.du-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px 16px;
  background: #23233a;
  border-bottom: 1px solid #33334d;
  font-size: 0.76rem;
  color: #c5c5da;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-swatch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  font-weight: 700;
  font-size: 0.68rem;
  color: white;
}

.legend-d {
  background: #dd8b3a;
}
.legend-u {
  background: #4a9fd8;
}

.legend-r {
  background: #9061c2;
}

.tag-d {
  background: #dd8b3a;
}

.tag-r {
  background: #9061c2;
}

.tag-u {
  background: #4a9fd8;
}

.code-body {
  margin: 0;
  padding: 16px 0;
  overflow-x: auto;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 0.88rem;
  line-height: 1.7;
}

.code-line {
  display: flex;
  align-items: center;
  padding: 0 16px;
  white-space: pre;
  transition: background 0.25s ease;
}

.code-line--active {
  background: rgba(102, 126, 234, 0.28);
  box-shadow: inset 3px 0 0 #764ba2;
}

.code-line--selected:not(.code-line--active) {
  background: rgba(74, 159, 216, 0.16);
  box-shadow: inset 3px 0 0 #4a9fd8;
}

.line-num {
  color: #565672;
  width: 28px;
  flex-shrink: 0;
  user-select: none;
}

.line-code {
  color: #d4d4e0;
}

.line-code :deep(.tok-keyword) {
  color: #c792ea;
  font-weight: 600;
}

.line-code :deep(.tok-string) {
  color: #a3e5a3;
}

.line-tags {
  display: inline-flex;
  gap: 6px;
  margin-left: 14px;
}

.tag-btn {
  font-family: 'Courier New', Consolas, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  border: none;
  border-radius: 999px;
  padding: 2px 9px;
  cursor: pointer;
  color: white;
  opacity: 0.85;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.tag-btn:hover {
  opacity: 1;
  transform: translateY(-1px);
}

.tag-btn.tag-d {
  background: #dd8b3a;
}

.tag-btn.tag-u {
  background: #4a9fd8;
}

.tag-btn.tag-r {
  background: #9061c2;
}

.tag-btn.tag-dead {
  background: #6b6b80;
}

.tag-btn.tag-selected {
  opacity: 1;
  outline: 2px solid white;
}

.seq-letter.tag-selected {
  opacity: 1;
  outline: 2px solid #2d2d3a;
  outline-offset: 1px;
}

/* DU explorer */
/* Modelo de estados y anomalías */
.model-panel {
  padding: 24px;
  margin-bottom: 24px;
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.mini-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
}

.mini-table th {
  text-align: left;
  color: #888;
  font-weight: 600;
  font-size: 0.76rem;
  text-transform: uppercase;
  padding: 6px 8px;
  border-bottom: 2px solid #eee;
}

.mini-table td {
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  vertical-align: middle;
}

.mini-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  color: white;
  font-weight: 700;
  font-size: 0.78rem;
}

.anomaly-code {
  font-weight: 700;
  color: #c0392b;
}

/* Secuencias por variable */
.sequence-panel {
  padding: 24px;
  margin-bottom: 24px;
}

.var-sequence {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.var-sequence:last-child {
  border-bottom: none;
}

.var-name {
  font-family: 'Courier New', Consolas, monospace;
  font-weight: 700;
  color: #2d2d3a;
  min-width: 90px;
}

.var-arrow {
  color: #aaa;
}

.var-seq {
  display: inline-flex;
  gap: 4px;
}

.seq-letter {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: none;
  color: white;
  font-family: 'Courier New', Consolas, monospace;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  opacity: 0.85;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.seq-letter:hover {
  opacity: 1;
  transform: translateY(-1px);
}

.seq-letter.seq-anomaly {
  box-shadow: 0 0 0 3px #ffd400;
}

.var-anomaly-note {
  font-size: 0.8rem;
  color: #c0392b;
  font-weight: 600;
}

.var-anomaly-note--ok {
  color: #2f9e5b;
}

.du-detail-state {
  font-size: 0.86rem;
  color: #444;
  margin: 0 0 8px;
}

.explain-du-panel {
  padding: 24px;
  margin-bottom: 24px;
}

.du-detail {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.du-detail-badge {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
}

.du-detail-badge.tag-d {
  background: #dd8b3a;
}

.du-detail-badge.tag-u {
  background: #4a9fd8;
}

.du-detail-badge.tag-r {
  background: #9061c2;
}

.du-detail-title {
  font-weight: 700;
  color: #2d2d3a;
  margin: 0 0 6px;
}

.du-detail-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

.du-detail-empty {
  font-size: 0.88rem;
  line-height: 1.6;
  color: #888;
  margin: 0;
}

/* Interaction panel */
.interact-panel {
  padding: 24px;
}

.panel-title-lg {
  font-size: 1.15rem;
  font-weight: 700;
  color: #2d2d3a;
  margin: 0 0 16px;
}

.quick-cases {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 18px;
}

.quick-case-btn {
  background: white;
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 10px 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease;
}

.quick-case-btn:hover {
  transform: translateY(-2px);
  background: #f7f7fb;
}

.divider {
  text-align: center;
  font-size: 0.8rem;
  color: #999;
  margin: 14px 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.run-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  border-radius: 8px;
}

.resultado {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}

.resultado-ok {
  background: #e6f9ee;
  color: #276749;
}

/* Coverage panel */
.coverage-panel {
  padding: 24px;
  margin-bottom: 32px;
}

.coverage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.reset-btn {
  color: #764ba2;
  font-weight: 600;
}

.progress-track {
  width: 100%;
  height: 12px;
  background: #eceef7;
  border-radius: 999px;
  overflow: hidden;
  margin-top: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #38a169 100%);
  transition: width 0.4s ease;
}

.progress-label {
  font-size: 0.85rem;
  color: #666;
  margin: 8px 0 20px;
}

.coverage-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.coverage-table th {
  text-align: left;
  color: #888;
  font-weight: 600;
  font-size: 0.78rem;
  text-transform: uppercase;
  padding: 8px 10px;
  border-bottom: 2px solid #eee;
}

.coverage-table td {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

.coverage-table tr.covered {
  background: #f0faf3;
}

.clickable-row {
  cursor: pointer;
}

.coverage-table tr.branch-current {
  box-shadow: inset 4px 0 0 #4a9fd8;
  font-weight: 600;
}

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
}

.badge-ok {
  background: #d4f4dd;
  color: #276749;
}

.badge-pending {
  background: #eee;
  color: #888;
}

/* Explanation cards */
.explain-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.explain-card {
  background: white;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  opacity: 0;
  animation: fadeIn 0.6s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.explain-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #2d2d3a;
  margin: 0 0 8px;
}

.explain-text {
  font-size: 0.88rem;
  line-height: 1.6;
  color: #666;
  margin: 0;
}
</style>
