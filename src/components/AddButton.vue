<script setup>
  defineProps(['title'])
  const emit = defineEmits(['openModal'])
  const openTacosModal = () => {
    emit('openModal')
  }
</script>

<template>
  <button
    class="bg-main text-white rounded-md p-4 shadow-xl border border-border flex flex-col items-center justify-center gap-6 hover:shadow-3xl transition-shadow"
    @click="openTacosModal"
  >
    <svg viewBox="0 0 24 24" width="80" height="80" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    <span class="text-2xl font-bold font-bree-serif">
      {{ title }}
    </span>
  </button>
</template>