<script setup>
import { ref } from "vue"
import Swal from 'sweetalert2'

import PrintItem from "./PrintItem.vue";

import { useStore } from "../store"

const props = defineProps(['prints'])
const toPrint = ref(null)
const loadingPrint = ref(false)

const store = useStore()

const filterDuplicates = (arr) => {
  const filteredArr = arr.reduce((acc, current) => {
    const x = acc.find(item => item.bipeur === current.bipeur);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  return filteredArr
}

const setToPrint = (item, i) => {
  loadingPrint.value = true
  toPrint.value = item
  setTimeout(() => {
    window.print()
    window.onafterprint = () => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Commande imprimée',
        showConfirmButton: false,
        timer: 1500
      })
    }
    store.removePrint(i)
    loadingPrint.value = false
  }, 1000)
}

</script>

<template>
  <div v-if="loadingPrint" class="flex justify-center items-center fixed top-0 left-0 w-full h-full z-50" role="status">
    <div class="fixed top-0 left-0 w-full h-full bg-black/80"></div>
    <svg aria-hidden="true" class="w-8 h-8 text-gray animate-spin fill-main relative" viewBox="0 0 100 101" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor" />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill" />
    </svg>
    <span class="sr-only">Loading...</span>
  </div>
  <div class="px-4">
    <div class="flex gap-4 items-center">
      <div class="text-main">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"
          stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
      </div>
      <h2 class="relative title text-2xl text-main font-bree-serif font-bold">Commandes à imprimer</h2>
    </div>
    <div class="flex flex-col gap-4 mt-8 max-h-64 h-64 overflow-scroll">
      <p v-if="prints.length === 0" class="text-black/50 p-2">Pas de commandes à imprimer</p>
      <button v-for="(item, i) in filterDuplicates(prints)" :key="i"
        class="px-4 py-2 text-xl border border-main text-main bg-notif rounded-md flex items-center justify-between cursor-pointer"
        @click="setToPrint(item, i)">
        <div class="flex items-center gap-3">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"
            stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          <span>La commande N&#186; <span class="text-black font-bold">{{ item.bipeur }}</span> est prête à
            imprimer</span>
        </div>
      </button>
    </div>
    <div v-if="toPrint" id="printArea" class="hidden">
      <print-item :cart="toPrint.cart" :subTotal="toPrint.subTotal" :showPromo="toPrint.showPromo"
        :percent="toPrint.percent" :percentTotal="toPrint.percentTotal" :pay="toPrint.pay" :bipeur="toPrint.bipeur"
        :type="toPrint.type" :livraison="toPrint.livraison" :payType="toPrint.payType" />
    </div>
  </div>
</template>