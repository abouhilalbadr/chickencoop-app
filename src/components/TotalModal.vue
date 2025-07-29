<script setup>
import Modal from "./Modal.vue";

const props = defineProps(['totalModal', 'total'])
const emit = defineEmits(['totalClose'])

const closeModal = () => {
  emit('totalClose')
}

</script>

<template>
  <Modal size="small" :is-open="totalModal" @close-modal="closeModal">
    <template v-slot:title>Total du caisse</template>
    <template v-slot:body>
      <div class="flex flex-col gap-4 my-8">
        <div class="flex justify-between items-center gap-2 font-bree-serif">
          <p class="text-lg">Total des commandes</p>
          <p class="text-xl text-main">{{ total.orders }} commandes</p>
        </div>
        <div class="flex justify-between items-center gap-2 font-bree-serif">
          <p class="text-lg">Total de jour</p>
          <p class="text-xl text-main">{{ total.total }} DH</p>
        </div>
        <div class="flex justify-between items-center gap-2 font-bree-serif">
          <p class="text-lg">Caisse du dernier jour</p>
          <p class="text-xl text-main">{{ total.newC }} DH</p>
        </div>
        <div class="flex justify-between items-center gap-2 font-bree-serif">
          <p class="text-lg">Total du caisse</p>
          <p class="text-xl text-main">{{ total.newC + total.total }} DH</p>
        </div>
      </div>
    </template>
  </Modal>
</template>