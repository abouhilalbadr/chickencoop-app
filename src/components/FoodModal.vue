<script setup>
import { ref, computed } from "vue"
import Modal from "./Modal.vue";
import Sauce from "./Sauce.vue";
import Extra from "./Extra.vue";
import Viande from "./Viande.vue";
import Amount from "./ui/Money.vue";
import AppButton from "./ui/AppButton.vue";

import { useStore } from "../store"

const store = useStore()

const order = ref({})
const show = ref('sauce')
const size = ref('m')
const plusPrice = ref(0)
const number = ref(1)
const note = ref('')
const props = defineProps(['currentFood', 'foodModal', 'settings'])
const emit = defineEmits(['sendData', 'foodClose'])
const currentPrice = computed(() => store.glovo ? props.currentFood.priceGlovo : props.currentFood.price)
const closeModal = () => {
  emit('foodClose')
  plusPrice.value = 0
  size.value = 'm'
}
const addSize = (s) => {
  size.value = s
  plusPrice.value = 0
  if (s === 'l') {
    plusPrice.value += (props.currentFood.name === 'Pizza Margherita') ? 7 : 10
  }
}
const addSauces = ({sauces, price, operation}) => {
  order.value.sauces = sauces
  if (operation === 'plus' && sauces.length > 2)
    plusPrice.value += parseInt(price)
  if (operation === 'minus' && sauces.length >= 2)
    plusPrice.value -= parseInt(price)
}
const addViandes = ({viandes}) => {
  order.value.viandes = viandes
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
  // if (props.currentFood.categoryId == 11) {
  //   order.value.size = size.value
  // }
  order.value.price = currentPrice.value + plusPrice.value
  order.value.productId = props.currentFood.id
  order.value.mode = 'make-normal'
  order.value.number = number.value
  order.value.index = number.value > 1 ? store.unique : 0
  order.value.note = note.value.trim()
  emit('sendData', order.value)
  emit('foodClose')
  show.value = 'sauce'
  plusPrice.value = 0
  number.value = 1
  size.value = 'm'
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

// Per-product meat picker, off by default on every existing product
const hasViandes = computed(() => Boolean(props.currentFood.viandes))
const viandesMax = computed(() => parseInt(props.currentFood.viandesMax) || 1)

const checkSaucesExtras = computed(() => {
  const newData = JSON.parse(props.currentFood.attributes)
  if (hasViandes.value) {
    show.value = 'viande'
  } else if (!newData.includes('Les sauces')) {
    show.value = 'extra'
  } else {
    show.value = 'sauce'
  }
  return newData
})

</script>

<template>
  <Modal :is-open="foodModal" @close-modal="closeModal">
    <template v-slot:body>
      <div class="flex flex-col gap-6">
        <!-- Identity row: photo, name, price, quantity. The options go under it
             at full width — sauce chips wrap badly in a narrow column. -->
        <div class="flex flex-wrap items-center gap-5">
          <img
            class="w-40 h-32 shrink-0 rounded-xl border border-border bg-gray-light p-1.5 object-contain"
            :src="currentFood.image"
            :alt="currentFood.name"
          >
          <div class="flex flex-col gap-4 min-w-0">
            <h2 class="font-bree-serif text-2xl">{{ currentFood.name }}</h2>
            <!-- Quantity: two 48px targets around the figure, not two text links -->
            <div class="inline-flex items-center self-start rounded-lg border border-border overflow-hidden">
              <button class="w-12 h-12 text-2xl bg-gray-light transition-colors hover:bg-main hover:text-white" @click="decrease">−</button>
              <input class="w-16 h-12 text-center text-lg tabular-nums outline-none border-x border-border" type="text" v-model="number" name="quantity" />
              <button class="w-12 h-12 text-2xl bg-gray-light transition-colors hover:bg-main hover:text-white" @click="increase">+</button>
            </div>
          </div>
          <Amount class="ml-auto" :value="(currentPrice + plusPrice) * number" size="hero" tone="brand" :decimals="false" />
        </div>

        <div class="flex flex-col gap-5">
          <!-- <div v-if="currentFood.categoryId == 11">
            <h4 class="relative text-xl title text-main mb-6">Les Tailles</h4>
            <div class="flex gap-4">
              <button
                class="w-20 h-12 rounded-md border border-main text-xl"
                :class="size === 'm' ? 'bg-main text-white' : 'text-main'"
                @click="addSize('m')"
              >
                M
              </button>
              <button
                class="w-20 h-12 rounded-md border border-main text-xl"
                :class="size === 'l' ? 'bg-main text-white' : 'text-main'"
                @click="addSize('l')"
              >
                L
              </button>
            </div>
          </div> -->
          <!-- Options. Tabs are a row of tabs, not three headings of the same
               size competing with the product name. -->
          <div v-if="(checkSaucesExtras && checkSaucesExtras.length > 0) || hasViandes" class="flex flex-col gap-4">
            <div class="flex items-center gap-6 border-b border-border">
              <button
                v-if="hasViandes"
                class="h-11 -mb-px border-b-2 transition-colors"
                :class="show === 'viande' ? 'border-main text-main font-medium' : 'border-transparent text-black/55 hover:text-black'"
                @click="show = 'viande'"
              >
                Les viandes
              </button>
              <button
                v-if="checkSaucesExtras.includes('Les sauces')"
                class="h-11 -mb-px border-b-2 transition-colors"
                :class="show === 'sauce' ? 'border-main text-main font-medium' : 'border-transparent text-black/55 hover:text-black'"
                @click="show = 'sauce'"
              >
                Les sauces
              </button>
              <button
                v-if="checkSaucesExtras.includes('Les extras')"
                class="h-11 -mb-px border-b-2 transition-colors"
                :class="show === 'extra' ? 'border-main text-main font-medium' : 'border-transparent text-black/55 hover:text-black'"
                @click="show = 'extra'"
              >
                Les extras
              </button>
            </div>
            <div v-show="hasViandes && show === 'viande'" class="flex flex-col gap-2.5">
              <span class="text-[13px] text-black/55">Sélectionnez un maximum de {{ viandesMax }} viande(s)</span>
              <viande :settings="settings" :max="viandesMax" @save-viandes="addViandes" />
            </div>
            <sauce v-show="(checkSaucesExtras.includes('Les sauces') && show === 'sauce')" :settings="settings" @save-sauces="addSauces" />
            <extra v-show="(checkSaucesExtras.includes('Les extras') && show === 'extra')" :settings="settings" @save-extras="addExtras" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="note" class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Note pour la cuisine</label>
            <textarea
              id="note"
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
