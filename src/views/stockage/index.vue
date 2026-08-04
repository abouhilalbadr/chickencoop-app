<script setup>
import { ref } from "vue"
import Header from "../../components/Header.vue";
import Modal from "../../components/Modal.vue";
import ChargeMain from "../../components/charge/Main.vue";
import ChargeAdd from "../../components/charge/Add.vue";
import CalcAdd from "../../components/calc/Add.vue";
import AppButton from "../../components/ui/AppButton.vue";
import CaisseIcon from "../../components/icons/Caisse.vue";
import CartIcon from "../../components/icons/Cart.vue";

import { useStore } from "../../store"

const store = useStore()

const page = ref('main')
const chargeModal = ref(false)
// Bumped after a charge is saved: it remounts the table, which refetches
const chargesKey = ref(0)

// The two things this post does. Adding a charge is not a third place to be —
// it is a dialog over the list, the way the back office does it.
const TABS = [
  { key: 'main', label: "Charges du jour", icon: CartIcon },
  { key: 'add-calc', label: "Caisse d'aujourd'hui", icon: CaisseIcon },
]

const onChargeSaved = () => {
  chargeModal.value = false
  chargesKey.value += 1
}
</script>

<template>
  <Header page="stockage" />

  <Modal size="small" :is-open="chargeModal" @close-modal="chargeModal = false">
    <template v-slot:title>Ajouter une charge</template>
    <template v-slot:body>
      <ChargeAdd :token="store.user.accessToken" @saved="onChargeSaved" />
    </template>
  </Modal>

  <div class="p-4 flex flex-col gap-4">
    <nav class="flex flex-wrap gap-2">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        class="h-12 px-5 rounded-lg border flex items-center gap-2.5 transition-colors"
        :class="page === tab.key
          ? 'bg-main border-main text-white'
          : 'bg-white border-border text-black hover:bg-gray-light'"
        @click="page = tab.key"
      >
        <component :is="tab.icon" class="h-6" :class="page === tab.key ? 'text-white fill-white' : 'text-main fill-main'" />
        <span>{{ tab.label }}</span>
      </button>
    </nav>

    <section class="bg-white border border-black/[.07] rounded-xl shadow-sm overflow-hidden">
      <header class="px-4 h-16 border-b border-border flex items-center gap-4">
        <h1 class="font-bree-serif text-[17px]">
          {{ TABS.find(t => t.key === page)?.label }}
        </h1>
        <!-- The action belongs to the table it adds to, so it sits on it -->
        <AppButton v-if="page === 'main'" class="ml-auto" variant="primary" @click="chargeModal = true">
          Ajouter une charge
        </AppButton>
      </header>
      <div class="p-4">
        <ChargeMain v-if="page === 'main'" :key="chargesKey" :token="store.user.accessToken" />
        <CalcAdd v-else-if="page === 'add-calc'" :token="store.user.accessToken" />
      </div>
    </section>
  </div>
</template>
