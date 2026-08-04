<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'

/**
 * The one overlay. Third elevation level: white card, shadow-lg, over a scrim.
 * Title, body and actions are separated by rules, and the action row stays put
 * while a long body scrolls — a tacos with twelve options used to push the
 * buttons off the bottom of the screen.
 */
defineProps({
  isOpen: { type: Boolean, default: false },
  size: { type: String, default: 'normal' }, // small | normal | wide
})
const emit = defineEmits(['closeModal'])

const widths = {
  small: 'max-w-2xl',
  normal: 'max-w-5xl',
  wide: 'max-w-7xl',
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="emit('closeModal')" class="relative z-40">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/45" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full bg-white rounded-xl shadow-lg flex flex-col max-h-[92vh] text-left overflow-hidden"
              :class="widths[size] || widths.normal"
            >
              <DialogTitle
                v-if="$slots.title"
                as="h2"
                class="font-bree-serif text-xl px-6 py-4 border-b border-border shrink-0"
              >
                <slot name="title" />
              </DialogTitle>

              <div class="px-6 py-5 overflow-y-auto">
                <slot name="body" />
              </div>

              <div v-if="$slots.buttons" class="px-6 py-4 border-t border-border shrink-0">
                <slot name="buttons" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
