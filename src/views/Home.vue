<script setup>
import Cart from "../components/icons/Cart.vue";
import Cash from "../components/icons/Cash.vue";
import { useRouter } from "vue-router"
import { useStore } from "../store"
const router = useRouter()
const store = useStore()

const showCart = () => {
  store.updateType('stockage')
  router.push('/password')
}

const showCash = () => {
  store.updateType('caisse')
  router.push('/password')
}

</script>

<template>
  <div class="flex flex-col justify-center items-center w-full min-h-screen gap-6 p-8">
      <img src="../assets/images/logo.png" alt="Chicken Coop Logo" class="w-80">
      <div class="flex justify-between gap-4 w-full lg:w-1/3 mt-16">
        <button @click="showCart" class="group transition flex flex-col items-center gap-2 bg-white border-2 border-main rounded-md w-64 py-4 hover:bg-main">
          <Cart class="h-32 fill-main group-hover:fill-white" />
          <span class="text-main group-hover:text-white font-bree-serif font-bold text-3xl">Stockage</span>
        </button>
        <button @click="showCash" class="group transition flex flex-col items-center gap-2 bg-white border-2 border-main rounded-md w-64 py-4 hover:bg-main">
          <Cash class="h-32 fill-main group-hover:fill-white" />
          <span class="text-main group-hover:text-white font-bree-serif font-bold text-3xl">Caisse</span>
        </button>
      </div>
  </div>
</template>