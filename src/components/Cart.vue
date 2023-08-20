<script setup>
  import { ref, computed } from "vue"
  import axios from 'axios'
  import Swal from 'sweetalert2'

  import { useStore } from "../store"

  import Shopping from './icons/Shopping.vue';
  import CartItem from './CartItem.vue';
  import Calc from './Calc.vue'
  import Money from './Money.vue'
  import Percentage from './Percentage.vue'
  import NumberModal from './NumberModal.vue'
  import PrinterMsg from './PrinterMsg.vue'
  import PrintItem from "./PrintItem.vue";


  const store = useStore()

  const pay = ref('')
  const percent = ref(0)
  const type = ref('SUR_PLACE')
  const numModal = ref(false)
  const loading = ref(false)
  // Epson Printer
  const bipeur = ref(0);

  const props = defineProps(['cart'])
  const emit = defineEmits(['cartDel'])

  const subTotal = computed(() => {
    let total = 0
    props.cart.map((item) => {
      total += item.price
    })
    return total
  })
  const percentTotal = computed(() => {
    return (subTotal.value * percent.value) / 100
  })
  const showPromo = computed(() => {
    resetPromo()
    if (store.settings.percentage) {
      return true
    }
    return false
  })

  const types = [
    { name: 'Sur place', value: 'SUR_PLACE' },
    { name: 'À emporter', value: 'A_EMPORTER' },
    { name: 'Livraison', value: 'LIVRAISON' },
    { name: 'Gratuit', value: 'GRATUIT' },
  ]

  const resetPay = () => {
    pay.value = ''
  }
  const setNum = (num) => {
    if ((typeof pay.value) === 'number') {
      pay.value = (pay.value === 0) ? '' : pay.value.toString()
    }
    if (num === 'x') {
      pay.value = pay.value.slice(0, -1);
    }
    else {
      pay.value += num
    }
  }
  const addNum = (num) => {
    if ((typeof pay.value) === 'string') {
      pay.value = parseInt(pay.value || 0)
    }
    pay.value = pay.value + num
  }
  const removeItem = (i) => {
    emit('cartDel', i)
  }
  const setPromo = (num) => {
    percent.value = num
  }
  const resetPromo = () => {
    percent.value = 0
  }
  const showStep = () => {
    numModal.value = true
  }
  const modalClose = () => {
    numModal.value = false
  }

  const sendOrder = async (e) => {
    numModal.value = false
    bipeur.value = e
    const order = {
      products: JSON.stringify(props.cart),
      status: 'EN_ATTENTE',
      type: type.value,
      total: parseFloat(subTotal.value - percentTotal.value),
      number: e,
      invoice: '',
    }
    loading.value = true
    try {
      const { data } = await axios.post('/orders', order, {
        headers: {
          'Authorization': `Bearer ${store.user.accessToken}`
        }
      })
      if (data?.data?.id) {
        percent.value = 0
        pay.value = ''
        type.value = 'SUR_PLACE'
        emit('cartDel', 'clear')
        loading.value = false
        window.print()
        window.onafterprint = () => {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Commande créée',
            showConfirmButton: false,
            timer: 1500
          })
        }
      }
    } catch (error) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Commande pas créé. Veuillez réessayer',
        showConfirmButton: false,
        timer: 1500
      })
      loading.value = true
    }
  }

</script>

<template>
  <div v-if="loading" class="fixed top-0 left-0 w-full h-full bg-black/80 flex justify-center items-center z-50">
    <span class="loading big"></span>
  </div>
  <number-modal :setting-modal="numModal" @close-modal="modalClose" @update-input="sendOrder" />
  <div class="p-2">
    <div class="flex justify-between items-center gap-4">
      <div class="flex gap-4 items-center">
        <shopping class="text-main" />
        <h2 class="relative title text-2xl text-main font-bree-serif font-bold">Cart</h2>
      </div>
    </div>
    <div class="mt-8 max-h-96 h-96 overflow-scroll">
      <p v-if="cart.length === 0" class="text-black/50 p-2">Pas de commandes</p>
      <cart-item
        v-for="(item, i) in cart"
        :key="i"
        :item="item"
        @click="removeItem(i)"
      />
    </div>
    <div v-if="cart.length > 0" class="mb-4 mx-2 flex items-center justify-between gap-2 border-t border-border pt-4">
      <span class="text-black/40 font-bold">Type</span>
      <select v-model="type" class="bg-white border text-sm rounded-md focus:outline-none block p-2.5 border-border">
        <option value="" disabled>Veuillez sélectionner un type</option>
        <option v-for="(item, i) in types" :value="item.value" :key="i">{{ item.name }}</option>
      </select>
    </div>
    <div v-if="cart.length > 0" class="mb-4 mx-2 flex items-center justify-between gap-2 border-t border-border pt-4">
      <span class="text-black/40 font-bold">Sous total</span>
      <span class="text-xl font-bold font-bree-serif text-main">{{ subTotal }} <span class="text-base">DH</span></span>
    </div>
    <div v-if="cart.length > 0" class="mb-4 mx-2 flex items-center justify-between gap-2">
      <span class="text-black/40 font-bold">Payé</span>
      <input type="text" placeholder="0" class="border border-border rounded-lg p-2 h-10 text-lg text-main" v-model="pay">
    </div>
    <div v-if="showPromo && cart.length > 0" class="mb-2 mx-2 flex items-center justify-between gap-2">
      <span class="text-xl text-black/40 font-bold">Promotion <span class="text-main">({{ percent }}%)</span></span>
      <span class="text-2xl font-bold font-bree-serif text-main"> - {{ parseFloat(percentTotal).toFixed(2) }}<span class="text-base">DH</span></span>
    </div>
    <div v-if="cart.length > 0" class="mb-2 mx-2 flex items-center justify-between gap-2">
      <span class="text-xl text-black/40 font-bold">Echange</span>
      <span class="text-2xl font-bold font-bree-serif text-main">{{ parseFloat(pay - (subTotal - percentTotal)).toFixed(2) }} <span class="text-base">DH</span></span>
    </div>
    <div v-if="cart.length > 0" class="mb-4 mx-2 flex items-center justify-between gap-2 border-t border-border pt-4">
      <span class="text-xl text-black/40 font-bold">Total</span>
      <span class="text-2xl font-bold font-bree-serif text-main">{{ parseFloat(subTotal - percentTotal).toFixed(2) }} <span class="text-base">DH</span></span>
    </div>
    <money v-if="store.settings.money && cart.length > 0" @reset="resetPay" @add="addNum" />
    <calc v-if="!store.settings.money && cart.length > 0" @reset="resetPay" @add="setNum" />
    <percentage v-if="showPromo && cart.length > 0" @reset="resetPromo" @add="setPromo"  />
    <button v-if="cart.length > 0" @click="showStep" class="bg-main px-8 py-4 w-full text-white rounded-md">
      Envoyez au cuisinier
    </button>
  </div>
  <div id="printArea" class="hidden">
    <print-item
      :cart="cart"
      :subTotal="subTotal"
      :showPromo="showPromo"
      :percent="percent"
      :percentTotal="percentTotal"
      :pay="pay"
      :bipeur="bipeur"
      :type="type"
    />
    <div class="py-2 my-2 border border-dotted border-black"></div>
    <print-item
      :cart="cart"
      :subTotal="subTotal"
      :showPromo="showPromo"
      :percent="percent"
      :percentTotal="percentTotal"
      :pay="pay"
      :bipeur="bipeur"
      :type="type"
    />
  </div>
</template>