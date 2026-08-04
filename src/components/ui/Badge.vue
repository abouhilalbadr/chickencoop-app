<script setup>
/** Order types, delivery statuses, counts. Tinted, never a solid fill. */
defineProps({
  tone: { type: String, default: 'neutral' }, // neutral | brand | positive | warning | danger
})

const tones = {
  neutral: 'bg-black/[.06] text-black/75',
  brand: 'bg-main/[.12] text-[#c14a28]',
  positive: 'bg-green/[.14] text-[#3c7a58]',
  warning: 'bg-yellow/[.22] text-[#7a5c00]',
  danger: 'bg-danger/[.10] text-danger',
}
</script>

<template>
  <span
    class="badge inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-xs font-medium whitespace-nowrap"
    :class="tones[tone] || tones.neutral"
  >
    <slot />
  </span>
</template>
