<template>
  <q-page class="index-page">
    <header class="hero">
      <div class="hero-inner">
        <h1 class="hero-title">Técnicas de Prueba de Software</h1>
        <p class="hero-subtitle">
          Demos interactivas para explorar, paso a paso, cómo funcionan las técnicas clásicas de
          diseño y cobertura de casos de prueba: caja blanca, caja negra y pruebas exploratorias.
        </p>
      </div>
    </header>

    <main class="content">
      <p class="intro">
        Cada tarjeta abre una demo interactiva donde puedes ejecutar casos de prueba sobre un
        fragmento de código o una aplicación simulada, y ver en tiempo real cómo se cubre (o no)
        cada rama, condición o flujo de datos relevante.
      </p>

      <div class="card-grid">
        <router-link
          v-for="technique in techniques"
          :key="technique.route"
          :to="technique.available ? technique.route : ''"
          class="technique-card"
          :class="{ 'technique-card--disabled': !technique.available }"
        >
          <div class="card-icon" :style="{ background: technique.color }">
            <q-icon :name="technique.icon" size="28px" color="white" />
          </div>
          <h2 class="card-title">{{ technique.title }}</h2>
          <p class="card-desc">{{ technique.description }}</p>
          <span v-if="!technique.available" class="card-badge">Próximamente</span>
          <span v-else class="card-cta">Explorar demo &rarr;</span>
        </router-link>
      </div>
    </main>
  </q-page>
</template>

<script setup>
const techniques = [
  {
    title: 'Cobertura de Rama / Decisión',
    description:
      'Caja blanca dinámica: ejecuta casos sobre una función con múltiples decisiones y observa qué ramas cubres.',
    route: '/rama',
    icon: 'account_tree',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    available: true,
  },
  {
    title: 'Prueba de Flujo de Datos',
    description:
      'Rastrea definiciones y usos de variables a lo largo del flujo de ejecución de un programa.',
    route: '/flujo-datos',
    icon: 'device_hub',
    color: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
    available: true,
  },
  {
    title: 'Pruebas Exploratorias',
    description:
      'Caja negra: interactúa libremente con una app simulada y registra hallazgos sobre la marcha.',
    route: '/exploracion',
    icon: 'travel_explore',
    color: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    available: true,
  },
]
</script>

<style scoped>
.index-page {
  min-height: 100vh;
  background: #f4f5fb;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 64px 24px;
  text-align: center;
}

.hero-inner {
  max-width: 760px;
  margin: 0 auto;
}

.hero-title {
  font-size: 2.4rem;
  font-weight: 700;
  margin: 0 0 16px;
}

.hero-subtitle {
  font-size: 1.05rem;
  line-height: 1.6;
  opacity: 0.92;
  margin: 0;
}

.content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

.intro {
  text-align: center;
  color: #4a4a5a;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto 40px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.technique-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 14px;
  padding: 28px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.technique-card:not(.technique-card--disabled):hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(102, 126, 234, 0.2);
}

.technique-card--disabled {
  cursor: default;
  opacity: 0.6;
}

.card-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #2d2d3a;
}

.card-desc {
  font-size: 0.92rem;
  line-height: 1.55;
  color: #666;
  margin: 0 0 16px;
  flex-grow: 1;
}

.card-cta {
  font-weight: 600;
  color: #667eea;
  font-size: 0.9rem;
}

.card-badge {
  align-self: flex-start;
  background: #eee;
  color: #888;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
}
</style>
