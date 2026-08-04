<script setup>
import { useRouter } from 'vue-router'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import axios from 'axios'

import SettingModal from "../components/SettingModal.vue";
import DeliveriesModal from "../components/coopbox/DeliveriesModal.vue";

import Cash from "../components/icons/Cash.vue";
import Cart from "../components/icons/Cart.vue";
import Lock from "../components/icons/Lock.vue";
import Tablet from "../components/icons/Tablet.vue";
import Settings from "../components/icons/Settings.vue";
import Preorder from "../components/icons/Preorder.vue";
import Truck from "../components/icons/Truck.vue";

import { useStore } from "../store"

const store = useStore()
const router = useRouter()

const props = defineProps(['page'])
const emit = defineEmits(['change-page', 'add-to-cart'])

const modal = ref(false)
const deliveriesModal = ref(false)
const todayCount = ref(0)

// A till runs all service without anyone reloading it; the clock says it is live
const now = ref(new Date())
let timer

const time = computed(() => now.value.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))

const postIcon = computed(() => {
  if (store?.user?.name === 'Charge') return Cart
  if (store?.user?.name === 'Tablet') return Tablet
  return Cash
})

const openModal = () => {
  modal.value = true
}

const closeModal = () => {
  modal.value = false
}

const openDeliveries = () => {
  deliveriesModal.value = true
}

const returnBack = () => {
  store.logout()
  router.push('/')
}

const updatePage = (p) => {
  emit('change-page', p)
}

const fetchDeliveriesCount = async () => {
  try {
    const { data } = await axios.get("/deliveries/kitchen/board?day=today&includeItems=false", {
      headers: { Authorization: `Bearer ${store.user.accessToken}` },
    });
    todayCount.value = data?.counts?.today || 0;
  } catch {
    todayCount.value = 0;
  }
}

const addproductsToCart = (products) => {
  deliveriesModal.value = false
  emit('add-to-cart', products)
}

// check url and set page
onMounted(() => {
  if (props.page === 'stockage') {
    store.setType('stockage')
  } else {
    fetchDeliveriesCount();
    store.setType('caisse')
  }
  timer = setInterval(() => (now.value = new Date()), 1000)
})

onUnmounted(() => clearInterval(timer))
</script>

<template>
  <setting-modal :settingModal="modal" @settings-close="closeModal" />
  <div v-if="store.type === 'caisse'">
    <deliveries-modal :deliveriesModal="deliveriesModal" @deliveriesClose="deliveriesModal = false"
      @addToCart="addproductsToCart" />
  </div>
  <header class="sticky top-0 z-30 bg-white border-b border-border">
    <div class="flex items-center gap-5 px-4 h-16">
      <img src="../assets/images/logo.png" alt="Chicken Coop" class="h-11">
      <div class="flex items-center gap-2">
        <component :is="postIcon" class="h-8 fill-main" />
        <span class="font-bree-serif text-lg">{{ store?.user?.name || 'Caisse' }}</span>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <span class="font-bree-serif text-xl tabular-nums text-black/70 mr-2">{{ time }}</span>

        <!-- Tools, all the same shape: a square icon button with its count on it -->
        <button
          v-if="store.type === 'caisse'"
          @click="openDeliveries"
          class="relative h-12 w-12 rounded-lg border border-border bg-white flex justify-center items-center transition-colors hover:bg-gray-light"
          title="Livraisons"
        >
          <Truck class="h-7 w-7 fill-main" />
          <span
            v-if="todayCount"
            class="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 text-[11px] font-bold bg-third text-black rounded-full flex justify-center items-center"
          >
            {{ todayCount }}
          </span>
        </button>
        <button
          v-if="store.type === 'caisse'"
          @click="updatePage('preorder')"
          class="relative h-12 w-12 rounded-lg border border-border bg-white text-main flex justify-center items-center transition-colors hover:bg-gray-light"
          title="Précommandes"
        >
          <Preorder />
          <span
            v-if="store.preorders.length"
            class="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 text-[11px] font-bold bg-third text-black rounded-full flex justify-center items-center"
          >
            {{ store.preorders.length }}
          </span>
        </button>
        <button
          v-if="store.type === 'caisse'"
          @click="openModal"
          class="h-12 w-12 rounded-lg border border-border bg-white text-main flex justify-center items-center transition-colors hover:bg-gray-light"
          title="Paramètres"
        >
          <settings />
        </button>

        <button
          @click="returnBack"
          class="h-12 px-5 ml-2 rounded-lg border border-border bg-white text-black flex gap-2 items-center transition-colors hover:bg-gray-light"
        >
          <lock />
          <span>Verrouiller</span>
        </button>
      </div>
    </div>
  </header>
</template>
