<script setup>
import Modal from "./Modal.vue";

import { useStore } from "../store"

const store = useStore()

defineProps(['settingModal'])
const emit = defineEmits(['settingsClose'])

const closeModal = () => {
  emit('settingsClose')
}

const options = [
  {
    key: 'money',
    label: "Afficher les icônes d'argent",
    hint: 'Les billets remplacent le pavé numérique pour saisir le montant payé',
    toggle: () => store.toggleMoney(),
  },
  {
    key: 'percentage',
    label: 'Afficher les pourcentages de la promotion',
    hint: 'Ajoute la ligne Promotion et ses raccourcis au panier',
    toggle: () => store.togglePercent(),
  },
]
</script>

<template>
  <Modal size="small" :is-open="settingModal" @close-modal="closeModal">
    <template v-slot:title>Paramètres de l'application</template>
    <template v-slot:body>
      <div class="flex flex-col">
        <label
          v-for="option in options"
          :key="option.key"
          class="flex items-start gap-4 py-4 border-b last:border-none border-border cursor-pointer"
        >
          <input type="checkbox" :checked="store.settings[option.key]" @click="option.toggle()" class="sr-only peer">
          <div
            class="mt-0.5 w-14 h-8 shrink-0 bg-black/15 rounded-full relative transition-colors peer-checked:bg-main
              after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6
              after:transition-transform peer-checked:after:translate-x-6"
          ></div>
          <div>
            <span class="font-medium">{{ option.label }}</span>
            <p class="text-[13px] text-black/55 mt-0.5">{{ option.hint }}</p>
          </div>
        </label>
      </div>
    </template>
  </Modal>
</template>
