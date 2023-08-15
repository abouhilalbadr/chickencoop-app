<script setup>
  defineProps(['cart', 'subTotal', 'showPromo', 'percent', 'percentTotal', 'pay', 'bipeur'])
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-8 p-10">
    <div class="flex flex-col justify-center items-center">
      <img class="h-32" src="../assets/images/logo-bw.png" alt="Chicken Coop" />
      <h1 class="uppercase text-lg mt-2">Chicken Coop</h1>
      <p class="text-lg">Bab Asfi 2, 24, Marrakech 40170</p>
      <span class="text-lg ">TEL: 06.24.42.74.06</span>
      <span class="text-lg ">Bipeur: {{ bipeur }}</span>
    </div>
    <div class="border-y my-4 py-4 border-solid border-black w-full">
      <div class="flex justify-center items-center mb-2">
        <span class="text-lg">{{ new Date().toLocaleDateString('fr-FR') }} {{ new Date().toLocaleTimeString('fr-FR', { hour12: false }) }}</span>
      </div>
      <div class="border-b mb-2 pb-2 px-2 border-solid border-black flex justify-between gap-2">
        <span>Article</span>
        <span>Prix</span>
      </div>
      <div class="border-b mb-2 pb-2 flex flex-col gap-1 px-2">
        <div
          v-for="(item, i) in cart"
          :key="i"
          class="flex justify-between gap-2"
        >
          <div class="flex flex-col">
            <h2 class="font-bold">{{ item.name }} <span v-if="item.size" class="uppercase">({{ item.size }})</span></h2>
            <p class="flex flex-col gap-1 text-xs pl-2">
              <span v-if="item.viandes && item.viandes.length > 0">Les viandes: {{ item.viandes.join(',  ') }}</span>
              <span v-if="item.sauces && item.sauces.length > 0">Les sauces: {{ item.sauces.join(', ') }}</span>
              <span v-if="item.extras && item.extras.length > 0">Les extras: {{ item.extras.join(', ') }}</span>
            </p>
          </div>
          <span class="text-xl font-bold">{{ parseFloat(item.price).toFixed(2) }}</span>
        </div>
      </div>
      <div v-if="showPromo" class="border-b mb-2 pb-2 flex flex-col gap-1 px-2">
        <div v-if="cart.length > 0" class="flex items-center justify-between">
          <span class="text-xl">Sous total</span>
          <span class="text-xl font-bold">{{ parseFloat(subTotal).toFixed(2) }}</span>
        </div>
        <div v-if="cart.length > 0" class="flex items-center justify-between">
          <span class="text-xl">Promotion <span class="font-bold">({{ percent }}%)</span></span>
          <span class="text-xl font-bold"> - {{ parseFloat(percentTotal).toFixed(2) }}</span>
        </div>
      </div>
      <div v-if="cart.length > 0" class="flex items-center justify-between">
        <span class="text-3xl">TOTAL</span>
        <span class="text-3xl font-bold">{{ parseFloat(subTotal - percentTotal).toFixed(2) }}</span>
      </div>
    </div>
    <div class="flex flex-col gap-4 justify-center items-center text-center">
      <p class="text-3xl">Merci de votre visite</p>
      <img class="h-32" src="../assets/images/qrcode.png" alt="Chicken Coop QR" />
    </div>
  </div>
</template>