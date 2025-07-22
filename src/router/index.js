import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from 'layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', redirect: '/login' },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'registro', component: () => import('pages/RegistroPage.vue') },
      { path: 'cuidador', component: () => import('pages/CuidadorPage.vue') },
      { path: 'paciente', component: () => import('pages/PacientePage.vue') },
      { path: 'admin', component: () => import('pages/AdminDashboardPage.vue') }, // ⬆️ AQUÍ AGREGADO
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
