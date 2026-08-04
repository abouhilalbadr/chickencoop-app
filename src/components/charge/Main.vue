<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

import Amount from '../ui/Money.vue'

const props = defineProps(['token'])
const emit = defineEmits(['edit'])
const rows = ref([])
const loading = ref(true)

const monthNames = ["Janvier", "février", "mars", "avril", "mai", "juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const getCharge = async () => {
  try {
    const { data } = await axios.get('/charge/daily', {
      headers: {
        'Authorization': `Bearer ${props.token}`
      }
    })
    rows.value = data.data
    loading.value = false
  } catch (error) {
    loading.value = false
  }
}

const format = (date) => {
  const title = new Date(date).toLocaleDateString('fr-FR')
  const sTitle = title.split('/')
  const month = parseInt(sTitle[1]) - 1
  return sTitle[0] + " " + monthNames[month] + " " + sTitle[2]
}

// What the post actually wants to know at a glance: what today has cost
const total = computed(() => rows.value.reduce((sum, row) => sum + (Number(row.price) || 0), 0))

onMounted(() => {
  getCharge()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="loading" class="py-14 flex justify-center">
      <span class="loading big"></span>
    </div>

    <p v-else-if="rows.length === 0" class="border border-dashed border-border rounded-xl py-12 text-center text-black/45">
      Aucune charge enregistrée aujourd'hui
    </p>

    <template v-else>
      <div class="overflow-x-auto border border-border rounded-xl">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-light text-left">
              <th class="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[.07em] text-black/55">Fournisseur</th>
              <th class="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[.07em] text-black/55">Produit</th>
              <th class="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[.07em] text-black/55">Date</th>
              <th class="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[.07em] text-black/55 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, i) in rows"
              :key="i"
              class="border-t border-border even:bg-gray-light/60 hover:bg-main/[.05]"
            >
              <td class="px-4 py-3 font-medium">{{ item.supplier }}</td>
              <td class="px-4 py-3 text-black/75">{{ item.product }}</td>
              <td class="px-4 py-3 text-black/55">{{ format(item.date) }}</td>
              <td class="px-4 py-3 text-right"><Amount :value="item.price" :decimals="false" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-baseline justify-end gap-3 px-1">
        <span class="text-black/55">Total des charges</span>
        <Amount :value="total" size="total" tone="brand" :decimals="false" />
      </div>
    </template>
  </div>
</template>
