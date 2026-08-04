<script setup>
import { ref, computed } from "vue"
import axios from 'axios'
import Swal from 'sweetalert2'

import { useStore } from "../store"

import CartItem from './CartItem.vue';
import Calc from './Calc.vue'
import Money from './Money.vue'
import Percentage from './Percentage.vue'
import NumberModal from './NumberModal.vue'
import PrintItem from "./PrintItem.vue";
import Amount from './ui/Money.vue'
import AppButton from './ui/AppButton.vue'
import Choice from './ui/Choice.vue'


const store = useStore()

const pay = ref('')
const percent = ref(0)
const type = computed(() => store.preOrderType)
const numModal = ref(false)
const loading = ref(false)
const livraison = ref(0)
const payType = ref('CASH')
// Epson Printer
const bipeur = ref(0);
const freeUser = ref('')

const props = defineProps(['cart', 'page'])
const emit = defineEmits(['cartDel', 'updateCart'])

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

const total = computed(() =>
  (subTotal.value + (livraison.value === -1 ? 0 : livraison.value)) - percentTotal.value
)
const change = computed(() => (parseFloat(pay.value) || 0) - total.value)

const types = [
  { name: 'Sur place', value: 'SUR_PLACE' },
  { name: 'À emporter', value: 'A_EMPORTER' },
  { name: 'Livraison', value: 'LIVRAISON' },
  { name: 'Gratuit', value: 'GRATUIT' },
]

// Glovo is stored apart everywhere else (it drives `invoice`), but on the till
// it is simply the fifth way an order can be taken.
const allTypes = [...types, { name: 'Glovo', value: 'GLOVO' }]

