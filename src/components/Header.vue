<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import axios from 'axios'

import SettingModal from "../components/SettingModal.vue";
import TotalModal from "../components/TotalModal.vue";

import Cash from "../components/icons/Cash.vue";
import Cart from "../components/icons/Cart.vue";
import Lock from "../components/icons/Lock.vue";
import Tablet from "../components/icons/Tablet.vue";
import Settings from "../components/icons/Settings.vue";
import Preorder from "../components/icons/Preorder.vue";
import Daily from "../components/icons/Daily.vue";

import { useStore } from "../store"

const store = useStore()
const router = useRouter()

const props = defineProps(['page'])
const emit = defineEmits(['change-page'])

const modal = ref(false)
const showTotal = ref(false)
const total = ref({})

const openModal = () => {
  modal.value = true
}

const closeModal = () => {
  modal.value = false
}

const showTotalModal = async () => {
  showTotal.value = true
  await getTotal()
}

const closeTotalModal = () => {
  showTotal.value = false
}

const returnBack = () => {
  store.logout()
  router.push('/')
}

const updatePage = (p) => {
  emit('change-page', p)
}

const getTotal = async () => {
  try {
    const { data } = await axios.post('/orders/caisse/daily-total', {}, {
      headers: {
        'Authorization': `Bearer ${store.user.accessToken}`
      }
    })
    if (data?.success) {
      total.value = data.data
    }
  } catch (error) {
    console.log(error)
  }
}

// check url and set page
onMounted(() => {
  if (props.page === 'stockage') {
    store.setType('stockage')
  } else {
    store.setType('caisse')
  }
})

</script>

<template>
  <setting-modal
    :settingModal="modal"
    @settings-close="closeModal"
  />
  <total-modal
    :total="total"
    :totalModal="showTotal"
    @total-close="closeTotalModal"
  />
  <header class="px-4 py-2">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <img src="../assets/images/logo.png" alt="Chicken Coop Logo" class="h-12">
          <div class="flex items-center gap-2">
            <Cart v-if="store?.user?.name === 'Charge'" class="h-16 fill-main relative top-1" />
            <Tablet v-else-if="store?.user?.name === 'Tablet'" class="h-12 fill-main relative top-1" />
            <Cash v-else class="h-12 fill-main relative top-1" />
            <span class="text-main font-bree-serif">
              {{ store?.user?.name || 'Caisse' }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-8">
          <button @click="showTotalModal" class="text-main h-10 w-10 rounded-md flex justify-center items-center">
            <Daily />
          </button>
          <button v-if="store.type === 'caisse'" @click="openModal" class="text-main h-10 w-10 rounded-md flex justify-center items-center">
            <settings />
          </button>
          <button v-if="store.type === 'caisse'" @click="updatePage('preorder')" class="relative text-main h-10 w-10 rounded-md flex justify-center items-center">
            <Preorder />
            <span class="absolute -top-2 -right-2 w-6 h-6 text-xs bg-third text-black font-bold rounded-full flex justify-center items-center">
              {{ store.preorders.length }}
            </span>
          </button>
          <button @click="returnBack" class="bg-main flex gap-2 items-center text-white rounded-md px-8 py-3">
            <lock />
            <span>Verrouiller</span>
          </button>
        </div>
      </div>
  </header>
</template>
