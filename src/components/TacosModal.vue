<script setup>
import { ref, reactive, computed } from "vue"
import Modal from "./Modal.vue";
import Stepper from "./Stepper.vue";
import Viande from "./Viande.vue";
import Sauce from "./Sauce.vue";
import Extra from "./Extra.vue";

import { useStore } from "../store"

const store = useStore()

const props = defineProps(['tacosModal', 'step', 'settings', 'hidePrev', 'hideNext'])
const emit = defineEmits(['tacosClose', 'changeStep', 'sendData'])

const make = reactive(JSON.parse(props.settings[0].make || ''))

const plusPrice = ref(0)
const size = ref('m')
const order = ref({})
const note = ref('')

const addSize = (s) => {
  size.value = s
}

const closeTacosModal = () => {
  emit('tacosClose')
  emit('changeStep', 'reset')
  size.value = 'm'
  plusPrice.value = 0
}

const nextStep = () => {
  emit('changeStep', 'next')
}

const prevStep = () => {
  emit('changeStep', 'prev')
}

const addSauces = ({ sauces, price, operation }) => {
  order.value.sauces = sauces
  const make = JSON.parse(props.settings[0]?.make)
  if (operation === 'plus' && sauces.length > parseInt(make[size.value].sauces))
    plusPrice.value += parseInt(price)
  if (operation === 'minus' && sauces.length >= parseInt(make[size.value].sauces))
    plusPrice.value -= parseInt(price)
}
const addExtras = ({ extras, price, operation }) => {
  order.value.extras = extras
  if (operation === 'plus')
    plusPrice.value += parseInt(price)
  else
    plusPrice.value -= parseInt(price)
}
const addViandes = ({ viandes }) => {
  order.value.viandes = viandes
}

const saveData = () => {
  order.value.size = size.value
  order.value.name = "Tacos Composer"
  order.value.image = store.baseUrl + "/public/tacos-composez.jpg"
  order.value.price = (store.glovo ? parseInt(make[size.value].priceGlovo) : parseInt(make[size.value].price)) + plusPrice.value
  order.value.productId = 0
  order.value.mode = 'make-tacos'
  order.value.note = note.value.trim()
  emit('sendData', order.value)
  emit('tacosClose')
  size.value = 'm'
  plusPrice.value = 0
  note.value = ''
  order.value = {}
  emit('changeStep', 'reset')
}

</script>
<template>
  <Modal :is-open="tacosModal" @close-modal="closeTacosModal">
    <template v-slot:title>Composer votre Tacos</template>
    <template v-slot:body>
      <div class="max-h-[400px] h-[300px] overflow-y-scroll overflow-x-hidden relative">
        <Stepper :is-showing="step === 1">
          <template v-slot:stepBody>
            <h4 class="relative text-2xl title text-main">Les Tailles</h4>
            <div class="flex gap-4 my-8">
              <button class="w-20 h-10 rounded-md border border-main text-xl"
                :class="size === 'm' ? 'bg-main text-white' : 'text-main'" @click="addSize('m')">
                M
              </button>
              <button class="w-20 h-10 rounded-md border border-main text-xl"
                :class="size === 'l' ? 'bg-main text-white' : 'text-main'" @click="addSize('l')">
                L
              </button>
              <button class="w-20 h-10 rounded-md border border-main text-xl"
                :class="size === 'xl' ? 'bg-main text-white' : 'text-main'" @click="addSize('xl')">
                XL
              </button>
              <button class="w-20 h-10 rounded-md border border-main text-xl"
                :class="size === 'xxl' ? 'bg-main text-white' : 'text-main'" @click="addSize('xxl')">
                XXL
              </button>
              <button class="w-20 h-10 rounded-md border border-main text-xl"
                :class="size === 'xxxl' ? 'bg-main text-white' : 'text-main'" @click="addSize('xxxl')">
                XXXL
              </button>
              <button class="w-32 h-10 rounded-md border border-main text-xl"
                :class="size === 'gourmet' ? 'bg-main text-white' : 'text-main'" @click="addSize('gourmet')">
                GOURMET
              </button>
              <button class="w-32 h-10 rounded-md border border-main text-xl"
                :class="size === 'diavolo' ? 'bg-main text-white' : 'text-main'" @click="addSize('diavolo')">
                Le Diavolo
              </button>
              <button class="w-32 h-10 rounded-md border border-main text-xl"
                :class="size === 'gold' ? 'bg-main text-white' : 'text-main'" @click="addSize('gold')">
                Le Gold
              </button>
              <button class="w-32 h-10 rounded-md border border-main text-xl"
                :class="size === 'fromy' ? 'bg-main text-white' : 'text-main'" @click="addSize('fromy')">
                Le 4 Fromy
              </button>
            </div>
            <h4 class="relative text-2xl title text-main">Les viandes</h4>
            <viande class="my-8" :max="make[size].size" :settings="settings" @save-viandes="addViandes" />
          </template>
        </Stepper>
        <Stepper :is-showing="step === 2">
          <template v-slot:stepBody>
            <h4 class="relative text-2xl title text-main">Les Sauces</h4>
            <sauce class="my-8" :settings="settings" @save-sauces="addSauces" />
            <h4 class="relative text-2xl title text-main">Les Extras</h4>
            <extra class="my-8" :settings="settings" @save-extras="addExtras" />
            <h4 class="relative text-2xl title text-main">Note</h4>
            <textarea
              v-model="note"
              rows="2"
              placeholder="Ex: sans oignon, allergie..."
              class="my-8 w-full border border-border rounded-md p-2 text-lg text-main outline-none resize-none"
            ></textarea>
          </template>
        </Stepper>
      </div>
    </template>
    <template v-slot:buttons>
      <div class="mb-8 mx-2 flex items-center gap-2 text-2xl font-bold font-bree-serif">
        <span>Total:</span>
        <span class="text-main">{{ (store.glovo ? parseInt(make[size].priceGlovo) : parseInt(make[size].price)) +
          plusPrice }} DH </span>
      </div>
      <div class="grid grid-cols-2 gap-8">
        <button @click="prevStep"
          class="border border-main text-main rounded-md h-16 font-bold disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="hidePrev">
          Précédent
        </button>
        <button v-if="step < 2" @click="nextStep"
          class="bg-main rounded-md h-16 text-white font-bold disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="hideNext">
          Suivant
        </button>
        <button v-else @click="saveData" class="bg-main rounded-md h-16 text-white font-bold">
          Ajouter au panier
        </button>
      </div>
    </template>
  </Modal>
</template>
