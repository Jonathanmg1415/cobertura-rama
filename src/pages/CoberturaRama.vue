<template>
  <q-page class="rama-page">
    <header class="hero">
      <div class="hero-inner">
        <router-link to="/" class="back-link">&larr; Volver al índice</router-link>
        <h1 class="hero-title">Cobertura de Rama / Decisión</h1>
        <p class="hero-subtitle">Caja Blanca Dinámica</p>
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
            <span class="panel-title">retirar.js</span>
          </div>
          <pre class="code-body"><code
            ><div
              v-for="line in codeLines"
              :key="line.num"
              class="code-line"
              :class="{
                'code-line--active': highlightedLines.includes(line.num),
                'code-line--current': line.num === currentLine,
                'code-line--hovered': line.num === hoveredLine,
              }"
            ><span class="line-num">{{ line.num }}</span><span class="line-code" v-html="line.html"></span></div
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
              v-model.number="monto"
              type="number"
              label="Monto a retirar"
              dense
              outlined
              class="form-field"
            />
            <q-input
              v-model.number="saldo"
              type="number"
              label="Saldo disponible"
              dense
              outlined
              class="form-field"
            />
            <q-select
              v-model="estadoCuenta"
              :options="['Activa', 'Bloqueada']"
              label="Estado de la cuenta"
              dense
              outlined
              class="form-field"
            />
            <q-btn class="run-btn" label="Ejecutar prueba" unelevated @click="ejecutarPrueba" />
          </div>

          <div v-if="resultado" class="resultado" :class="resultadoClass">
            {{ resultado }}
          </div>
        </section>
      </div>

      <!-- Flujo de ejecución de la última prueba -->
      <section v-if="executionPath.length" class="panel flow-panel">
        <h2 class="panel-title-lg">Flujo de la última prueba ejecutada</h2>
        <p class="flow-hint">
          Pasa el cursor sobre un paso para ver la línea de código correspondiente.
        </p>
        <div class="flow-track">
          <template v-for="(step, i) in executionPath" :key="step.branchId">
            <div
              class="flow-step"
              :class="[
                step.valor === 'Verdadero' ? 'flow-step--stop' : 'flow-step--pass',
                {
                  'flow-step--pending': i > currentStepIndex,
                  'flow-step--current': i === currentStepIndex,
                },
              ]"
              @mouseenter="hoveredLine = step.line"
              @mouseleave="hoveredLine = null"
            >
              <span class="flow-decision">{{ step.decision }}</span>
              <span class="flow-valor">{{ step.valor }}</span>
            </div>
            <span v-if="i < executionPath.length - 1" class="flow-arrow">&rarr;</span>
          </template>
          <span class="flow-arrow">&rarr;</span>
          <div
            class="flow-step flow-step--result"
            :class="[
              resultadoClass,
              { 'flow-step--pending': currentStepIndex < executionPath.length },
            ]"
            @mouseenter="hoveredLine = resultLine"
            @mouseleave="hoveredLine = null"
          >
            {{ resultado }}
          </div>
        </div>
      </section>

      <!-- Matriz de cobertura -->
      <section class="panel coverage-panel">
        <div class="coverage-header">
          <h2 class="panel-title-lg">Matriz de cobertura de ramas</h2>
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
          {{ coveredCount }} / {{ branches.length }} ramas cubiertas ({{ coveragePercent }}%)
        </p>
        <p class="progress-note">
          3 decisiones secuenciales &rarr; 6 ramas (verdadero/falso), pero solo 4 casos de prueba
          bastan para cubrirlas todas: cada caso atraviesa una decisión nueva y, de paso, la rama
          "falsa" de las anteriores.
        </p>

        <table class="coverage-table">
          <thead>
            <tr>
              <th>Rama</th>
              <th>Decisión</th>
              <th>Valor</th>
              <th>Significado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(b, i) in branches"
              :key="b.id"
              :class="{ covered: b.covered, 'branch-current': lastHitBranchIds.includes(b.id) }"
            >
              <td>{{ i + 1 }}</td>
              <td>
                <code>{{ b.decision }}</code>
              </td>
              <td>{{ b.valor }}</td>
              <td>{{ b.desc }}</td>
              <td>
                <span class="badge" :class="b.covered ? 'badge-ok' : 'badge-pending'">
                  {{ b.covered ? 'Cubierta' : 'Pendiente' }}
                </span>
                <span v-if="lastHitBranchIds.includes(b.id)" class="badge badge-current"
                  >Última prueba</span
                >
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
import { ref, reactive, computed, onUnmounted } from 'vue'

