<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const props = defineProps(['token'])
const emit = defineEmits(['edit'])
const rows = ref([])
const loading = ref(true)

const types = [
  { name: 'all', value: 'Tous'},
  { name: 'supplier', value: 'Par fournisseur' },
  { name: 'product', value: 'Par produit' },
  { name: 'date', value: 'Par mois' },
]
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


onMounted(() => {
  getCharge()
})

</script>

<template>
  <div class="relative overflow-x-auto">
    <table class="w-full text-sm text-center relative min-h-[80px]">
      <thead class="text-xs text-black uppercase bg-[#ddd]">
        <tr>
          <th scope="col" class="px-6 py-3">Fournisseur</th>
          <th scope="col" class="px-6 py-3">Produit</th>
          <th scope="col" class="px-6 py-3">Date</th>
          <th scope="col" class="px-6 py-3">Montant</th>
        </tr>
      </thead>
      <tbody>
        <div v-if="loading" class="bg-white p-2 w-full absolute left-0 bottom-0 flex justify-center">
          <span class="loader !border-main !border-b-transparent"></span>
        </div>
        <div v-else-if="!loading && rows.length <= 0" class="bg-white p-2 w-full absolute left-0 bottom-0 flex justify-center">
          <p>Aucune donnée disponible</p>
        </div>
        <tr
          class="bg-gray"
          v-else
          v-for="(item, i) in rows"
          :key="i"
        >
          <td class="px-6 py-4">
            {{ item.supplier }}
          </td>
          <td class="px-6 py-4">
            {{ item.product }}
          </td>
          <td class="px-6 py-4">
            {{ format(item.date) }}
          </td>
          <td class="px-6 py-4">
            {{ item.price }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
