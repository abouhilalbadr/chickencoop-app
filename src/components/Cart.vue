<script setup>
  import { ref, computed, onMounted } from "vue"
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


  const store = useStore()

  const pay = ref('')
  const percent = ref(0)
  const type = ref('')
  const numModal = ref(false)
  const loading = ref(false)
  const showConnection = ref(false)
  // Epson Printer
  const connectionStatus = ref("");
  const printer = ref();
  const ePosDevice = ref()

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

  const hideStatus = () => {
    setTimeout(() => {
      showConnection.value = false
    }, 5000);
  }

  const connect = () => {
    connectionStatus.value = "Connexion...";
    showConnection.value = true

    if (!store.settings.printer.ip) {
      connectionStatus.value = "Tapez l'adresse IP de l'imprimante";
      hideStatus()
      return;
    }
    if (!store.settings.printer.port) {
      connectionStatus.value = "Tapez le port de l'imprimante";
      hideStatus()
      return;
    }

    connectionStatus.value = "Connexion...";

    let ePosDev = new window.epson.ePOSDevice();
    ePosDevice.value = ePosDev;

    ePosDev.connect(store.settings.printer.ip, store.settings.printer.port, (data) => {
      if (data === "OK") {
        ePosDev.createDevice(
          "local_printer",
          ePosDev.DEVICE_TYPE_PRINTER,
          { crypto: true, buffer: false },
          (devobj, retcode) => {
            if (retcode === "OK") {
              printer.value = devobj;
              connectionStatus.value = "Imprimante connectée";
              hideStatus()
            } else {
              connectionStatus.value = "La connexion a échoué";
              hideStatus()
              throw retcode;
            }
          }
        );
      } else {
        connectionStatus.value = "La connexion a échoué";
        hideStatus()
        throw data;
      }
    });
  };

  const sendOrder = async (e) => {
    numModal.value = false
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
      console.log(data);
      if (data?.data?.id) {
        percent.value = 0
        pay.value = ''
        type.value = ''
        emit('cartDel', 'clear')
        loading.value = false
        // Show notification: Commande créée
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Commande créée',
          showConfirmButton: false,
          timer: 1500
        })
      }
    } catch (error) {
      console.log(error);
      loading.value = true
    }
  }

  onMounted(() => {
    connect()
  })


</script>

<template>
  <div class="fixed top-0 m-4 z-50 transition-all" :class="showConnection ? 'right-0' : '-right-full'">
    <div class="bg-white text-black px-12 py-6 shadow-3xl rounded-md">
      <printer-msg :msg="connectionStatus" />
    </div>
  </div>
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
      <button @click="connect">
        <svg class="fill-main" height="24" width="24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve">
          <g id="Printer">
            <path d="M57.7881012,14.03125H52.5v-8.0625c0-2.2091999-1.7909012-4-4-4h-33c-2.2091999,0-4,1.7908001-4,4v8.0625H6.2119002
              C2.7871001,14.03125,0,16.8183498,0,20.2431507V46.513649c0,3.4248009,2.7871001,6.2119026,6.2119002,6.2119026h2.3798995
              c0.5527,0,1-0.4472008,1-1c0-0.5527-0.4473-1-1-1H6.2119002C3.8896,50.7255516,2,48.8359489,2,46.513649V20.2431507
              c0-2.3223,1.8896-4.2119007,4.2119002-4.2119007h51.5762024C60.1102982,16.03125,62,17.9208508,62,20.2431507V46.513649
              c0,2.3223-1.8897018,4.2119026-4.2118988,4.2119026H56c-0.5527992,0-1,0.4473-1,1c0,0.5527992,0.4472008,1,1,1h1.7881012
              C61.2128983,52.7255516,64,49.9384499,64,46.513649V20.2431507C64,16.8183498,61.2128983,14.03125,57.7881012,14.03125z
              M13.5,5.96875c0-1.1027999,0.8971996-2,2-2h33c1.1027985,0,2,0.8972001,2,2v8h-37V5.96875z"/>
            <path d="M44,45.0322495H20c-0.5517998,0-0.9990005,0.4472008-0.9990005,0.9990005S19.4482002,47.0302505,20,47.0302505h24
              c0.5517006,0,0.9990005-0.4472008,0.9990005-0.9990005S44.5517006,45.0322495,44,45.0322495z"/>
            <path d="M44,52.0322495H20c-0.5517998,0-0.9990005,0.4472008-0.9990005,0.9990005S19.4482002,54.0302505,20,54.0302505h24
              c0.5517006,0,0.9990005-0.4472008,0.9990005-0.9990005S44.5517006,52.0322495,44,52.0322495z"/>
            <circle cx="7.9590998" cy="21.8405495" r="2"/>
            <circle cx="14.2856998" cy="21.8405495" r="2"/>
            <circle cx="20.6121998" cy="21.8405495" r="2"/>
            <path d="M11,62.03125h42v-26H11V62.03125z M13.4036999,38.4349518h37.1925964v21.1925964H13.4036999V38.4349518z"/>
          </g>
        </svg>
      </button>
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
      <span class="text-xl text-black/40 font-bold">Type de commande</span>
      <select v-model="type" class="bg-white border text-sm rounded-md focus:outline-none block p-2.5 border-border">
        <option value="" disabled>Veuillez sélectionner un type</option>
        <option v-for="(item, i) in types" :value="item.value" :key="i">{{ item.name }}</option>
      </select>
    </div>
    <div v-if="cart.length > 0" class="mb-4 mx-2 flex items-center justify-between gap-2 border-t border-border pt-4">
      <span class="text-xl text-black/40 font-bold">Sous total</span>
      <span class="text-2xl font-bold font-bree-serif text-main">{{ subTotal }} <span class="text-base">DH</span></span>
    </div>
    <div v-if="cart.length > 0" class="mb-4 mx-2 flex items-center justify-between gap-2">
      <span class="text-xl text-black/40 font-bold">Le client donne</span>
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
</template>