<script setup>
import { ref } from "vue"
import Header from "../../components/Header.vue";
import ChargeMain from "../../components/charge/Main.vue";
import ChargeAdd from "../../components/charge/Add.vue";
import CalcAdd from "../../components/calc/Add.vue";
import CaisseIcon from "../../components/icons/Caisse.vue";
import CartIcon from "../../components/icons/Cart.vue";

import { useStore } from "../../store"

const store = useStore()

const page = ref('main')
const charge = ref({})

const editItem = (item) => {
  charge.value = item
  page.value = 'edit'
}

</script>
<template>
  <Header page="stockage" />
  <div class="px-4 flex flex-col gap-8 py-8">
    <div
      class="flex gap-8"
      :class="page === 'main' ? 'justify-between' : 'justify-end'"
    >
      <button
        v-if="page === 'main'"
        class="border border-main text-main px-6 py-2 rounded-md transition flex justify-center items-center gap-2 hover:bg-main/20"
        @click="page = 'add-calc'"
      >
        <span>
          <CaisseIcon class="text-main" />
        </span>
        <span class="text-sm">Ajoutez la caisse d'aujourd'hui</span>
      </button>
      <button
        v-if="page === 'main'"
        class="border border-main text-main px-6 py-2 rounded-md transition flex justify-center items-center gap-2 hover:bg-main/20"
        @click="page = 'add'"
      >
        <span>
          <CartIcon class="h-8 fill-main relative top-0.5" />
        </span>
        <span class="text-sm">Ajoutez des charge</span>
      </button>
      <button
        v-else
        class="border border-main text-main px-6 py-2 rounded-md transition flex justify-center items-center gap-2 hover:bg-main/20"
        @click="page = 'main'"
      >
        <span>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </span>
        <span class="text-sm">Retour</span>
      </button>
    </div>
    <ChargeMain v-if="page === 'main'" :token="store.user.accessToken" @edit="editItem" />
    <ChargeAdd v-else-if="page === 'add'" :token="store.user.accessToken" />
    <CalcAdd v-else-if="page === 'add-calc'" :token="store.user.accessToken" />
  </div>
</template>
