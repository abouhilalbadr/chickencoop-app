<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'

const props = defineProps(['token'])

const charge = reactive({
  supplier: '',
  product: '',
  price: '',
})
const loading = ref(false)
const errors = ref({
  supplier: '',
  product: '',
  price: '',
})

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

</script>
<template>
  <form @submit.prevent="submitCharge" class="flex flex-col gap-8">
    <div class="flex flex-col gap-2">
      <label
        class="px-2" for="supplier"
        :class="errors.supplier ? 'text-red' : 'text-black/50'"
      >
        Fournisseur
      </label>
      <input
        type="text" id="supplier"
        class="outline-none w-full px-4 py-2 border rounded-md"
        :class="errors.supplier ? 'border-red placeholder:text-red text-red' : 'border-gray'"
        placeholder="Favorita"
        v-model="charge.supplier"
        @input="errors.supplier = ''"
      />
      <span
        v-if="errors.supplier"
        class="italic text-red text-xs"
      >
        {{ errors.supplier }}
      </span>
    </div>
    <div class="flex flex-col gap-2">
      <label
        class="px-2" for="product"
        :class="errors.product ? 'text-red' : 'text-black/50'"
      >
        Produit
      </label>
      <input
        type="text" id="product"
        class="outline-none w-full px-4 py-2 border rounded-md"
        :class="errors.product ? 'border-red placeholder:text-red text-red' : 'border-gray'"
        placeholder="Frite"
        v-model="charge.product"
        @input="errors.product = ''"
      />
      <span
        v-if="errors.product"
        class="italic text-red text-xs"
      >
        {{ errors.product }}
      </span>
    </div>
    <div class="flex flex-col gap-2">
      <label
        class="px-2" for="price"
        :class="errors.price ? 'text-red' : 'text-black/50'"
      >
        Montant
      </label>
      <input
        type="text" id="price"
        class="outline-none w-full px-4 py-2 border rounded-md"
        :class="errors.price ? 'border-red placeholder:text-red text-red' : 'border-gray'"
        placeholder="200"
        v-model="charge.price"
        @input="errors.price = ''"
      />
      <span
        v-if="errors.price"
        class="italic text-red text-xs"
      >
        {{ errors.price }}
      </span>
    </div>
    <div class="self-end">
      <button type="submit" class="bg-main text-white px-10 py-2 rounded-md hover:bg-main/80 transition disabled:bg-main/50 disabled:cursor-wait flex justify-center items-center" :disabled="loading">
        <span v-if="loading" class="loading"></span>
        <span v-else>Sauvegarder</span>
      </button>
    </div>
  </form>
</template>
