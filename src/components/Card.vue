<script setup>
  import { useStore } from "../store"

  const store = useStore()
  defineProps(['item'])
</script>

<template>
  <div class="relative bg-white rounded-md shadow-xl border border-border flex flex-col items-center hover:shadow-3xl transition-shadow cursor-pointer">
    <img :src="item.image" :alt="item.name" class="w-full h-[200px] object-cover rounded-md">
    <div class="absolute left-0 bottom-0 w-full">
      <div class="details relative w-full h-full p-4">
        <h2 class="text-2xl text-white font-bold font-bree-serif">{{ item.name }}</h2>
        <span class="text-3xl font-bree-serif text-main">{{ store.glovo ? item.priceGlovo : item.price }} <span class="text-base">DH</span></span>
      </div>
    </div>
  </div>
</template>
