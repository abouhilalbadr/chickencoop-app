<script setup>
/** Nothing here yet, said once and the same way. */
defineProps({
  title: { type: String, required: true },
  text: { type: String, default: '' },
})
</script>

<template>
  <div class="border border-dashed border-border rounded-xl px-6 py-8 flex flex-col items-center gap-1.5 text-center">
    <p class="font-bree-serif text-[15px]">{{ title }}</p>
    <p v-if="text" class="text-[12.5px] text-black/55">{{ text }}</p>
    <div v-if="$slots.default" class="mt-2">
      <slot />
    </div>
  </div>
</template>
