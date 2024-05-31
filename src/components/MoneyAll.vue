<script setup>
  import { ref } from 'vue';
  import Delete from './icons/Delete.vue';
  import Image1 from '../assets/images/1.jpg';
  import Image2 from '../assets/images/2.jpg';
  import Image5 from '../assets/images/5.jpg';
  import Image10 from '../assets/images/10.jpg';
  import Image20 from '../assets/images/20.jpg';
  import Image50 from '../assets/images/50.jpg';
  import Image100 from '../assets/images/100.jpg';
  import Image200 from '../assets/images/200.jpg';

  const calculation = ref(0)
  const money = ref([
    { value: 200, image: Image200, fois: 1, disabled: false },
    { value: 100, image: Image100, fois: 1, disabled: false },
    { value: 50, image: Image50, fois: 1, disabled: false },
    { value: 20, image: Image20, fois: 1, disabled: false },
    { value: 10, image: Image10, fois: 1, disabled: false },
    { value: 5, image: Image5, fois: 1, disabled: false },
    { value: 2, image: Image2, fois: 1, disabled: false },
    { value: 1, image: Image1, fois: 1, disabled: false },
  ])
  const addNum = (item) => {
    console.log('clicked', item);
    item.disabled = true
    calculation.value = calculation.value + (item.value * item.fois)
  }
  const deleteNum = () => {
    calculation.value = 0
    money.value.forEach((item) => {
      item.fois = 1
    })
  }


</script>

<template>
  <div class="my-8">
    <div class="relative flex items-center px-4 text-4xl bg-gray tracking-wider w-full rounded-md h-24 text-main">
      <span>
        {{ calculation }}
      </span>
        <button
          @click.prevent="deleteNum"
          class="text-white flex justify-center items-center rounded-md h-12 w-12 bg-red active:bg-black/60 active:scale-95 active:duration-[0s] absolute top-6 right-4"
        >
          <delete />
        </button>
    </div>
    <div class="grid grid-cols-3 gap-4 my-6">
      <div
        v-for="(item, i) in money" :key="i"
        class="relative flex items-center gap-4"
      >
        <div v-if="item.disabled" class="absolute inset-0 w-full h-full bg-black/50 z-30 cursor-not-allowed rounded-md"></div>
        <button
          @click="addNum(item)"
          class="flex items-center justify-center"
          :disabled="item.disabled"
        >
          <img :src="item.image" :alt="`${item.value}DH`">
        </button>
        <span class="text-xs"> X </span>
        <input
          v-model="item.fois"
          type="number"
          class="border border-border rounded-lg p-2 h-8 text-sm text-main outline-none"
        >
      </div>
    </div>
  </div>
</template>
