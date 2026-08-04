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
  <div v-if="loadingPrint" class="fixed inset-0 z-50 bg-black/70 flex flex-col gap-4 justify-center items-center" role="status">
    <span class="loading big"></span>
    <p class="text-white">Impression en cours…</p>
  </div>

  <section class="bg-white border border-black/[.07] rounded-xl shadow-sm overflow-hidden flex flex-col">
    <header class="flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0">
      <span class="text-main">
        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
      </span>
      <h2 class="font-bree-serif text-[17px]">Commandes à imprimer</h2>
      <span
        v-if="prints.length"
        class="min-w-[26px] h-[26px] px-1.5 rounded-full bg-main text-white text-[13px] font-bold flex items-center justify-center tabular-nums"
      >
        {{ filterDuplicates(prints).length }}
      </span>
    </header>

    <div class="max-h-64 overflow-y-auto p-3 flex flex-col gap-2">
      <p v-if="prints.length === 0" class="text-black/45 text-center py-8">Pas de commandes à imprimer</p>
      <!-- The whole row prints: this is a till, the target is a hand -->
      <button
        v-for="(item, i) in filterDuplicates(prints)"
        :key="i"
        class="rounded-lg border border-border bg-white px-3 py-3 flex items-center gap-3 text-left
          transition-colors hover:border-main hover:bg-main/[.06]"
        @click="setToPrint(item, i)"
      >
        <svg class="text-main shrink-0" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        <span>
          Commande <span class="font-bree-serif text-lg">N° {{ item.bipeur }}</span> — appuyez pour imprimer
        </span>
      </button>
    </div>

    <div v-if="toPrint" id="printArea" class="hidden">
      <print-item :cart="toPrint.cart" :subTotal="toPrint.subTotal" :showPromo="toPrint.showPromo"
        :percent="toPrint.percent" :percentTotal="toPrint.percentTotal" :pay="toPrint.pay" :bipeur="toPrint.bipeur"
        :type="toPrint.type" :livraison="toPrint.livraison" :payType="toPrint.payType" />
    </div>
  </section>
</template>
