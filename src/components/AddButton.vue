<script setup>
defineProps(['title'])
const emit = defineEmits(['openModal'])
</script>

<template>
  <!-- Not a product: a builder. Dashed and unfilled so it reads as an action
       inside a grid of photos. -->
  <button
    type="button"
    class="min-h-[192px] rounded-xl border-2 border-dashed border-main/45 bg-main/[.06] text-main
      flex flex-col items-center justify-center gap-3 p-4 transition-colors hover:bg-main/[.12] hover:border-main
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main/40"
    @click="emit('openModal')"
  >
    <svg viewBox="0 0 24 24" width="44" height="44" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    <span class="font-bree-serif text-lg text-center leading-tight">{{ title }}</span>
  </button>
</template>
