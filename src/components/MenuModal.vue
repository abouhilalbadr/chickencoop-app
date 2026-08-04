<script setup>
import { ref, computed } from "vue"
import Modal from "./Modal.vue";
import Sauce from "./Sauce.vue";
import Extra from "./Extra.vue";
import Amount from "./ui/Money.vue";
import AppButton from "./ui/AppButton.vue";

import { useStore } from "../store"

const store = useStore()

const order = ref({})
const show = ref('sauce')
const plusPrice = ref(0)
const number = ref(1)
const note = ref('')
const props = defineProps(['currentFood', 'foodModal', 'settings'])
const emit = defineEmits(['sendData', 'foodClose'])
const currentPrice = computed(() => store.glovo ? props.currentFood.priceGlovo : props.currentFood.price)

const closeModal = () => {
  emit('foodClose')
  plusPrice.value = 0
}

const addSauces = ({sauces, price, operation}) => {
  order.value.sauces = sauces
  if (operation === 'plus' && sauces.length > 2)
    plusPrice.value += parseInt(price)
  if (operation === 'minus' && sauces.length >= 2)
    plusPrice.value -= parseInt(price)
}
const addExtras = ({extras, price, operation}) => {
  order.value.extras = extras
  if (operation === 'plus')
    plusPrice.value += parseInt(price)
  else
    plusPrice.value -= parseInt(price)
}
const saveData = () => {
  store.setUnique()
  order.value.name = props.currentFood.name
  order.value.image = props.currentFood.image
  order.value.price = currentPrice.value + plusPrice.value
  // `menuId` is what marks this line as a menu. `productId` keeps the same value
  // it always had — it is the cart's identity key — but it holds a Menu id, which
  // collides with the product that shares that id once the line reaches a report.
  order.value.productId = props.currentFood.id
  order.value.menuId = props.currentFood.id
  order.value.mode = 'make-menu'
  order.value.number = number.value
  order.value.index = number.value > 1 ? store.unique : 0
  order.value.note = note.value.trim()
  emit('sendData', order.value)
  emit('foodClose')
  show.value = 'sauce'
  plusPrice.value = 0
  number.value = 1
  note.value = ''
  order.value = {}
}

const increase = () => {
  number.value++;
}
const decrease = () => {
  if (number.value > 1) {
    number.value--;
  }
}
</script>

<template>
  <Modal :is-open="foodModal" @close-modal="closeModal">
    <template v-slot:body>
      <div class="flex flex-col gap-6">
        <!-- Identity row; the options sit under it at full width -->
        <div class="flex flex-wrap items-center gap-5">
          <img
            class="w-40 h-32 shrink-0 rounded-xl border border-border bg-gray-light p-1.5 object-contain"
            :src="currentFood.image"
            :alt="currentFood.name"
          >
          <div class="flex flex-col gap-4 min-w-0">
            <h2 class="font-bree-serif text-2xl">{{ currentFood.name }}</h2>
            <div class="inline-flex items-center self-start rounded-lg border border-border overflow-hidden">
              <button class="w-12 h-12 text-2xl bg-gray-light transition-colors hover:bg-main hover:text-white" @click="decrease">−</button>
              <input class="w-16 h-12 text-center text-lg tabular-nums outline-none border-x border-border" type="text" v-model="number" name="quantity" />
              <button class="w-12 h-12 text-2xl bg-gray-light transition-colors hover:bg-main hover:text-white" @click="increase">+</button>
            </div>
          </div>
          <Amount class="ml-auto" :value="(currentPrice + plusPrice) * number" size="hero" tone="brand" :decimals="false" />
        </div>

        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-6 border-b border-border">
              <button
                class="h-11 -mb-px border-b-2 transition-colors"
                :class="show === 'sauce' ? 'border-main text-main font-medium' : 'border-transparent text-black/55 hover:text-black'"
                @click="show = 'sauce'"
              >
                Les sauces
              </button>
              <button
                class="h-11 -mb-px border-b-2 transition-colors"
                :class="show === 'extra' ? 'border-main text-main font-medium' : 'border-transparent text-black/55 hover:text-black'"
                @click="show = 'extra'"
              >
                Les extras
              </button>
            </div>
            <sauce v-show="show === 'sauce'" :settings="settings" @save-sauces="addSauces" />
            <extra v-show="show === 'extra'" :settings="settings" @save-extras="addExtras" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="menu-note" class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Note pour la cuisine</label>
            <textarea
              id="menu-note"
              v-model="note"
              rows="2"
              placeholder="Ex : sans oignon, allergie…"
              class="border border-border rounded-lg p-3 text-base outline-none resize-none
                focus:border-main focus:ring-[3px] focus:ring-main/[.15]"
            ></textarea>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:buttons>
      <div class="grid grid-cols-2 gap-4">
        <AppButton variant="secondary" size="lg" block @click="closeModal">Fermer</AppButton>
        <AppButton variant="primary" size="lg" block @click="saveData">Ajouter au panier</AppButton>
      </div>
    </template>
  </Modal>
</template>
