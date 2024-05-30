<script setup>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

import Money from '../MoneyAll.vue';

const props = defineProps(['token'])

const calculation = reactive({
  date: '',
  total: 0,
  charges: 0,
  daily: 0,
  last: 0,
  newC: 0,
})
const loading = ref(false)
const loadingCalc = ref(false)
const minDate = new Date('05/30/2024')
const errors = ref({
  date: '',
  total: '',
  charges: '',
  daily: '',
  last: '',
  newC: '',
})

const calculateTotal = computed(
  () => ((parseFloat(calculation.daily) || 0) + (parseFloat(calculation.last) || 0)) - (parseFloat(calculation.charges) || 0) - (parseFloat(calculation.newC) || 0)
)

const formatValue = (item) => {
  return new Date(item)
}

const resetPay = () => {
  calculation.newC = 0
}

const addNum = (num) => {
    if ((typeof calculation.newC) === 'string') {
      calculation.newC = parseInt(calculation.newC || 0)
    }
    calculation.newC = calculation.newC + num
  }

const getDailyDetails = async (date) => {
  errors.value = {
    date: '',
    total: '',
    charges: '',
    daily: '',
    last: '',
    newC: '',
  }
  loadingCalc.value = true
  const currentDay = new Date(date)
  calculation.date = currentDay
  if (currentDay.getFullYear() < 2023) return false
  try {
    const { data } = await axios.post('/calculations/daily', {
      date: new Date(date)
    }, {
      headers: {
        'Authorization': `Bearer ${props.token}`
      }
    })
    calculation.charges = data.data.charges
    calculation.daily = data.data.daily
    calculation.last = data.data.last
    loadingCalc.value = false
  } catch (error) {
    loadingCalc.value = false
  }
}

const validateInputs = () => {
  let isValid = true
  if (!calculation.daily) {
    isValid = false
    errors.value.daily = 'Le Total de jour est requis'
  }
  if (!calculation.charges) {
    isValid = false
    errors.value.charges = 'Les charges sont requises'
  }
  if (!calculation.last) {
    isValid = false
    errors.value.last = 'La caisse précédente est requis'
  }
  if (!calculation.newC) {
    isValid = false
    errors.value.newC = 'La nouvelle caisse est requis'
  }
  if (!calculation.date) {
    isValid = false
    errors.value.date = 'La date est requis'
  }
  return isValid

}

const submitCalc = async () => {
  try {
    const result = validateInputs()
    if (result) {
      loading.value = true
      const { data } = await axios.post('/calculations', {
        daily: calculation.daily,
        total: calculateTotal.value,
        charges: calculation.charges,
        date: new Date(calculation.date),
        last: parseFloat(calculation.last),
        newC: parseFloat(calculation.newC),
      },
        {
          headers: {
            'Authorization': `Bearer ${props.token}`
          }
        }
      )
      if (data?.data?.id) {
        location.reload()
      }
    }
  } catch (error) {
    alert("Échec de la création du calculation, veuillez réessayer")
    loading.value = false
  }
}

</script>
<template>
  <form @submit.prevent="submitCalc" class="flex flex-col gap-8 px-6">
    <div class="flex flex-col gap-2">
      <label
        class="px-2" for="date"
        :class="errors.date ? 'text-red' : 'text-black/50'"
      >
        Date
      </label>
      <VueDatePicker
        :model-value="formatValue(calculation.date)"
        format="dd/MM/yyyy"
        :min-date="minDate"
        placeholder="Date de jour"
        @update:model-value="getDailyDetails($event)"
      />
      <span v-if="errors.date" class="text-red italic text-sm px-2">
        {{ errors.date }}
      </span>
    </div>
    <div class="relative flex flex-col gap-8" :class="loadingCalc ? 'p-4' : ''">
      <div v-if="loadingCalc" class="absolute z-30 inset-0 bg-black/50 flex justify-center items-center">
        <span class="loading"></span>
      </div>
      <div class="flex flex-col gap-2">
        <label
          class="px-2" for="newC"
          :class="errors.newC ? 'text-red' : 'text-black/50'"
        >
          Nouveau caisse
        </label>
        <input
          type="text" id="newC"
          class="outline-none w-full px-4 py-2 bg-gray-light border rounded-md"
          :class="errors.newC ? 'border-red placeholder:text-red text-red' : 'border-gray-dark'"
          placeholder="200"
          v-model="calculation.newC"
        />
        <span v-if="errors.newC">
          {{ errors.newC }}
        </span>
      </div>
      <money @reset="resetPay" @add="addNum" />
    </div>
    <div class="self-end">
      <button type="submit" class="bg-main text-white px-10 py-2 rounded-md hover:bg-main/80 transition disabled:bg-main/50 disabled:cursor-wait flex justify-center items-center" :disabled="loading">
        <span v-if="loading" class="loading"></span>
        <span v-else>Sauvegarder</span>
      </button>
    </div>
  </form>
</template>
