<script setup>
import Modal from "./Modal.vue";
import Money from './MoneyAll.vue';

const props = defineProps(['settingModal'])
const emit = defineEmits(['settingsClose'])

const closeModal = () => {
  emit('settingsClose')
}
</script>
<template>
  <Modal size="small" :is-open="settingModal" @close-modal="closeModal">
    <template v-slot:title>Calculateur de caisse</template>
    <template v-slot:body>
      <money />
    </template>
  </Modal>
</template>
