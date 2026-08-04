<script setup>
import Arrow from './icons/Arrow.vue';

const emit = defineEmits(['reset', 'add'])
</script>

<template>
  <!-- Types the amount paid. Same keys as the lock screen, so the pad is the
       same object wherever it appears. -->
  <div class="keyboard grid grid-cols-4 grid-rows-4 gap-2 h-[264px] select-none">
    <button @click="emit('add', '1')"><span>1</span></button>
    <button @click="emit('add', '2')"><span>2</span></button>
    <button @click="emit('add', '3')"><span>3</span></button>
    <button @click="emit('add', 'x')" class="row-span-4 !bg-gray-light" title="Effacer un chiffre">
      <arrow />
    </button>
    <button @click="emit('add', '4')"><span>4</span></button>
    <button @click="emit('add', '5')"><span>5</span></button>
    <button @click="emit('add', '6')"><span>6</span></button>
    <button @click="emit('add', '7')"><span>7</span></button>
    <button @click="emit('add', '8')"><span>8</span></button>
    <button @click="emit('add', '9')"><span>9</span></button>
    <button @click="emit('reset')" class="!bg-main !border-main !text-white" title="Tout effacer">
      <span>C</span>
    </button>
    <button @click="emit('add', '0')"><span>0</span></button>
    <button @click="emit('add', '.')"><span>.</span></button>
  </div>
</template>
