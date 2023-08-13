<script setup>
  import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle,
  } from '@headlessui/vue'
  defineProps(['isOpen', 'size'])
  const emit = defineEmits(['closeModal'])

  const closeMe = () => {
    emit('closeModal')
  }

</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeMe" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="transform overflow-hidden rounded-2xl bg-white p-10 text-left align-middle shadow-xl transition-all"
              :class="size === 'small' ? 'small-modal' : 'normal-modal'"
            >
              <DialogTitle
                as="h3"
                class="text-5xl font-bold"
              >
                <slot name="title"></slot>
              </DialogTitle>
              <div class="my-4">
                <slot name="body"></slot>
              </div>

              <slot name="buttons"></slot>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
