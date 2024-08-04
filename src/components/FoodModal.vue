<script setup>
import { ref, computed } from "vue"
import Modal from "./Modal.vue";
import Sauce from "./Sauce.vue";
import Extra from "./Extra.vue";

import { useStore } from "../store"

const store = useStore()

const order = ref({})
const show = ref('sauce')
const size = ref('m')
const plusPrice = ref(0)
const number = ref(1)
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
  if (props.currentFood.categoryId == 11) {
    order.value.size = size.value
  }
  order.value.price = currentPrice.value + plusPrice.value
  order.value.productId = props.currentFood.id
  order.value.mode = 'make-normal'
  order.value.number = number.value
  order.value.index = number.value > 1 ? store.unique : 0
  // order.value.size = size.value || null
  emit('sendData', order.value)
  emit('foodClose')
  show.value = 'sauce'
  plusPrice.value = 0
  number.value = 1
  size.value = 'm'
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

const checkSaucesExtras = computed(() => {
  const newData = JSON.parse(props.currentFood.attributes)
  if (!newData.includes('Les sauces')) {
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
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 py-4 items-center">
        <img class="rounded-md" :src="currentFood.image" :alt="currentFood.name">
        <div class="lg:col-span-4 flex flex-col gap-6 p-2">
          <h2 class="text-2xl text-black font-bold font-bree-serif">{{ currentFood.name }}</h2>
          <span class="text-4xl font-bree-serif text-main">{{ (currentPrice + plusPrice) * number }} <span class="text-lg">DH</span></span>
          <div class="inline-flex">
            <div class="select-none border border-border py-1 px-3 cursor-pointer bg-border hover:bg-main hover:text-white rounded-l-md" @click="decrease">
              -
            </div>

            <input class="border border-border p-1 text-center outline-none w-20" type="text" v-model="number" name="quantity" />

            <div class="select-none border border-border py-1 px-3 cursor-pointer bg-border hover:bg-main hover:text-white rounded-r-md" @click="increase">
              +
            </div>
          </div>
          <div v-if="currentFood.categoryId == 11">
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
          </div>
          <div v-if="checkSaucesExtras && checkSaucesExtras.length > 0" class="flex flex-col gap-4">
            <div class="my-4 flex items-center gap-8">
              <h4
                v-if="checkSaucesExtras.includes('Les sauces')"
                class="relative text-2xl cursor-pointer"
                :class="show === 'sauce' && 'title text-main'"
                @click="show = 'sauce'"
              >
                Les sauces
              </h4>
              <h4
                v-if="checkSaucesExtras.includes('Les extras')"
                class="relative text-2xl cursor-pointer"
                :class="show === 'extra' && 'title text-main'"
                @click="show = 'extra'"
              >
                Les extras
              </h4>
            </div>
            <sauce v-show="(checkSaucesExtras.includes('Les sauces') && show === 'sauce')" :settings="settings" @save-sauces="addSauces" />
            <extra v-show="(checkSaucesExtras.includes('Les extras') && show === 'extra')" :settings="settings" @save-extras="addExtras" />
          </div>
        </div>
      </div>
    </template>
    <template v-slot:buttons>
      <div class="grid grid-cols-2 gap-8">
        <button
          @click="closeModal"
          class="border border-main text-main rounded-md h-14 font-bold"
          >
          Fermer
        </button>
        <button
          @click="saveData"
          class="bg-main rounded-md h-14 text-white font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ajouter au panier
        </button>
      </div>
    </template>
  </Modal>
</template>
