<script setup>
/**
 * The one button in the till.
 *
 * `primary` is rationed: one per view — sending the order, saving the form.
 * `danger` is outlined and only fills on hover, so removing something never
 * looks like the main action. Every size clears a 44px touch target.
 */
defineProps({
  variant: { type: String, default: 'secondary' }, // primary | secondary | ghost | danger | success
  size: { type: String, default: 'md' }, // md | lg | xl
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})

const variants = {
  primary: 'bg-main text-white hover:bg-main-hover',
  success: 'bg-second text-white hover:bg-second/85',
  secondary: 'bg-white text-black border border-border hover:bg-gray-light',
  ghost: 'bg-transparent text-black/70 hover:bg-black/[.05]',
  danger: 'bg-white text-danger border border-danger/40 hover:bg-danger hover:text-white hover:border-danger',
}

const sizes = {
  md: 'h-12 px-5 text-[15px] rounded-lg',
  lg: 'h-14 px-6 text-base rounded-lg',
  xl: 'h-16 px-8 text-lg rounded-xl',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="font-medium inline-flex items-center justify-center gap-2.5 transition-colors duration-100
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main/40 focus-visible:ring-offset-2
      disabled:opacity-45 disabled:pointer-events-none"
    :class="[variants[variant] || variants.secondary, sizes[size] || sizes.md, block ? 'w-full' : '']"
  >
    <span v-if="loading" class="loading" />
    <slot />
  </button>
</template>
