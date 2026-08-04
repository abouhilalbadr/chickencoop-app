<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'

import AppButton from '../ui/AppButton.vue'

const props = defineProps(['token'])
const emit = defineEmits(['saved'])

const charge = reactive({
  supplier: '',
  product: '',
  price: '',
  size: '',
})
const loading = ref(false)
const errors = ref({
  supplier: '',
  product: '',
  price: '',
  size: '',
})
const products = ref([])

const suppliers = [
  { name: "Boulangerie", value: "Pièce" },
  { name: "Favorita", value: "Total" },
  { name: "Boucherie", value: "Kg" },
  { name: "Pesserie", value: "Total" },
  { name: "Gaz", value: "Pièce" },
  { name: "Huile", value: "Litre" },
  { name: "Emballage", value: "Pièce" },
  { name: "Légumes", value: "Kg" },
  { name: "Fruits", value: "Kg" },
  { name: "Station d'essence", value: "Total" },
  { name: "Avance", value: "Total" },
  { name: "Poulet", value: "Kg" },
  { name: "Coca-Cola", value: "Pièce" },
  { name: "Boissons", value: "Pièce" },
  { name: "Facture Électricité", value: "Total" },
  { name: "Facture Eau", value: "Total" },
  { name: "Facture internet", value: "Total" },
  { name: "Autre", value: "Total" },
]

const oldProducts = [
  "Crème fraîche pro",
  "cheddar",
  "Pizzarella premuim bloc",
  "Pain burger",
  "Sauce burger",
  "Ketchup",
  "Fromage bleu",
  "Cornichon",
  "Nugget poulet pané",
  "Hit sauce",
  "Cordon bleu pané",
  "Pain tacos",
  "Haricot rouge",
  "Fun fries (frites) 7/7",
  "Sauce burger",
  "Sauce Algériene",
  "Huile piquante"
]

const getChargeProducts = async () => {
  try {
    const { data } = await axios.get('/chargeProducts/active', {
      headers: {
        'Authorization': `Bearer ${props.token}`
      }
    })
    products.value = data.data
    loading.value = false
  } catch (error) {
    loading.value = false
  }
}

const validateInputs = () => {
  let isValid = true
  if (!charge.supplier) {
    isValid = false
    errors.value.supplier = 'Le fournisseur est requis'
  }
  if (!charge.product) {
    isValid = false
    errors.value.product = 'Le produit est requis'
  }
  if (!charge.price) {
    isValid = false
    errors.value.price = 'Le montant est requis'
  }
  if (!charge.size) {
    isValid = false
    errors.value.size = 'La quantité est requise'
  }
  return isValid

}

const submitCharge = async () => {
  try {
    const result = validateInputs()
    if (result) {
      loading.value = true
      const { data } = await axios.post('/charge', {
        name: charge.supplier,
        supplier: charge.supplier,
        product: charge.product,
        date: new Date(),
        price: parseInt(charge.price),
        size: parseInt(charge.size),
      },
        {
          headers: {
            'Authorization': `Bearer ${props.token}`
          }
        }
      )
      if (data?.data?.name) {
        // The dialog closes and the table refetches; reloading the whole app
        // for one row also threw away the session's cart on the till
        charge.supplier = ''
        charge.product = ''
        charge.price = ''
        charge.size = ''
        loading.value = false
        emit('saved', data.data)
      }
    }
  } catch (error) {
    alert("Échec de la création du charge, veuillez réessayer")
    loading.value = false
  }
}

const unite = computed(() => {
  const supplier = suppliers.find(s => s.name === charge.supplier)
  if (supplier) {
    return supplier.value
  }
  return 'Total'
})

onMounted(() => {
  getChargeProducts()
})

</script>
<template>
  <form @submit.prevent="submitCharge" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
    <div class="flex flex-col gap-1.5">
      <label class="text-[11px] font-bold uppercase tracking-[.07em]" for="supplier"
        :class="errors.supplier ? 'text-danger' : 'text-black/50'">
        Fournisseur
      </label>
      <select id="supplier" class="h-12 px-3 w-full border rounded-lg outline-none bg-white
          focus:border-main focus:ring-[3px] focus:ring-main/[.15]"
        :class="errors.supplier ? 'border-danger' : 'border-border'" v-model="charge.supplier"
        @input="errors.supplier = ''">
        <option value="" disabled selected>Choisir un fournisseur</option>
        <option v-for="(supplier, i) in suppliers" :key="i" :value="supplier.name">
          {{ supplier.name }}
        </option>
      </select>
      <span v-if="errors.supplier" class="text-danger text-xs">
        {{ errors.supplier }}
      </span>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-[11px] font-bold uppercase tracking-[.07em]" for="product"
        :class="errors.product ? 'text-danger' : 'text-black/50'">
        Produit
      </label>
      <input type="text" id="product" class="h-12 px-3 w-full border rounded-lg outline-none
          focus:border-main focus:ring-[3px] focus:ring-main/[.15]"
        :class="errors.product ? 'border-danger' : 'border-border'" placeholder="Produit"
        v-model="charge.product" @input="errors.product = ''" />
      <span v-if="errors.product" class="text-danger text-xs">
        {{ errors.product }}
      </span>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-[11px] font-bold uppercase tracking-[.07em]" for="size"
        :class="errors.size ? 'text-danger' : 'text-black/50'">
        Quantité
      </label>
      <!-- The unit rides inside the field: it is what the quantity is counted
           in, not a separate green button. -->
      <div class="relative">
        <input type="text" id="size" class="h-12 pl-3 pr-24 w-full border rounded-lg outline-none tabular-nums
            focus:border-main focus:ring-[3px] focus:ring-main/[.15]"
          :class="errors.size ? 'border-danger' : 'border-border'" placeholder="2"
          v-model="charge.size" @input="errors.size = ''" />
        <span class="absolute top-1/2 right-1.5 -translate-y-1/2 px-3 h-9 rounded-md bg-gray-light text-black/65 text-sm flex items-center">
          {{ unite }}
        </span>
      </div>
      <span v-if="errors.size" class="text-danger text-xs">
        {{ errors.size }}
      </span>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-[11px] font-bold uppercase tracking-[.07em]" for="price"
        :class="errors.price ? 'text-danger' : 'text-black/50'">
        Montant
      </label>
      <div class="relative">
        <input type="text" id="price" class="h-12 pl-3 pr-14 w-full border rounded-lg outline-none tabular-nums
            focus:border-main focus:ring-[3px] focus:ring-main/[.15]"
          :class="errors.price ? 'border-danger' : 'border-border'" placeholder="200"
          v-model="charge.price" @input="errors.price = ''" />
        <span class="absolute top-1/2 right-3 -translate-y-1/2 text-black/45 text-sm">DH</span>
      </div>
      <span v-if="errors.price" class="text-danger text-xs">
        {{ errors.price }}
      </span>
    </div>

    <div class="sm:col-span-2 flex justify-end pt-2 border-t border-border">
      <AppButton type="submit" variant="primary" size="lg" :loading="loading">Sauvegarder</AppButton>
    </div>
  </form>
</template>
