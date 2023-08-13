<script setup>
import { ref, computed } from "vue"

import Modal from "./Modal.vue";

import { useStore } from "../store"

const store = useStore()

const props = defineProps(['settingModal'])
const emit = defineEmits(['settingsClose', 'updateInput'])

const number = ref(0)

const closeModal = () => {
  emit('settingsClose')
}

const setNumber = (num) => {
  number.value = num
  emit('updateInput', num)
}

</script>

<template>
  <Modal size="small" :is-open="settingModal" @close-modal="closeModal">
    <template v-slot:title>Numéro de bipeur</template>
    <template v-slot:body>
      <div class="p-4 mt-8">
        <div class="grid grid-cols-5 gap-6">
          <button
            v-for="i in 20"
            class="border border-main rounded-md h-12 transition-all hover:bg-main hover:text-white"
            :class="number === i ? 'bg-main text-white' : 'text-main'"
            @click="setNumber(i)"
          >
            {{ i }}
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>