<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps(['token'])

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
        location.reload()
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
  <form @submit.prevent="submitCharge" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div class="flex flex-col gap-2">
      <label class="px-2" for="supplier" :class="errors.supplier ? 'text-red' : 'text-black/50'">
        Fournisseur
      </label>
      <select id="supplier" class="outline-none w-full px-4 py-2 border rounded-md"
        :class="errors.supplier ? 'border-red placeholder:text-red text-red' : 'border-gray'" v-model="charge.supplier"
        @input="errors.supplier = ''">
        <option value="" disabled selected>Choisir un fournisseur</option>
        <option v-for="(supplier, i) in suppliers" :key="i" :value="supplier.name">
          {{ supplier.name }}
        </option>
      </select>
      <span v-if="errors.supplier" class="italic text-red text-xs">
        {{ errors.supplier }}
      </span>
    </div>
    <div class="flex flex-col gap-2">
      <label class="px-2" for="product" :class="errors.product ? 'text-red' : 'text-black/50'">
        Produit
      </label>
      <select id="supplier" class="outline-none w-full px-4 py-2 border rounded-md"
        :class="errors.product ? 'border-red placeholder:text-red text-red' : 'border-gray'" v-model="charge.product"
        @input="errors.product = ''">
        <option value="" disabled selected>Choisir un produit</option>
        <option v-for="(prod, i) in products" :key="i" :value="prod.name">
          {{ prod.name }}
        </option>
      </select>
      <span v-if="errors.product" class="italic text-red text-xs">
        {{ errors.product }}
      </span>
    </div>
    <div class="relative flex flex-col gap-2">
      <label class="px-2" for="size" :class="errors.size ? 'text-red' : 'text-black/50'">
        Quantité
      </label>
      <input type="text" id="size" class="outline-none w-full px-4 py-2 border rounded-md"
        :class="errors.size ? 'border-red placeholder:text-red text-red' : 'border-gray'" placeholder="2"
        v-model="charge.size" @input="errors.size = ''" />
      <span v-if="errors.size" class="italic text-red text-xs">
        {{ errors.size }}
      </span>
      <span class="absolute bottom-0 right-0 px-4 py-2 bg-second text-white rounded-md">
        {{ unite }}
      </span>
    </div>
    <div class="flex flex-col gap-2">
      <label class="px-2" for="price" :class="errors.price ? 'text-red' : 'text-black/50'">
        Montant
      </label>
      <input type="text" id="price" class="outline-none w-full px-4 py-2 border rounded-md"
        :class="errors.price ? 'border-red placeholder:text-red text-red' : 'border-gray'" placeholder="200"
        v-model="charge.price" @input="errors.price = ''" />
      <span v-if="errors.price" class="italic text-red text-xs">
        {{ errors.price }}
      </span>
    </div>
    <div class="lg:col-span-2 flex justify-end">
      <button type="submit"
        class="bg-main text-white px-10 py-2 rounded-md hover:bg-main/80 transition disabled:bg-main/50 disabled:cursor-wait flex justify-center items-center"
        :disabled="loading">
        <span v-if="loading" class="loading"></span>
        <span v-else>Sauvegarder</span>
      </button>
    </div>
  </form>
</template>
