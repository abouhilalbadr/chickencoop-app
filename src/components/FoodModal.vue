<script setup>
import { ref, computed } from "vue"
import Modal from "./Modal.vue";
import Sauce from "./Sauce.vue";
import Extra from "./Extra.vue";
const order = ref({})
const show = ref('sauce')
const plusPrice = ref(0)
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
  order.value.name = props.currentFood.name
  order.value.image = props.currentFood.image
  order.value.price = currentPrice.value + plusPrice.value
  order.value.productId = props.currentFood.id
  order.value.mode = 'make-normal'
  emit('sendData', order.value)
  emit('foodClose')
  show.value = 'sauce'
  plusPrice.value = 0
  order.value = {}
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
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 py-4 items-center">
        <img class="rounded-md" :src="currentFood.image" :alt="currentFood.name">
        <div class="lg:col-span-3 flex flex-col gap-8 p-4">
          <h2 class="text-3xl text-black font-bold font-bree-serif">{{ currentFood.name }}</h2>
          <span class="text-5xl font-bree-serif text-main">{{ currentPrice + plusPrice }} <span class="text-lg">DH</span></span>
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