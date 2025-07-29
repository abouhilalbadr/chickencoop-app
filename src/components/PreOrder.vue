<script setup>
import { useStore } from "../store"
import Close from "./icons/Close.vue";

const store = useStore()
const emits = defineEmits(['change-page', 'add-to-cart'])

const updatePage = (p) => {
  emits('change-page', p)
}

const addOrderToCart = (order) => {
  emits('add-to-cart', order)
}

const jsonProducts = (products) => {
  return JSON.parse(products)
}

</script>

<template>
  <div class="relative">
    <div class="fixed top-0 left-0 w-full h-screen z-40 bg-black/90"></div>
    <aside class="fixed top-0 right-0 w-1/2 z-50 bg-white shadow-xl border-l border-border">
      <div class="flex justify-between items-center gap-4 p-4">
        <h2 class="text-2xl font-bold">Précommandes sur le site Web</h2>
        <button @click="updatePage('caisse')" class="text-main h-10 w-10 p-2 rounded-full bg-black/10 hover:bg-main hover:text-white transition-all flex justify-center items-center">
          <close />
        </button>
      </div>
      <div class="px-4 pt-6 pb-16 flex flex-col gap-4 overflow-scroll h-[calc(100vh-2rem)]">
        <div v-for="(item, i) in store.preorders" :key="i" class="flex flex-col gap-4 border border-border p-4 rounded-md">
          <div class="flex justify-between items-center gap-4">
            <h3>Commande du <span class="font-bold">{{ item.clientName }}</span> <span class="text-main">({{ item.clientPhone }})</span></h3>
            <h4 class="font-bold text-xl text-main">{{ item.total }} DH</h4>
          </div>
          <div class="flex flex-col gap-4">
            <div v-for="(product, j) in jsonProducts(item.products)" :key="j" class="relative border-b last:border-none border-border flex items-center justify-between gap-4 py-4 px-2 mb-2 w-full">
              <div class="flex items-center gap-4 flex-1">
                <img :src="product.image" :alt="product.name" class="h-12 object-cover rounded-md">
                <div class="flex flex-col gap-2">
                  <h5 class="text-black font-bold font-bree-serif">{{ product.number > 1 ? `${product.number}x ` : '' }} {{ product.name }} <span v-if="product.size" class="uppercase text-main">({{ product.size }})</span></h5>
                  <div class="flex flex-col gap-1 text-black/50 text-xs">
                    <span v-if="product.viandes && product.viandes.length > 0">Les viandes: {{ product.viandes.join(',  ') }}</span>
                    <span v-if="product.sauces && product.sauces.length > 0">Les sauces: {{ product.sauces.join(', ') }}</span>
                    <span v-if="product.extras && product.extras.length > 0">Les extras: {{ product.extras.join(', ') }}</span>
                  </div>
                </div>
              </div>
              <span class="text-xl font-bree-serif text-main">{{ product.price }} <span class="text-base">DH</span></span>
            </div>
          </div>
          <div class="flex justify-end">
            <button @click="addOrderToCart(item)" class="bg-main text-white px-4 py-2 rounded-md">Ajouter à la caisse</button>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>