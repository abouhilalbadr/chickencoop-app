<script setup>
/**
 * The second elevation level: a white card on the warm field, with an optional
 * header rule. Everything on a till screen that is not the page sits in one.
 */
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  padded: { type: Boolean, default: true },
})
</script>

<template>
  <section class="bg-white border border-black/[.07] rounded-xl shadow-sm flex flex-col min-h-0">
    <header v-if="title || $slots.actions" class="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
      <div class="min-w-0">
        <h2 class="font-bree-serif text-[17px] leading-tight">{{ title }}</h2>
        <p v-if="subtitle" class="text-[12.5px] text-black/55 mt-0.5">{{ subtitle }}</p>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <slot name="actions" />
      </div>
    </header>
    <div class="min-h-0 flex flex-col" :class="padded ? 'p-4' : ''">
      <slot />
    </div>
  </section>
</template>
