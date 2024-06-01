<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

import SettingModal from "../components/SettingModal.vue";
import Cash from "../components/icons/Cash.vue";
import Cart from "../components/icons/Cart.vue";
import Lock from "../components/icons/Lock.vue";
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
  <header class="p-4">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <img src="../assets/images/logo.png" alt="Chicken Coop Logo" class="h-16">
          <div class="flex items-center gap-2">
            <Cart v-if="store.type === 'stockage'" class="h-16 fill-main relative top-1" />
            <Cash v-else class="h-16 fill-main relative top-1" />
            <span class="text-main font-bree-serif">
              {{ store.type === 'stockage' ? "Charge" : "Caisse"}}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-8">
          <button v-if="store.type === 'caisse'" @click="openModal" class="text-main h-12 w-12 rounded-md flex justify-center items-center">
            <settings />
          </button>
          <button @click="returnBack" class="bg-main flex gap-2 items-center text-white rounded-md px-10 py-4">
            <lock />
            <span>Verrouiller</span>
          </button>
        </div>
      </div>
  </header>
</template>
