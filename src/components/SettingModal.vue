<script setup>
import { isIPv4 } from 'is-ip';

import Modal from "./Modal.vue";

import { useStore } from "../store"

const store = useStore()

const props = defineProps(['settingModal'])
const emit = defineEmits(['settingsClose'])

const closeModal = () => {
  emit('settingsClose')
}

const updateIp = (event) => {
  if (isIPv4(event.target.value)) {
    store.updatePrinterIp(event.target.value)
  }
}

const updatePort = (event) => {
  if (event.target.value.length === 4) {
    store.updatePrinterPort(event.target.value)
  }
}

</script>

<template>
  <Modal size="small" :is-open="settingModal" @close-modal="closeModal">
    <template v-slot:title>Paramètres de l'application</template>
    <template v-slot:body>
      <div class="p-4">
        <div class="flex flex-col gap-8">
          <div class="flex flex-col gap-1">
            <label class="text-sm" for="printerip">Adresse IP de l'imprimante</label>
            <input
              type="text" id="printerip"
              class="outline-none w-full px-4 py-2 border border-border rounded-md"
              placeholder="192.168.1.1"
              :value="store.settings.printer.ip"
              @input="updateIp"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm" for="printerport">Port d'imprimante</label>
            <input
              type="text" id="printerport"
              class="outline-none w-full px-4 py-2 border border-border rounded-md"
              placeholder="8008"
              :value="store.settings.printer.port"
              @input="updatePort"
            />
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked="store.settings.money" @click="store.toggleMoney" class="sr-only peer">
            <div class="w-14 h-8 bg-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-border after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-main"></div>
            <span class="ml-2 font-medium text-black">Afficher les icônes d'argent</span>
          </label>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked="store.settings.percentage" @click="store.togglePercent" class="sr-only peer">
            <div class="w-14 h-8 bg-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-border after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-main"></div>
            <span class="ml-2 font-medium text-black">Afficher les pourcentages de la promotion</span>
          </label>
        </div>
      </div>
    </template>
  </Modal>
</template>