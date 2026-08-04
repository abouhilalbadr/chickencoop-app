<script setup>
import { computed } from 'vue'
import Choice from './Choice.vue'

/**
 * A sauce, an extra, a meat. One shape for all three.
 *
 * The label is capitalised in script, not with `first-letter:capitalize` — the
 * chip is a flex container and `::first-letter` does not apply to one, which is
 * why the catalogue's lowercase names stayed lowercase on screen.
 */
const props = defineProps({
  label: { type: String, required: true },
  selected: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const text = computed(() =>
  props.label ? props.label.charAt(0).toUpperCase() + props.label.slice(1) : ''
)
</script>

<template>
  <Choice
    :selected="selected"
    :disabled="disabled"
    class="!gap-1.5 transition-transform active:scale-95"
    :class="disabled && !selected ? 'opacity-40 pointer-events-none' : ''"
  >
    <!-- The tick only exists once picked, so a selected chip reads as a
         decision and not just a coloured button -->
    <svg
      v-if="selected"
      class="animate-pop"
      viewBox="0 0 24 24" width="17" height="17" fill="none"
      stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
    {{ text }}
  </Choice>
</template>
