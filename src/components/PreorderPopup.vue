<script setup>
import { computed, ref } from "vue"

import { useStore } from "../store"
import { jsonProducts } from "../preorderProducts"
import Modal from "./Modal.vue"
import Amount from "./ui/Money.vue"
import AppButton from "./ui/AppButton.vue"

/**
 * A website order stays on screen until the cashier accepts it or puts it
 * aside. The beep and the 3-second toast were easy to miss in a rush, and the
 * customer now watches "Commande envoyée" on their phone until the till
 * accepts it. No repeated sound: the restaurant is noisy enough.
 */
defineProps({
  // An order already in the cart: accepting would mix the two
  cartBusy: { type: Boolean, default: false },
})
const emit = defineEmits(['accept'])

const store = useStore()

// Put aside with "Plus tard": still in the Précommandes drawer, never shown here again
const later = ref(new Set())

const waiting = computed(() =>
  [...store.preorders]
    .filter((order) => !later.value.has(order.id))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
)
const current = computed(() => waiting.value[0])

const TYPES = { SUR_PLACE: 'Sur place', A_EMPORTER: 'À emporter', LIVRAISON: 'Livraison' }

const putAside = () => {
  later.value = new Set([...later.value, current.value.id])
}

const accept = () => {
  emit('accept', current.value)
}
</script>

<template>
  <!-- Only the two buttons close it: a tap beside the card is not an answer -->
  <Modal size="small" :is-open="!!current" @close-modal="() => {}">
    <template v-slot:title>
      <div class="flex items-center justify-between gap-3">
        <span>Nouvelle commande du site</span>
        <span
          v-if="waiting.length > 1"
          class="text-[13px] font-bold text-black/55 tabular-nums"
        >
          1 sur {{ waiting.length }}
        </span>
      </div>
    </template>
    <template v-if="current" v-slot:body>
      <div class="flex flex-col gap-4">
        <div class="flex justify-between items-start gap-4">
          <div class="flex flex-col gap-0.5">
            <span class="font-medium text-lg">{{ current.clientName }}</span>
            <span class="text-[13px] text-black/55">{{ current.clientPhone }}</span>
          </div>
          <span class="shrink-0 rounded-full bg-main/10 text-main px-3 py-1 text-[13px] font-bold">
            {{ TYPES[current.type] || current.type }}
          </span>
        </div>

        <div class="border-y border-border divide-y divide-border">
          <p v-if="jsonProducts(current.products).length === 0" class="py-3 text-[13px] text-black/55">
            Détail illisible — rappelez le client au {{ current.clientPhone }}
          </p>
          <div v-for="(product, j) in jsonProducts(current.products)" :key="j" class="flex items-start gap-3 py-2.5">
            <div class="flex flex-col gap-0.5 flex-1 min-w-0">
              <h4 class="font-bree-serif text-[15px] leading-tight">
                <span v-if="product.number > 1" class="text-main">{{ product.number }}×</span>
                {{ product.name }}
                <span v-if="product.size" class="uppercase text-main">({{ product.size }})</span>
              </h4>
              <div v-if="product.viandes?.length || product.sauces?.length || product.extras?.length" class="flex flex-col text-black/55 text-xs">
                <span v-if="product.viandes?.length">Viandes : {{ product.viandes.join(', ') }}</span>
                <span v-if="product.sauces?.length">Sauces : {{ product.sauces.join(', ') }}</span>
                <span v-if="product.extras?.length">Extras : {{ product.extras.join(', ') }}</span>
              </div>
            </div>
            <Amount :value="product.price" :decimals="false" />
          </div>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-black/55">Total</span>
          <Amount :value="current.total" size="total" tone="brand" :decimals="false" />
        </div>
      </div>
    </template>
    <template v-slot:buttons>
      <div class="flex flex-col gap-2">
        <p v-if="cartBusy" class="text-[13px] text-black/55">
          Une commande est en cours dans la caisse : terminez-la ou videz-la avant d'accepter.
        </p>
        <div class="flex justify-between gap-3">
          <AppButton variant="secondary" size="lg" @click="putAside">Plus tard</AppButton>
          <AppButton variant="primary" size="lg" :disabled="cartBusy" @click="accept">Accepter</AppButton>
        </div>
      </div>
    </template>
  </Modal>
</template>
