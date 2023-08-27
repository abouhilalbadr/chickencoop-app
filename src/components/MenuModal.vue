<script setup>
import { ref, computed } from "vue"
import Modal from "./Modal.vue";
import Sauce from "./Sauce.vue";
import Extra from "./Extra.vue";

import { useStore } from "../store"

const store = useStore()

const order = ref({})
const show = ref('sauce')
const plusPrice = ref(0)
const number = ref(1)
const props = defineProps(['currentFood', 'foodModal', 'settings'])
const emit = defineEmits(['sendData', 'foodClose'])
const currentPrice = computed(() => props.currentFood.price)

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
  order.value.productId = props.currentFood.id
  order.value.mode = 'make-tacos'
  order.value.number = number.value
  order.value.index = number.value > 1 ? store.unique : 0
  emit('sendData', order.value)
  emit('foodClose')
  show.value = 'sauce'
  plusPrice.value = 0
  number.value = 1
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
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 py-4 items-center">
        <img class="rounded-md" :src="currentFood.image" :alt="currentFood.name">
        <div class="lg:col-span-3 flex flex-col gap-8 p-4">
          <h2 class="text-3xl text-black font-bold font-bree-serif">{{ currentFood.name }}</h2>
          <span class="text-5xl font-bree-serif text-main">{{ (currentPrice + plusPrice) * number }} <span class="text-lg">DH</span></span>
          <div class="inline-flex">
            <div class="select-none border border-border py-2 px-4 cursor-pointer bg-border hover:bg-main hover:text-white rounded-l-md" @click="decrease">
              -
            </div>

            <input class="border border-border p-2 text-center outline-none w-20" type="text" v-model="number" name="quantity" />

            <div class="select-none border border-border py-2 px-4 cursor-pointer bg-border hover:bg-main hover:text-white rounded-r-md" @click="increase">
              +
            </div>
          </div>
          <div class="flex flex-col gap-4">
            <div class="my-4 flex items-center gap-8">
              <h4
                class="relative text-2xl cursor-pointer"
                :class="show === 'sauce' && 'title text-main'"
                @click="show = 'sauce'"
              >
                Les sauces
              </h4>
              <h4
                class="relative text-2xl cursor-pointer"
                :class="show === 'extra' && 'title text-main'"
                @click="show = 'extra'"
              >
                Les extras
              </h4>
            </div>
            <sauce v-show="show === 'sauce'" :settings="settings" @save-sauces="addSauces" />
            <extra v-show="show === 'extra'" :settings="settings" @save-extras="addExtras" />
          </div>
        </div>
      </div>
    </template>
    <template v-slot:buttons>
      <div class="grid grid-cols-2 gap-8">
        <button
          @click="closeModal"
          class="border border-main text-main rounded-md h-16 font-bold"
          >
          Fermer
        </button>
        <button
          @click="saveData"
          class="bg-main rounded-md h-16 text-white font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ajouter au panier
        </button>
      </div>
    </template>
  </Modal>
</template>
