<script setup>
import { computed } from 'vue'

/** Money reads the same everywhere: tabular figures, unit reduced. */
const props = defineProps({
  value: { type: [Number, String], default: 0 },
  size: { type: String, default: 'row' }, // row | total | hero
  decimals: { type: Boolean, default: true },
  unit: { type: String, default: 'DH' },
  tone: { type: String, default: '' }, // '' | brand | positive | danger
})

const amount = computed(() => {
  const n = Number(props.value) || 0
  return props.decimals ? n.toFixed(2) : n.toLocaleString('fr-FR')
})

const sizes = {
  row: 'text-base font-medium',
  total: 'font-bree-serif text-[26px]',
  hero: 'font-bree-serif text-[38px]',
}

const tones = {
  brand: 'text-main',
  positive: 'text-second',
  danger: 'text-danger',
}
</script>

<template>
  <span class="tabular-nums whitespace-nowrap" :class="[sizes[size] || sizes.row, tones[tone] || '']">
    {{ amount }}
    <!-- The unit inherits the amount's colour so this reads on a photo scrim
         as well as on white -->
    <span class="opacity-55" :class="size === 'row' ? 'text-xs' : 'text-[15px]'">{{ unit }}</span>
  </span>
</template>
