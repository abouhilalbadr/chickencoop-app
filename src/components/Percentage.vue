<script setup>
import { ref } from 'vue';
import Delete from './icons/Delete.vue';
import Choice from './ui/Choice.vue';

const selectedPercent = ref(0)
const emit = defineEmits(['reset', 'add'])

const PERCENTS = [10, 20, 30, 50]

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
  <div class="grid grid-cols-5 gap-2">
    <Choice
      v-for="p in PERCENTS"
      :key="p"
      :selected="selectedPercent === p"
      size="lg"
      block
      class="!font-bree-serif !text-xl"
      @click="addPercentage(p)"
    >
      {{ p }}%
    </Choice>
    <button
      @click="deleteNum"
      class="h-14 rounded-lg bg-gray-light border border-border text-black/60 flex justify-center items-center
        transition-colors hover:bg-black/[.06] active:scale-95 active:duration-[0s]"
      title="Effacer la promotion"
    >
      <delete />
    </button>
  </div>
</template>