const rawCodeLines = [
  'function retirar(monto, saldo, cuentaBloqueada) {',
  '  if (monto <= 0) {',
  "    return 'Error: monto inválido';",
  '  }',
  '  if (cuentaBloqueada) {',
  "    return 'Error: cuenta bloqueada';",
  '  }',
  '  if (monto > saldo) {',
  "    return 'Error: saldo insuficiente';",
  '  }',
  "  return 'Retiro exitoso';",
  '}',
]

function highlightSyntax(code) {
  return code
    .replace(/'([^']*)'/g, '<span class="tok-string">\'$1\'</span>')
    .replace(/\b(function|if|return)\b/g, '<span class="tok-keyword">$1</span>')
}

const codeLines = rawCodeLines.map((code, idx) => ({
  num: idx + 1,
  html: highlightSyntax(code),
}))

const monto = ref(100)
const saldo = ref(500)
const estadoCuenta = ref('Activa')
const resultado = ref('')
const resultadoClass = ref('')
const pathLines = ref([])
const currentStepIndex = ref(-1)
const hoveredLine = ref(null)
const resultLine = ref(null)
const executionPath = ref([])
const lastHitBranchIds = ref([])

const highlightedLines = computed(() => pathLines.value.slice(0, currentStepIndex.value + 1))
const currentLine = computed(() =>
  currentStepIndex.value >= 0 ? pathLines.value[currentStepIndex.value] : null,
)

const STEP_DELAY_MS = 900
let playbackTimer = null

function playSequence(lines) {
  if (playbackTimer) clearInterval(playbackTimer)
  pathLines.value = lines
  currentStepIndex.value = 0
  let i = 0
  playbackTimer = setInterval(() => {
    i++
    if (i >= lines.length) {
      clearInterval(playbackTimer)
      playbackTimer = null
      return
    }
    currentStepIndex.value = i
  }, STEP_DELAY_MS)
}

onUnmounted(() => {
  if (playbackTimer) clearInterval(playbackTimer)
})

const branches = reactive([
  {
    id: 'd1t',
    decision: 'D1: monto ≤ 0',
    valor: 'Verdadero',
    desc: 'Monto inválido',
    covered: false,
  },
  {
    id: 'd1f',
    decision: 'D1: monto ≤ 0',
    valor: 'Falso',
    desc: 'Monto válido, continúa',
    covered: false,
  },
  {
    id: 'd2t',
    decision: 'D2: cuentaBloqueada',
    valor: 'Verdadero',
    desc: 'Cuenta bloqueada',
    covered: false,
  },
  {
    id: 'd2f',
    decision: 'D2: cuentaBloqueada',
    valor: 'Falso',
    desc: 'Cuenta activa, continúa',
    covered: false,
  },
  {
    id: 'd3t',
    decision: 'D3: monto > saldo',
    valor: 'Verdadero',
    desc: 'Saldo insuficiente',
    covered: false,
  },
  {
    id: 'd3f',
    decision: 'D3: monto > saldo',
    valor: 'Falso',
    desc: 'Retiro exitoso',
    covered: false,
  },
])

const coveredCount = computed(() => branches.filter((b) => b.covered).length)
const coveragePercent = computed(() => Math.round((coveredCount.value / branches.length) * 100))

function retirar(montoVal, saldoVal, cuentaBloqueada) {
  const path = []

  if (montoVal <= 0) {
    branches[0].covered = true
    path.push({ decision: 'D1: monto ≤ 0', valor: 'Verdadero', branchId: 'd1t', line: 2 })
    return { mensaje: 'Error: monto inválido', tipo: 'error', path, resultLine: 3 }
  }
  branches[1].covered = true
  path.push({ decision: 'D1: monto ≤ 0', valor: 'Falso', branchId: 'd1f', line: 2 })

  if (cuentaBloqueada) {
    branches[2].covered = true
    path.push({ decision: 'D2: cuentaBloqueada', valor: 'Verdadero', branchId: 'd2t', line: 5 })
    return { mensaje: 'Error: cuenta bloqueada', tipo: 'error', path, resultLine: 6 }
  }
  branches[3].covered = true
  path.push({ decision: 'D2: cuentaBloqueada', valor: 'Falso', branchId: 'd2f', line: 5 })

  if (montoVal > saldoVal) {
    branches[4].covered = true
    path.push({ decision: 'D3: monto > saldo', valor: 'Verdadero', branchId: 'd3t', line: 8 })
    return { mensaje: 'Error: saldo insuficiente', tipo: 'error', path, resultLine: 9 }
  }
  branches[5].covered = true
  path.push({ decision: 'D3: monto > saldo', valor: 'Falso', branchId: 'd3f', line: 8 })
  return { mensaje: 'Retiro exitoso', tipo: 'ok', path, resultLine: 11 }
}

