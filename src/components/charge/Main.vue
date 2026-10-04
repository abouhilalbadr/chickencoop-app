<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

import Amount from '../ui/Money.vue'
import Badge from '../ui/Badge.vue'

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
    // Charges the owner paid, entered from the back office, never left the till
    rows.value = data.data.filter((row) => row.paidFrom !== 'PATRON')
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

const KIND = {
  STOCK: { label: 'Achat stock', tone: 'brand' },
  DEPENSE: { label: 'Dépense', tone: 'neutral' },
  AVANCE: { label: 'Avance', tone: 'warning' },
  SALAIRE: { label: 'Salaire', tone: 'warning' },
}
const DEPENSES = {
  GAZ: 'Gaz', TRANSPORT: 'Transport / essence', NETTOYAGE: 'Nettoyage', MATERIEL: 'Petit matériel', AUTRE: 'Autre',
  LOYER: 'Loyer', ELECTRICITE: 'Électricité', EAU: 'Eau', INTERNET: 'Internet',
}
const UNITS = { Kg: 'kg', l: 'l', P: 'pièce' }

// What was paid for, in the words of each kind; rows saved before the kinds
// existed keep their supplier and product as typed
const title = (item) => {
  if (item.kind === 'STOCK') return item.stock?.name || item.product
  if (item.kind === 'DEPENSE') return DEPENSES[item.category] || item.name
  if (item.kind === 'AVANCE' || item.kind === 'SALAIRE') return item.staff?.name || item.product
  return item.product
}
const detail = (item) => {
  if (item.kind === 'STOCK') {
    const qty = `${Number(item.size || 0).toLocaleString('fr-FR', { maximumFractionDigits: 3 })} ${UNITS[item.stock?.type] || ''}`.trim()
    return [item.stock?.ref, qty, item.supplier].filter(Boolean).join(' · ')
  }
  if (item.kind === 'DEPENSE') return item.product && item.product !== item.name ? item.product : ''
  if (item.kind) return ''
  return item.supplier
}

// What left the till today, which is what the cash count takes off
const total = computed(() => Math.round(rows.value.reduce((sum, row) => sum + (Number(row.price) || 0), 0) * 100) / 100)

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
              <th class="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[.07em] text-black/55">Type</th>
              <th class="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[.07em] text-black/55">Détail</th>
              <th class="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[.07em] text-black/55">Date</th>
              <th class="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[.07em] text-black/55 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in rows"
              :key="item.id"
              class="border-t border-border even:bg-gray-light/60 hover:bg-main/[.05]"
            >
              <td class="px-4 py-3">
                <Badge v-if="KIND[item.kind]" :tone="KIND[item.kind].tone">{{ KIND[item.kind].label }}</Badge>
                <span v-else class="font-medium">{{ item.supplier }}</span>
              </td>
              <td class="px-4 py-3">
                <p class="font-medium">{{ title(item) }}</p>
                <p v-if="detail(item)" class="text-[12.5px] text-black/55">{{ detail(item) }}</p>
              </td>
              <td class="px-4 py-3 text-black/55">{{ format(item.date) }}</td>
              <td class="px-4 py-3 text-right"><Amount :value="item.price" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-baseline justify-end gap-3 px-1">
        <span class="text-black/55">Total des charges</span>
        <Amount :value="total" size="total" tone="brand" />
      </div>
    </template>
  </div>
</template>
