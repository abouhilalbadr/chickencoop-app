import { createRouter, createWebHashHistory } from "vue-router"
import Home from "./views/Home.vue"
import Password from "./views/Password.vue"
import Caisse from "./views/Caisse.vue"
import Stockage from "./views/stockage/index.vue"

import { useStore } from "./store"

const routes = [
  { path: '/', component: Home },
  { path: '/password', component: Password },
  { path: '/caisse', component: Caisse },
  { path: '/stockage', component: Stockage },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from) => {
  const store = useStore()
  if (store?.user && to.path === '/') {
    return `/${store.type}`
  }
  if (!store.user && (to.path.includes('caisse') ||  to.path.includes('stockage'))) {
    return '/'
  }
})

export default router