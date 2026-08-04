<script setup>
/**
 * One category in the rail — and the Menu button, which is the same thing with
 * a different source.
 *
 * The name is what people scan for, so it is the biggest thing on the tile and
 * runs along the icon rather than under it: a 12px label centred under a picture
 * meant reading twenty of them one at a time.
 */
defineProps({
  label: { type: String, required: true },
  active: { type: Boolean, default: false },
})
</script>

<template>
  <button
    type="button"
    class="group h-16 pl-2.5 pr-3 rounded-xl border flex items-center gap-2.5 text-left transition-all
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main/40"
    :class="active
      ? 'bg-main border-main text-white shadow-sm'
      : 'bg-white border-black/[.07] text-black shadow-sm hover:border-main/40 hover:shadow-lg'"
  >
    <span
      class="w-11 h-11 shrink-0 rounded-lg flex items-center justify-center transition-colors"
      :class="active ? 'bg-white/20' : 'bg-main/[.10] group-hover:bg-main/20'"
    >
      <slot />
    </span>
    <span class="font-medium text-[15px] leading-tight capitalize line-clamp-2">{{ label }}</span>
  </button>
</template>
