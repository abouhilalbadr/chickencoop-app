<script setup>
/**
 * A choice among several: order type, delivery zone, tacos size, a sauce, a
 * discount. Selected is a filled brand chip, unselected is a plain surface —
 * the same pair everywhere, so "picked" always looks the same.
 *
 * Outlined-when-unselected was the old pattern: fifteen orange outlines on a
 * screen made none of them mean anything.
 */
defineProps({
  selected: { type: Boolean, default: false },
  size: { type: String, default: 'md' }, // sm | md | lg
  block: { type: Boolean, default: false },
})

const sizes = {
  sm: 'h-10 px-4 text-sm rounded-lg',
  md: 'h-12 px-5 text-[15px] rounded-lg',
  lg: 'h-14 px-4 text-[15px] rounded-lg',
  // Icon over label, for a row of equal-width choices
  tile: 'h-[76px] px-1.5 text-[12.5px] rounded-lg !flex-col !gap-1.5',
}
</script>

<template>
  <button
    type="button"
    class="font-medium inline-flex items-center justify-center gap-2 border transition-colors duration-100
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main/40 focus-visible:ring-offset-2
      disabled:opacity-45 disabled:pointer-events-none"
    :class="[
      sizes[size] || sizes.md,
      block ? 'w-full' : '',
      selected
        ? 'bg-main border-main text-white'
        : 'bg-white border-border text-black hover:border-main/40 hover:bg-gray-light',
    ]"
  >
    <slot />
  </button>
</template>
