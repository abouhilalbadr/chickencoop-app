<script setup>
import { ref } from "vue"

import Modal from "./Modal.vue";
import Choice from "./ui/Choice.vue";

const props = defineProps(['settingModal'])
const emit = defineEmits(['closeModal', 'updateInput'])

const number = ref(0)

const closeModal = () => {
  emit('closeModal')
}

// Picking the buzzer is what sends the order — one tap, no confirm step.
const setNumber = (num) => {
  number.value = num
  emit('updateInput', num)
}
</script>

<template>
  <Modal size="small" :is-open="settingModal" @close-modal="closeModal">
    <template v-slot:title>Numéro de bipeur</template>
    <template v-slot:body>
      <div class="grid grid-cols-5 gap-2.5">
        <Choice
          v-for="i in 20"
          :key="i"
          :selected="number === i"
          size="lg"
          block
          class="!font-bree-serif !text-xl"
          @click="setNumber(i)"
        >
          {{ i }}
        </Choice>
      </div>
    </template>
  </Modal>
</template>
