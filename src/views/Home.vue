<script setup>
import Cart from "../components/icons/Cart.vue";
import Cash from "../components/icons/Cash.vue";
import Tablet from "../components/icons/Tablet.vue";
import { useRouter } from "vue-router"
import { useStore } from "../store"

const router = useRouter()
const store = useStore()

// Three posts, one screen. Each one is a card, not an outline.
const posts = [
  { type: 'stockage', label: 'Charges', hint: 'Achats et caisse du jour', icon: Cart },
  { type: 'caisse', label: 'Caisse', hint: 'Prise de commande et impression', icon: Cash },
  { type: 'tablet', label: 'Tablet', hint: 'Prise de commande en salle', icon: Tablet },
]

const open = (type) => {
  store.updateType(type)
  router.push('/password')
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center items-center gap-12 p-8">
    <img src="../assets/images/logo.png" alt="Chicken Coop" class="w-52">

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl">
      <button
        v-for="post in posts"
        :key="post.type"
        @click="open(post.type)"
        class="group bg-white border border-black/[.07] rounded-xl shadow-sm px-6 py-8 flex flex-col items-center gap-4
          transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main/40"
      >
        <span class="w-20 h-20 rounded-xl bg-main/[.10] flex items-center justify-center transition-colors group-hover:bg-main/20">
          <component :is="post.icon" class="h-11 fill-main" />
        </span>
        <span class="font-bree-serif text-2xl">{{ post.label }}</span>
        <span class="text-[13px] text-black/50">{{ post.hint }}</span>
      </button>
    </div>
  </div>
</template>
