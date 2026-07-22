<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

import Money from '../MoneyAll.vue';
import { businessDay, shiftBusinessDay, dayToDate, dateToDay, formatDay } from '../../businessDay';

const props = defineProps(['token'])

// How many days back the API lets a non-admin file a close (BACKFILL_WINDOW_DAYS)
const BACKFILL_WINDOW_DAYS = 1

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
// The picker is bounded to the window the API accepts: the current business day,
// or the one before it when the books are only closed the next morning.
const today = ref(businessDay())
const minDate = computed(() => dayToDate(shiftBusinessDay(today.value, -BACKFILL_WINDOW_DAYS)))
const maxDate = computed(() => dayToDate(today.value))
const caisseTotal = ref(0)
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

// Date the picker shows, derived from the business day being closed
const pickedDate = computed(() => (calculation.date ? dayToDate(calculation.date) : null))

const onDatePicked = (value) => {
  if (!value) return
  getDailyDetails(dateToDay(value))
}

// `day` is a 'YYYY-MM-DD' business day key, not a timestamp
const getDailyDetails = async (day) => {
  errors.value = {
    date: '',
    total: '',
    charges: '',
    daily: '',
    last: '',
    newC: '',
  }
  loadingCalc.value = true
  calculation.date = day
  try {
    const { data } = await axios.post('/calculations/daily', {
      date: day
    }, {
      headers: {
        'Authorization': `Bearer ${props.token}`
      }
    })
    // The server decides which day this really is; follow it
    if (data.data.day) calculation.date = data.data.day
    calculation.charges = data.data.charges
    calculation.daily = data.data.daily
    calculation.last = data.data.last
    loadingCalc.value = false
  } catch (error) {
    errors.value.date = error?.response?.data?.message || "Impossible de charger le total de cette date"
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
        // Send the business day key as-is: wrapping it in a Date would turn it
        // back into an instant and reintroduce the timezone shift
        date: calculation.date,
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
    } else {
      alert("Échec de la création du calculation, veuillez réessayer")
    }
  } catch (error) {
    console.log(error);
    alert("Échec de la création du calculation, veuillez réessayer")
    loading.value = false
  }
}

const calcTotal = (total) => {
  caisseTotal.value = total
}

const resetTotal = () => {
  caisseTotal.value = 0
}

onMounted(() => {
  getDailyDetails(today.value)
})

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
        :model-value="pickedDate"
        format="dd/MM/yyyy"
        :min-date="minDate"
        :max-date="maxDate"
        :enable-time-picker="false"
        auto-apply
        placeholder="Date de jour"
        @update:model-value="onDatePicked"
      />
      <span v-if="calculation.date" class="px-2 text-sm text-black/50 capitalize">
        {{ formatDay(calculation.date) }}
      </span>
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
          Nouvelle caisse
        </label>
        <input
          type="text" id="newC"
          class="outline-none w-full px-4 py-2 bg-gray-light border rounded-md"
          :class="errors.newC ? 'border-red placeholder:text-red text-red' : 'border-gray-dark'"
          placeholder="200"
          v-model="calculation.newC"
          @input="errors.newC = ''"
        />
        <span v-if="errors.newC" class="text-red italic text-sm px-2">
          {{ errors.newC }}
        </span>
      </div>
    </div>
    <div class="flex flex-col py-4 border border-gray rounded-md p-4">
      <label class="px-2 text-black/50 text-2xl" for="daily">
        Calculer le total de la nouvelle caisse
      </label>
      <Money @totalCaisse="calcTotal" @resetCaisse="resetTotal" />
    </div>
    <div class="self-end">
      <button type="submit" class="bg-main text-white px-10 py-2 rounded-md hover:bg-main/80 transition disabled:bg-main/50 disabled:cursor-wait flex justify-center items-center" :disabled="loading">
        <span v-if="loading" class="loading"></span>
        <span v-else>Sauvegarder</span>
      </button>
    </div>
  </form>
</template>
