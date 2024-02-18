<script setup>
  defineProps(['cart', 'subTotal', 'showPromo', 'percent', 'percentTotal', 'pay', 'bipeur', 'type', 'livraison'])

  const types = [
    { name: 'Sur place', value: 'SUR_PLACE' },
    { name: 'À emporter', value: 'A_EMPORTER' },
    { name: 'Livraison', value: 'LIVRAISON' },
    { name: 'Gratuit', value: 'GRATUIT' },
    { name: 'Glovo', value: 'GLOVO' },
  ]

  const livraisons = [
    { name: 'Gratuit', value: 0 },
    { name: 'Zone A', value: 10 },
    { name: 'Zone B', value: 20 },
  ]

  const getType = (value) => {
    const type = types.find(item => item.value === value)
    return type ? type.name : 'Sur place'
  }

  const formatCart = (arr) => {
    const finalFormat = [];
    var productsIndexs = [];
    arr.map(item => {
      if (item && item.index) {
        productsIndexs.push(item.index)
      } else {
        finalFormat.push(item)
      }
    });
    const counts = {};
    productsIndexs.map((x) => ( counts[x] = (counts[x] || 0) + 1 ));
    for (const key in counts) {
      if (Object.hasOwnProperty.call(counts, key)) {
        const el = counts[key];
        const currentProduct = arr.find(item => item.index === parseInt(key))
        if (currentProduct.productId && currentProduct.productId > 0) {
          finalFormat.push({
            name: (el > 1 ? el + "x " : '') + currentProduct.name,
            image: currentProduct.image,
            price: el * currentProduct.price,
            productId: currentProduct.productId,
            mode: currentProduct.mode,
            sauces: currentProduct.sauces,
            index: currentProduct.index,
            number: currentProduct.number
          })
        } else {
          finalFormat.push(currentProduct)
        }
      }
    }
    return finalFormat
  }

  const getLivraison = (type, value) => {
    if (type !== 'LIVRAISON') return ''
    const livraison = livraisons.find(item => item.value === value)
    return livraison ? livraison.name : ''
  }

</script>

<template>
  <div class="flex flex-col justify-center items-center gap-8 p-10">
    <div class="flex flex-col justify-center items-center">
      <img class="h-32" src="../assets/images/logo-bw.png" alt="Chicken Coop" />
      <h1 class="uppercase text-lg mt-2">Chicken Coop</h1>
      <p class="text-lg">Bab Asfi 2, 24, Marrakech 40170</p>
      <span class="text-lg ">TEL: 06.24.42.74.06</span>
      <span v-if="type !== 'GLOVO'" class="text-lg ">Bipeur: {{ bipeur }}</span>
      <span class="text-3xl font-bold">{{ getType(type) }} {{ getLivraison(type, livraison) }}</span>
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
          v-for="(item, i) in formatCart(cart)"
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
      <div v-if="type === 'LIVRAISON'" class="border-b mb-2 pb-2 px-2 flex items-center justify-between gap-2">
        <span class="text-xl">Livraison</span>
        <span class="text-xl font-bold">{{ livraison }} <span class="text-base">DH</span></span>
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
        <span class="text-3xl font-bold">{{ parseFloat((subTotal + (livraison === -1 ? 0 : livraison)) - percentTotal).toFixed(2) }}</span>
      </div>
    </div>
    <div class="flex flex-col gap-4 justify-center items-center text-center">
      <p class="text-3xl">Merci de votre visite</p>
      <img class="h-32" src="../assets/images/qrcode.png" alt="Chicken Coop QR" />
    </div>
  </div>
</template>
