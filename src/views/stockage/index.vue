<script setup>
import { ref } from "vue"
import Header from "../../components/Header.vue";
import ChargeMain from "../../components/charge/Main.vue";
import ChargeAdd from "../../components/charge/Add.vue";

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
    <div class="flex justify-end">
      <button
        v-if="page === 'main'"
        class="border border-main text-main px-6 py-2 rounded-md transition flex justify-center items-center gap-2 hover:bg-main/20"
        @click="page = 'add'"
      >
        <span>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
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
  </div>
</template>
