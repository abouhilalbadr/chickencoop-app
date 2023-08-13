<script setup>
  import { ref } from 'vue';
  import Delete from './icons/Delete.vue';

  const selectedPercent = ref(0)
  const emit = defineEmits(['reset', 'add'])

  const addPercentage = (num) => {
    selectedPercent.value = num
    emit('add', num)
  }

  const deleteNum = () => {
    selectedPercent.value = 0
    emit('reset')
  }

</script>

<template>
  <div class="grid grid-cols-8 gap-2 my-6">
    <div class="col-span-7 grid grid-cols-4 gap-2">
      <button
        class="border border-main rounded-md text-main h-16 text-2xl font-bold font-bree-serif transition-all hover:bg-main hover:text-white"
        :class="selectedPercent === 10 ? 'bg-main text-white' : ''"
        @click="addPercentage(10)"
      >
        <span>10%</span>
      </button>
      <button
        class="border border-main rounded-md text-main h-16 text-2xl font-bold font-bree-serif transition-all hover:bg-main hover:text-white"
        :class="selectedPercent === 20 ? 'bg-main text-white' : ''"
        @click="addPercentage(20)"
      >
        <span>20%</span>
      </button>
      <button
        class="border border-main rounded-md text-main h-16 text-2xl font-bold font-bree-serif transition-all hover:bg-main hover:text-white"
        :class="selectedPercent === 30 ? 'bg-main text-white' : ''"
        @click="addPercentage(30)"
      >
        <span>30%</span>
      </button>
      <button
        class="border border-main rounded-md text-main h-16 text-2xl font-bold font-bree-serif transition-all hover:bg-main hover:text-white"
        :class="selectedPercent === 50 ? 'bg-main text-white' : ''"
        @click="addPercentage(50)"
      >
        <span>50%</span>
      </button>
    </div>
    <div class="col-span-1">
      <button @click="deleteNum" class="text-black flex justify-center items-center rounded-md h-full w-full bg-border active:bg-black/60 active:scale-95 active:duration-[0s]">
        <delete />
      </button>
    </div>
  </div>
</template>