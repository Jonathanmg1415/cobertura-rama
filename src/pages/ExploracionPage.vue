<template>
  <q-page class="exp-page">
    <header class="hero">
      <div class="hero-inner">
        <router-link to="/" class="back-link">&larr; Volver al índice</router-link>
        <h1 class="hero-title">Pruebas Exploratorias</h1>
        <p class="hero-subtitle">Caja Negra &middot; Diseño y ejecución simultáneos</p>
      </div>
    </header>

    <main class="content">
      <div class="grid-top">
        <!-- Mockup de navegador con la app simulada -->
        <section class="panel browser-panel">
          <div class="browser-chrome">
            <span class="dot dot-red"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-green"></span>
            <div class="url-bar">tienda-demo.app/registro</div>
          </div>

          <div class="app-body">
            <h3 class="app-title">Crear cuenta</h3>

            <div class="app-form">
              <q-input v-model="usuario" label="Usuario" dense outlined class="form-field" />
              <q-input
                v-model="password"
                type="password"
                label="Contraseña"
                dense
                outlined
                class="form-field"
              />
              <q-input
                v-model="confirmPassword"
                type="password"
                label="Confirmar contraseña"
                dense
                outlined
                class="form-field"
              />
              <q-checkbox v-model="acceptTerms" label="Acepto los términos y condiciones" />
              <q-btn class="run-btn" label="Registrarse" unelevated @click="registrar" />
            </div>

            <div v-if="formResultado" class="resultado" :class="'resultado-' + formResultadoTipo">
              {{ formResultado }}
            </div>
          </div>
        </section>

        <!-- Panel de interacción: bitácora de hallazgos -->
        <section class="panel interact-panel">
          <h2 class="panel-title-lg">Bitácora de exploración</h2>
          <p class="charter">
            <strong>Charter:</strong> explora el formulario de registro y anota cualquier
            comportamiento inesperado que encuentres.
          </p>
          <p class="timer">Tiempo de sesión: {{ elapsedLabel }}</p>

          <div class="form">
            <q-input
              v-model="findingText"
              label="Describe lo que observaste"
              type="textarea"
              dense
              outlined
              class="form-field"
              rows="3"
            />
            <q-select
              v-model="findingSeverity"
              :options="['Bug', 'Duda', 'Mejora']"
              label="Tipo de hallazgo"
              dense
              outlined
              class="form-field"
            />
            <q-btn
              class="run-btn"
              label="Agregar hallazgo"
              unelevated
              :disable="!findingText.trim()"
              @click="agregarHallazgo"
            />
          </div>

          <ul v-if="findings.length" class="findings-list">
            <li v-for="(f, i) in findings" :key="i" class="finding-item">
              <span class="finding-tag" :class="'tag-' + f.severity">{{ f.severity }}</span>
              <span class="finding-text">{{ f.text }}</span>
              <span class="finding-time">{{ f.time }}</span>
            </li>
          </ul>
          <p v-else class="empty-hint">Aún no has registrado hallazgos.</p>
        </section>
      </div>

      <!-- Estado de la sesión: anomalías detectadas automáticamente -->
      <section class="panel coverage-panel">
        <div class="coverage-header">
          <h2 class="panel-title-lg">Anomalías detectadas en esta sesión</h2>
          <q-btn flat dense label="Reiniciar sesión" class="reset-btn" @click="reiniciarSesion" />
        </div>

        <div class="progress-track">
          <div class="progress-fill" :style="{ width: detectedPercent + '%' }"></div>
        </div>
        <p class="progress-label">
          {{ detectedCount }} / {{ knownIssues.length }} comportamientos inesperados descubiertos
          ({{ detectedPercent }}%)
        </p>

        <table class="coverage-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Comportamiento a descubrir</th>
              <th>Pista</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(issue, i) in knownIssues"
              :key="issue.id"
              :class="{ covered: issue.detected }"
            >
              <td>{{ i + 1 }}</td>
              <td>{{ issue.titulo }}</td>
              <td>{{ issue.hint }}</td>
              <td>
                <span class="badge" :class="issue.detected ? 'badge-ok' : 'badge-pending'">
                  {{ issue.detected ? 'Descubierto' : 'Pendiente' }}
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

const usuario = ref('')
const password = ref('')
const confirmPassword = ref('')
const acceptTerms = ref(false)
const formResultado = ref('')
const formResultadoTipo = ref('ok')

