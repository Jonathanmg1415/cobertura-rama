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
              :class="{ 'code-line--active': line.num === highlightedLine }"
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

        <table class="coverage-table">
          <thead>
            <tr>
              <th>Rama</th>
              <th>Condición</th>
              <th>Resultado esperado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(b, i) in branches" :key="b.id" :class="{ covered: b.covered }">
              <td>{{ i + 1 }}</td>
              <td>
                <code>{{ b.condicion }}</code>
              </td>
              <td>{{ b.resultado }}</td>
              <td>
                <span class="badge" :class="b.covered ? 'badge-ok' : 'badge-pending'">
                  {{ b.covered ? 'Cubierta' : 'Pendiente' }}
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
const highlightedLine = ref(null)

const branches = reactive([
  { id: 'r1', condicion: 'monto <= 0', resultado: 'Error: monto inválido', covered: false },
  {
    id: 'r2',
    condicion: 'cuentaBloqueada === true',
    resultado: 'Error: cuenta bloqueada',
    covered: false,
  },
  { id: 'r3', condicion: 'monto > saldo', resultado: 'Error: saldo insuficiente', covered: false },
  {
    id: 'r4',
    condicion: 'ninguna condición anterior',
    resultado: 'Retiro exitoso',
    covered: false,
  },
])

const coveredCount = computed(() => branches.filter((b) => b.covered).length)
const coveragePercent = computed(() => Math.round((coveredCount.value / branches.length) * 100))

function retirar(montoVal, saldoVal, cuentaBloqueada) {
  if (montoVal <= 0) {
    branches[0].covered = true
    highlightedLine.value = 3
    return { mensaje: 'Error: monto inválido', tipo: 'error' }
  }
  if (cuentaBloqueada) {
    branches[1].covered = true
    highlightedLine.value = 6
    return { mensaje: 'Error: cuenta bloqueada', tipo: 'error' }
  }
  if (montoVal > saldoVal) {
    branches[2].covered = true
    highlightedLine.value = 9
    return { mensaje: 'Error: saldo insuficiente', tipo: 'error' }
  }
  branches[3].covered = true
  highlightedLine.value = 11
  return { mensaje: 'Retiro exitoso', tipo: 'ok' }
}

function ejecutar(montoVal, saldoVal, bloqueada) {
  const { mensaje, tipo } = retirar(montoVal, saldoVal, bloqueada)
  resultado.value = mensaje
  resultadoClass.value = tipo === 'ok' ? 'resultado-ok' : 'resultado-error'
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
  highlightedLine.value = null
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