function ejecutar(montoVal, saldoVal, bloqueada) {
  const { mensaje, tipo, path, resultLine: endLine } = retirar(montoVal, saldoVal, bloqueada)
  resultado.value = mensaje
  resultadoClass.value = tipo === 'ok' ? 'resultado-ok' : 'resultado-error'
  executionPath.value = path
  lastHitBranchIds.value = path.map((step) => step.branchId)
  resultLine.value = endLine
  playSequence([...path.map((step) => step.line), endLine])
}

function ejecutarPrueba() {
  ejecutar(monto.value, saldo.value, estadoCuenta.value === 'Bloqueada')
}

const quickCases = [
  { label: 'Monto inválido', color: '#e53e3e', monto: -50, saldo: 500, bloqueada: false },
  { label: 'Cuenta bloqueada', color: '#dd6b20', monto: 100, saldo: 500, bloqueada: true },
  { label: 'Saldo insuficiente', color: '#d69e2e', monto: 900, saldo: 500, bloqueada: false },
  { label: 'Retiro exitoso', color: '#38a169', monto: 100, saldo: 500, bloqueada: false },
]

function ejecutarCasoRapido(c) {
  monto.value = c.monto
  saldo.value = c.saldo
  estadoCuenta.value = c.bloqueada ? 'Bloqueada' : 'Activa'
  ejecutar(c.monto, c.saldo, c.bloqueada)
}

function reiniciarCobertura() {
  branches.forEach((b) => {
    b.covered = false
  })
  resultado.value = ''
  resultadoClass.value = ''
  if (playbackTimer) clearInterval(playbackTimer)
  playbackTimer = null
  pathLines.value = []
  currentStepIndex.value = -1
  hoveredLine.value = null
  resultLine.value = null
  executionPath.value = []
  lastHitBranchIds.value = []
}

const explainCards = [
  {
    title: 'Objetivo',
    icon: 'flag',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    text: 'Diseñar casos de prueba que garanticen que cada rama (verdadera/falsa) de cada decisión del código se ejecute al menos una vez.',
  },
  {
    title: 'Ventajas',
    icon: 'thumb_up',
    color: 'linear-gradient(135deg, #38a169 0%, #276749 100%)',
    text: 'Detecta código muerto y lógica no probada; ofrece mayor rigor que la cobertura de sentencias sin exigir el costo de la cobertura de caminos.',
  },
  {
    title: 'Aplicaciones',
    icon: 'build',
    color: 'linear-gradient(135deg, #dd6b20 0%, #9c4221 100%)',
    text: 'Ideal para validar módulos con reglas de negocio críticas: validaciones financieras, control de acceso y motores de decisión.',
  },
]
</script>

<style scoped>
.rama-page {
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
  padding: 0 16px;
  white-space: pre;
  transition: background 0.25s ease;
}

.code-line--active {
  background: rgba(102, 126, 234, 0.28);
  box-shadow: inset 3px 0 0 #764ba2;
}

.code-line--hovered {
  background: rgba(255, 255, 255, 0.16);
  box-shadow: inset 3px 0 0 #fff;
}

.code-line--current {
  animation: linePulse 0.9s ease infinite;
  box-shadow: inset 4px 0 0 #fff;
}

@keyframes linePulse {
  0%,
  100% {
    background-color: rgba(102, 126, 234, 0.28);
  }
  50% {
    background-color: rgba(102, 126, 234, 0.55);
  }
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

.resultado-error {
  background: #fdecec;
  color: #c53030;
}

/* Flow trace */
.flow-panel {
  padding: 24px;
  margin-bottom: 24px;
}

.flow-track {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.flow-hint {
  font-size: 0.8rem;
  color: #999;
  margin: -8px 0 14px;
}

.flow-step {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 2px solid transparent;
  font-size: 0.82rem;
  cursor: default;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  animation: fadeIn 0.4s ease forwards;
}

.flow-step:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.flow-step--pending {
  opacity: 0.25;
}

.flow-step--current {
  animation: stepPulse 0.9s ease infinite;
}

@keyframes stepPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}

.flow-step--pass {
  background: #eef5ff;
  border-color: #90b4f5;
  color: #2451a3;
}

.flow-step--stop {
  background: #fff1e8;
  border-color: #f0a26f;
  color: #a35a1a;
}

.flow-decision {
  font-weight: 700;
}

.flow-valor {
  font-size: 0.76rem;
  opacity: 0.85;
}

.flow-step--result {
  font-weight: 700;
  padding: 8px 16px;
}

.flow-arrow {
  color: #aaa;
  font-weight: 700;
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
  margin: 8px 0 4px;
}

.progress-note {
  font-size: 0.8rem;
  color: #888;
  line-height: 1.5;
  margin: 0 0 20px;
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

.badge-current {
  margin-left: 6px;
  background: #764ba2;
  color: white;
}

.coverage-table tr.branch-current {
  box-shadow: inset 4px 0 0 #764ba2;
  font-weight: 600;
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