const knownIssues = reactive([
  {
    id: 'b1',
    titulo: 'El registro se completa aunque las contraseñas no coincidan',
    hint: 'Escribe algo distinto en "Contraseña" y "Confirmar contraseña".',
    detected: false,
  },
  {
    id: 'b2',
    titulo: 'El registro se completa sin aceptar los términos y condiciones',
    hint: 'Envía el formulario sin marcar la casilla de términos.',
    detected: false,
  },
])

const detectedCount = computed(() => knownIssues.filter((i) => i.detected).length)
const detectedPercent = computed(() => Math.round((detectedCount.value / knownIssues.length) * 100))

function registrar() {
  if (password.value !== '' && password.value !== confirmPassword.value) {
    knownIssues[0].detected = true
  }
  if (!acceptTerms.value) {
    knownIssues[1].detected = true
  }
  formResultado.value = `¡Registro exitoso! Bienvenido, ${usuario.value || 'usuario'}.`
  formResultadoTipo.value = 'ok'
}

const findingText = ref('')
const findingSeverity = ref('Bug')
const findings = reactive([])

function agregarHallazgo() {
  if (!findingText.value.trim()) return
  findings.unshift({
    text: findingText.value.trim(),
    severity: findingSeverity.value,
    time: elapsedLabel.value,
  })
  findingText.value = ''
}

function reiniciarSesion() {
  knownIssues.forEach((i) => {
    i.detected = false
  })
  findings.splice(0, findings.length)
  usuario.value = ''
  password.value = ''
  confirmPassword.value = ''
  acceptTerms.value = false
  formResultado.value = ''
  elapsedSeconds.value = 0
}

const elapsedSeconds = ref(0)
const elapsedLabel = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60)
    .toString()
    .padStart(2, '0')
  const s = (elapsedSeconds.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

let timerId = null
onMounted(() => {
  timerId = setInterval(() => {
    elapsedSeconds.value++
  }, 1000)
})
onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

const explainCards = [
  {
    title: 'Objetivo',
    icon: 'flag',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    text: 'Diseñar y ejecutar pruebas simultáneamente, usando la creatividad y el conocimiento del probador para descubrir comportamientos que los casos predefinidos no contemplan.',
  },
  {
    title: 'Ventajas',
    icon: 'thumb_up',
    color: 'linear-gradient(135deg, #38a169 0%, #276749 100%)',
    text: 'Encuentra defectos reales de uso rápidamente, se adapta a aplicaciones cambiantes y no depende de documentación exhaustiva ni de guiones previamente definidos.',
  },
  {
    title: 'Aplicaciones',
    icon: 'build',
    color: 'linear-gradient(135deg, #dd6b20 0%, #9c4221 100%)',
    text: 'Ideal en sprints cortos, pruebas de aceptación, validación de UX y como complemento de la automatización en los flujos críticos del usuario.',
  },
]
</script>

<style scoped>
.exp-page {
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

/* Browser mockup */
.browser-panel {
  display: flex;
  flex-direction: column;
}

.browser-chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: #eceef3;
  border-bottom: 1px solid #e0e0e8;
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

.url-bar {
  margin-left: 12px;
  background: white;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 0.8rem;
  color: #666;
  flex-grow: 1;
  font-family: 'Courier New', monospace;
}

.app-body {
  padding: 28px 24px;
}

.app-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d2d3a;
  margin: 0 0 18px;
}

.app-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Interaction panel */
.interact-panel {
  padding: 24px;
}

.panel-title-lg {
  font-size: 1.15rem;
  font-weight: 700;
  color: #2d2d3a;
  margin: 0 0 12px;
}

.charter {
  font-size: 0.86rem;
  color: #555;
  line-height: 1.5;
  background: #f4f5fb;
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0 0 8px;
}

.timer {
  font-size: 0.8rem;
  color: #888;
  margin: 0 0 16px;
  font-family: 'Courier New', monospace;
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

.findings-list {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
}

.finding-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.84rem;
  padding: 8px 10px;
  background: #f7f7fb;
  border-radius: 8px;
}

.finding-tag {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
}

.tag-Bug {
  background: #e53e3e;
}
.tag-Duda {
  background: #d69e2e;
}
.tag-Mejora {
  background: #667eea;
}

.finding-text {
  flex-grow: 1;
  color: #333;
}

.finding-time {
  flex-shrink: 0;
  color: #999;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
}

.empty-hint {
  margin-top: 16px;
  font-size: 0.84rem;
  color: #999;
  font-style: italic;
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
