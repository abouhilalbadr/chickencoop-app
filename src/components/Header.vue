<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

import SettingModal from "../components/SettingModal.vue";
import Cash from "../components/icons/Cash.vue";
import Cart from "../components/icons/Cart.vue";
import Lock from "../components/icons/Lock.vue";
import Tablet from "../components/icons/Tablet.vue";
import Settings from "../components/icons/Settings.vue";

import { useStore } from "../store"

const store = useStore()
const router = useRouter()

const props = defineProps(['page'])

const modal = ref(false)

const openModal = () => {
  modal.value = true
}

const closeModal = () => {
  modal.value = false
}

const returnBack = () => {
  store.logout()
  router.push('/')
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
          <button v-if="store.type === 'caisse'" @click="openModal" class="text-main h-10 w-10 rounded-md flex justify-center items-center">
            <settings />
          </button>
          <button @click="returnBack" class="bg-main flex gap-2 items-center text-white rounded-md px-8 py-3">
            <lock />
            <span>Verrouiller</span>
          </button>
        </div>
      </div>
  </header>
</template>
