<script setup>
  import { ref } from 'vue'
  defineProps(['item'])
  const hover = ref(false)
</script>

<template>
  <div @mouseover="hover = true" @mouseleave="hover = false" class="cart-item relative border-b last:border-none border-border flex items-center justify-between gap-4 py-4 px-2 mb-2 cursor-pointer w-full">
    <div v-if="hover" class="absolute top-0 left-0 z-10 h-full w-full flex items-center justify-center">
      <span class="bg-[red] text-white px-8 py-2 flex items-center justify-center rounded-md">Supprimer</span>
    </div>
    <div class="flex items-center gap-4 flex-1">
      <img :src="item.image" :alt="item.name" class="h-12 object-cover rounded-md">
      <div class="flex flex-col gap-2">
        <h2 class="text-black font-bold font-bree-serif">{{ item.name }} <span v-if="item.size" class="uppercase text-main">({{ item.size }})</span></h2>
        <p class="flex flex-col gap-1 text-black/50 text-xs">
          <span v-if="item.viandes && item.viandes.length > 0">Les viandes: {{ item.viandes.join(',  ') }}</span>
          <span v-if="item.sauces && item.sauces.length > 0">Les sauces: {{ item.sauces.join(', ') }}</span>
          <span v-if="item.extras && item.extras.length > 0">Les extras: {{ item.extras.join(', ') }}</span>
        </p>
      </div>
    </div>
    <span class="text-xl font-bree-serif text-main">{{ item.price }} <span class="text-base">DH</span></span>
  </div>
</template>