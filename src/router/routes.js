const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      { path: '/rama', component: () => import('@/pages/CoberturaRama.vue') },
      { path: '/flujo-datos', component: () => import('@/pages/FlujoDatos.vue') },
      { path: '/exploracion', component: () => import('@/pages/ExploracionPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
