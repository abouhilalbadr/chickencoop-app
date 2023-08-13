<script setup>
  import { TransitionRoot, TransitionChild } from '@headlessui/vue'

  defineProps(['isShowing'])
</script>

<template>
    <TransitionRoot appear :show="isShowing">
        <TransitionChild
          enter="transition ease-in-out duration-300 transform absolute top-0"
          enter-from="-translate-x-full"
          enter-to="translate-x-0"
          leave="transition ease-in-out duration-100 transform"
          leave-from="-translate-x-0"
          leave-to="translate-x-full"
        >
          <h4 class="text-2xl font-bold text-main my-4">
            <slot name="stepTitle"></slot>
          </h4>
          <slot name="stepBody"></slot>
        </TransitionChild>
      </TransitionRoot>
</template>