// A mark per type, so the five buttons are told apart by shape and not only by
// reading them. Drawn inline in currentColor: they invert with the fill.
const svg = (paths) =>
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`

const TYPE_ICONS = {
  // a fork and a knife: eaten here
  SUR_PLACE: svg('<path d="M7 3v7a2 2 0 0 0 4 0V3"/><path d="M9 10v11"/><path d="M17 3c-1.4 1.6-2 3.2-2 5s.6 2.8 2 3v10"/>'),
  // a takeaway bag
  A_EMPORTER: svg('<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
  // a delivery van
  LIVRAISON: svg('<path d="M3 7h10v9H3z"/><path d="M13 10h4l4 3v3h-8z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>'),
  // a gift: comped, nothing collected
  GRATUIT: svg('<rect x="3" y="9" width="18" height="11" rx="1.5"/><path d="M3 13h18M12 9v11"/><path d="M12 9S9.5 4 7.5 5.5 9 9 12 9Zm0 0s2.5-5 4.5-3.5S15 9 12 9Z"/>'),
  // a scooter: the platform's own delivery
  GLOVO: svg('<circle cx="6" cy="17" r="2.4"/><circle cx="18" cy="17" r="2.4"/><path d="M8.4 17h7.2M6 17V9h5l3 5"/><path d="M14 6h3l1 11"/>'),
}

const zones = [
  { name: 'Gratuit', value: 0 },
  { name: 'Zone A', value: 10 },
  { name: 'Zone B', value: 20 },
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
  const newCart = props.cart.map((item) => {
    return {
      image: item.image,
      index: item.index || 0,
      mode: item.mode || 'coopbox',
      name: item.name,
      number: item.number || item.quantity,
      price: item.price,
      productId: item.productId,
      // Only menu lines carry it; the reports use it to tell them from products
      ...(item.menuId ? { menuId: item.menuId } : {}),
      sauces: item.sauces || [],
      viandes: item.viandes || [],
      extras: item.extras || [],
      note: item.note || ''
    }
  })
  let order = {
    products: JSON.stringify(newCart),
    status: 'EN_ATTENTE',
    type: type.value,
    total: parseFloat((subTotal.value + (livraison.value === -1 ? 0 : livraison.value)) - percentTotal.value),
    number: e,
    invoice: type.value === 'GLOVO' ? payType.value : freeUser.value,
  }
  loading.value = true
  if (props.page === 'tablet') {
    order = {
      ...order,
      systemType: 'tablet', data: JSON.stringify({
        cart: props.cart, subTotal: subTotal.value, showPromo: showPromo.value, percent: percent.value, percentTotal: percentTotal.value, pay: pay.value, bipeur: e, type: type.value, livraison: livraison.value, payType: payType.value
      })
    }
  }
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
      // The type lives in the store — assigning to the computed silently failed
      store.setPreOrderType('SUR_PLACE')
      store.setGlovo(false)
      payType.value = 'CASH'
      emit('cartDel', 'clear')
      loading.value = false
      if (props.page === 'caisse') {
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
      if (props.page === 'tablet') {
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
      // ungrouped rows are always one unit — never let a stale `number` claim more
      finalFormat.push({ ...item, number: 1 })
    }
  });
  const counts = {};
  productsIndexs.map((x) => (counts[x] = (counts[x] || 0) + 1));
  for (const key in counts) {
    if (Object.hasOwnProperty.call(counts, key)) {
      const el = counts[key];
      const currentProduct = arr.find(item => item.index === parseInt(key))
      if (currentProduct.productId && currentProduct.productId > 0) {
        finalFormat.push({
          name: currentProduct.name,
          image: currentProduct.image,
          price: el * currentProduct.price,
          productId: currentProduct.productId,
          menuId: currentProduct.menuId,
          mode: currentProduct.mode,
          sauces: currentProduct.sauces,
          viandes: currentProduct.viandes,
          extras: currentProduct.extras,
          note: currentProduct.note,
          index: currentProduct.index,
          number: el
        })
      } else {
        finalFormat.push(currentProduct)
      }
    }
  }
  return finalFormat
}

const changeType = (value) => {
  if (type.value === value) return
  if (value === 'GLOVO') store.setGlovo(true)
  else store.setGlovo(false)
  store.setPreOrderType(value)
  livraison.value = 0
  freeUser.value = ''
  payType.value = 'CASH'
}
</script>

<template>
  <div v-if="loading" class="fixed top-0 left-0 w-full h-full bg-black/70 flex justify-center items-center z-50">
    <span class="loading big"></span>
  </div>
  <number-modal :setting-modal="numModal" @close-modal="modalClose" @update-input="sendOrder" />

  <section class="bg-white border border-black/[.07] rounded-xl shadow-sm flex flex-col overflow-hidden">
    <header class="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
      <h2 class="font-bree-serif text-lg">Panier</h2>
      <span
        v-if="cart.length"
        class="min-w-[26px] h-[26px] px-1.5 rounded-full bg-main text-white text-[13px] font-bold flex items-center justify-center tabular-nums"
      >
        {{ cart.length }}
      </span>
      <button
        v-if="cart.length"
        class="ml-auto h-9 px-3 rounded-lg text-[13px] text-danger border border-danger/40 transition-colors hover:bg-danger hover:text-white"
        @click="emit('cartDel', 'clear')"
      >
        Vider
      </button>
    </header>

    <!-- Lines. Always at least this tall, so the panel does not jump between
         an empty cart and a first item. -->
    <div class="min-h-[160px] max-h-[42vh] overflow-y-auto px-2">
      <p v-if="cart.length === 0" class="text-black/45 text-center py-14">Pas de commandes</p>
      <cart-item v-for="(item, i) in formatCart(cart)" :key="i" :item="item" @click="removeItem(item)" />
    </div>

    <div class="p-4 flex flex-col gap-4 border-t border-border">
      <!-- Type of order first: it decides what the rest of the panel shows and
           how the money is counted. -->
      <div class="flex flex-col gap-2">
        <span class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Type de commande</span>
        <!-- Five equal choices in one row: Glovo is one type among five, and a
             full-width button made it look like a mode the till switches into.
             Each keeps its own mark so they are told apart by shape. -->
        <div class="grid grid-cols-5 gap-2">
          <Choice
            v-for="item in allTypes"
            :key="item.value"
            size="tile"
            :selected="item.value === type"
            block
            @click="changeType(item.value)"
          >
            <span v-html="TYPE_ICONS[item.value]" />
            <span class="leading-none text-center">{{ item.name }}</span>
          </Choice>
        </div>
      </div>

      <div v-if="type === 'LIVRAISON'" class="flex flex-col gap-2">
        <span class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Zone de livraison</span>
        <div class="grid grid-cols-3 gap-2">
          <Choice
            v-for="zone in zones"
            :key="zone.value"
            size="lg"
            :selected="livraison === zone.value"
            block
            @click="livraison = zone.value"
          >
            <span class="flex flex-col items-center leading-tight">
              <span>{{ zone.name }}</span>
              <span class="text-xs" :class="livraison === zone.value ? 'text-white/70' : 'text-black/45'">
                {{ zone.value === 0 ? 'offerte' : `${zone.value} DH` }}
              </span>
            </span>
          </Choice>
        </div>
      </div>

      <div v-if="type === 'GLOVO'" class="flex flex-col gap-2">
        <span class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Paiement Glovo</span>
        <div class="grid grid-cols-2 gap-2">
          <Choice size="lg" :selected="payType === 'CASH'" block @click="payType = 'CASH'">Espèce</Choice>
          <Choice size="lg" :selected="payType === 'CARD'" block @click="payType = 'CARD'">Carte bancaire</Choice>
        </div>
      </div>

      <div v-if="type === 'GRATUIT' && cart.length > 0" class="flex flex-col gap-2">
        <label for="freeUser" class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Gratuit pour qui</label>
        <input
          id="freeUser"
          type="text"
          placeholder="Nom"
          class="h-12 px-3 border border-border rounded-lg text-base outline-none focus:border-main focus:ring-[3px] focus:ring-main/[.15]"
          v-model="freeUser"
        >
      </div>

      <!-- The money block. One rule above the total: it is the line people read. -->
      <dl v-if="type !== 'GRATUIT' && cart.length > 0" class="flex flex-col gap-2.5">
        <div class="flex items-center justify-between gap-3">
          <dt class="text-black/55">Sous total</dt>
          <dd><Amount :value="subTotal" /></dd>
        </div>
        <div v-if="showPromo" class="flex items-center justify-between gap-3">
          <dt class="text-black/55">Promotion <span class="text-main font-medium">({{ percent }}%)</span></dt>
          <dd><Amount :value="-percentTotal" tone="danger" /></dd>
        </div>
        <div v-if="type === 'LIVRAISON'" class="flex items-center justify-between gap-3">
          <dt class="text-black/55">Livraison</dt>
          <dd><Amount :value="livraison" /></dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-black/55">
            <label for="pay">Payé</label>
          </dt>
          <dd>
            <input
              id="pay"
              type="text"
              placeholder="0"
              inputmode="numeric"
              class="h-12 w-32 px-3 border border-border rounded-lg text-right text-base tabular-nums outline-none
                focus:border-main focus:ring-[3px] focus:ring-main/[.15]"
              v-model="pay"
            >
          </dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-black/55">Échange</dt>
          <dd><Amount :value="change" :tone="change < 0 ? 'danger' : 'positive'" /></dd>
        </div>
        <div class="flex items-baseline justify-between gap-3 border-t border-border pt-3 mt-0.5">
          <dt class="font-medium">Total</dt>
          <dd><Amount :value="total" size="total" tone="brand" /></dd>
        </div>
      </dl>

      <template v-if="type !== 'GRATUIT'">
        <money v-if="store.settings.money && cart.length > 0" @reset="resetPay" @add="addNum" />
        <calc v-if="!store.settings.money && cart.length > 0" @reset="resetPay" @add="setNum" />
        <percentage v-if="showPromo && cart.length > 0" @reset="resetPromo" @add="setPromo" />
      </template>

      <AppButton v-if="cart.length > 0" variant="primary" size="xl" block @click="showStep">
        Envoyer au cuisinier
      </AppButton>
    </div>
  </section>

  <div v-if="cart.length > 0" id="printArea" class="hidden">
    <print-item :cart="cart" :subTotal="subTotal" :showPromo="showPromo" :percent="percent" :percentTotal="percentTotal"
      :pay="pay" :bipeur="bipeur" :type="type" :livraison="livraison" :payType="payType" />
    <div class="py-2 my-2 border border-dotted border-black"></div>
    <print-item :cart="cart" :subTotal="subTotal" :showPromo="showPromo" :percent="percent" :percentTotal="percentTotal"
      :pay="pay" :bipeur="bipeur" :type="type" :livraison="livraison" :payType="payType" />
  </div>
</template>
