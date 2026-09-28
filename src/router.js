import { createRouter, createWebHashHistory } from "vue-router"
import Home from "./views/Home.vue"
import Password from "./views/Password.vue"
import Caisse from "./views/Caisse.vue"
import Stockage from "./views/stockage/index.vue"
import Tablet from "./views/tablet/index.vue"

import { useStore } from "./store"

const routes = [
  { path: '/', component: Home },
  { path: '/password', component: Password },
  { path: '/caisse', component: Caisse },
  { path: '/stockage', component: Stockage },
  { path: '/tablet', component: Tablet },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from) => {
  const store = useStore()
  // Caissiers sign in under their own names, so the post is read from the
  // account's role and email, not from its display name.
  const user = store?.user
  const url = user?.role === 'STOCK' || user?.name === 'Charge'
    ? '/stockage'
    : user?.email === 'tablet@chickencoop.ma' || user?.name === 'Tablet' ? '/tablet' : '/caisse'
  if (store?.user && (to.path === '/' || to.path === '/password')) {
    return url
  }
  if (!store.user && (to.path.includes('caisse') ||  to.path.includes('stockage') ||  to.path.includes('tablet')) ) {
    return '/'
  }
})

export default router