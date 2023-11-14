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
  const livraison = ref(0)
  // Epson Printer
  const bipeur = ref(0);
  const freeUser = ref('')

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
  const removeItem = (prod) => {
    const firstProduct = props.cart.findIndex(item => item.productId === prod.productId && item.index === prod.index)
    emit('cartDel', firstProduct)
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
      total: parseFloat((subTotal.value + (livraison.value === -1 ? 0 : livraison.value)) - percentTotal.value),
      number: e,
      invoice: freeUser.value,
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
        livraison.value = 0
        pay.value = ''
        freeUser.value = ''
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

  const formatCart = (arr) => {
    const finalFormat = [];
    var productsIndexs = [];
    arr.map(item => {
      if (item && item.index) {
        productsIndexs.push(item.index)
      } else {
        finalFormat.push(item)
      }
    });
    const counts = {};
    productsIndexs.map((x) => ( counts[x] = (counts[x] || 0) + 1 ));
    for (const key in counts) {
      if (Object.hasOwnProperty.call(counts, key)) {
        const el = counts[key];
        const currentProduct = arr.find(item => item.index === parseInt(key))
        if (currentProduct.productId && currentProduct.productId > 0) {
          finalFormat.push({
            name: (el > 1 ? el + "x " : '') + currentProduct.name,
            image: currentProduct.image,
            price: el * currentProduct.price,
            productId: currentProduct.productId,
            mode: currentProduct.mode,
            sauces: currentProduct.sauces,
            index: currentProduct.index,
            number: currentProduct.number
          })
        } else {
          finalFormat.push(currentProduct)
        }
      }
    }
    return finalFormat
  }

  const changeType = (value) => {
    type.value = value
    livraison.value = 0
    freeUser.value = ''
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
        v-for="(item, i) in formatCart(cart)"
        :key="i"
        :item="item"
        @click="removeItem(item)"
      />
    </div>
    <div v-if="cart.length > 0" class="mb-4 mx-2 flex flex-col gap-2 border-t border-border pt-4">
      <span class="text-black/40 font-bold">Type</span>
      <div class="grid grid-cols-2 gap-2 mb-4">
        <button
          v-for="(item, i) in types" :key="i"
          class="border border-main rounded-md py-4 font-bold"
          :class="item.value === type ? 'bg-main text-white' : 'text-main bg-white'"
          @click="changeType(item.value)"
        >
          {{ item.name }}
        </button>
      </div>
    </div>
    <div v-if="type === 'LIVRAISON'" class="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-6 px-2">
      <button @click="livraison = 0" class="border border-main rounded-md" :class="livraison === 0 ? 'bg-main text-white' : 'text-main bg-white'">Gratuit</button>
      <button @click="livraison = 10" class="border border-main text-main rounded-md" :class="livraison === 10 ? 'bg-main text-white' : 'text-main bg-white'">Zone A</button>
      <button @click="livraison = 20" class="border border-main text-main rounded-md" :class="livraison === 20 ? 'bg-main text-white' : 'text-main bg-white'">Zone B</button>
    </div>
    <div v-if="type === 'GRATUIT'">
      <div v-if="cart.length > 0" class="mb-4 mx-2 flex items-center justify-between gap-2">
        <span class="text-black/40 font-bold">Gratuit pour qui</span>
        <input type="text" placeholder="Nom" class="border border-border rounded-lg p-2 h-10 text-lg text-main outline-none" v-model="freeUser">
      </div>
    </div>
    <div v-if="type !== 'GRATUIT'">
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
      <div v-if="type === 'LIVRAISON'" class="mb-2 mx-2 flex items-center justify-between gap-2">
        <span class="text-xl text-black/40 font-bold">Livraison</span>
        <span class="text-2xl font-bold font-bree-serif text-main">{{ livraison }} <span class="text-base">DH</span></span>
      </div>
      <div v-if="cart.length > 0" class="mb-2 mx-2 flex items-center justify-between gap-2">
        <span class="text-xl text-black/40 font-bold">Echange</span>
        <span class="text-2xl font-bold font-bree-serif text-main">{{ parseFloat(pay - ((subTotal + (livraison === -1 ? 0 : livraison)) - percentTotal)).toFixed(2) }} <span class="text-base">DH</span></span>
      </div>
      <div v-if="cart.length > 0" class="mb-4 mx-2 flex items-center justify-between gap-2 border-t border-border pt-4">
        <span class="text-xl text-black/40 font-bold">Total</span>
        <span class="text-2xl font-bold font-bree-serif text-main">{{ parseFloat((subTotal + (livraison === -1 ? 0 : livraison)) - percentTotal).toFixed(2) }} <span class="text-base">DH</span></span>
      </div>
      <money v-if="store.settings.money && cart.length > 0" @reset="resetPay" @add="addNum" />
      <calc v-if="!store.settings.money && cart.length > 0" @reset="resetPay" @add="setNum" />
      <percentage v-if="showPromo && cart.length > 0" @reset="resetPromo" @add="setPromo"  />
    </div>
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
      :livraison="livraison"
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
      :livraison="livraison"
    />
  </div>
</template>
