<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

import Money from '../MoneyAll.vue';
import Amount from '../ui/Money.vue';
import AppButton from '../ui/AppButton.vue';
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
// What the drawer actually holds, denomination by denomination
const caisseTotal = ref(0)
// The counter lives in its own card; the section header drives its reset
const moneyRef = ref(null)
const errors = ref({
  date: '',
  total: '',
  charges: '',
  daily: '',
  last: '',
  newC: '',
})

// What the screen shows: the drawer as counted, denomination by denomination.
// Nouvelle caisse is the caissier's own figure and is typed by hand, so it no
// longer feeds this.
const calculateTotal = computed(() => caisseTotal.value)

// What gets filed: the net of the day, as it always has been. It is not shown
// — the count is the number the caissier is working against.
const netTotal = computed(
  () => ((parseFloat(calculation.daily) || 0) + (parseFloat(calculation.last) || 0)) - (parseFloat(calculation.charges) || 0) - (parseFloat(calculation.newC) || 0)
)

// Date the picker shows, derived from the business day being closed
const pickedDate = computed(() => (calculation.date ? dayToDate(calculation.date) : null))

// The control writes the day out in French itself — vue-datepicker's own
// `EEEE d MMMM` tokens render in English whatever `locale` says.
const formatPicked = (date) => {
  const label = formatDay(dateToDay(date))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

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
        total: netTotal.value,
        charges: calculation.charges,
        // Send the business day key as-is: wrapping it in a Date would turn it
        // back into an instant and reintroduce the timezone shift
        date: calculation.date,
        last: parseFloat(calculation.last),
        // Typed by hand now, so round it: the API only accepts whole dirhams
        newC: Math.round(parseFloat(calculation.newC) || 0),
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
  <!-- With the day's figures off the screen, the close is one job: count the
       drawer for a given day and file it. So it is one card — the day chosen in
       its header, the count in its body, the result in its footer — instead of
       a lone date tile floating over a second box. -->
  <form @submit.prevent="submitCalc" class="relative flex flex-col gap-4">
    <div v-if="loadingCalc" class="absolute z-30 inset-0 bg-white/70 flex justify-center items-center">
      <span class="loading !text-main"></span>
    </div>

    <!-- A toolbar, not a second card header: the panel around this already says
         what the screen is, and a bordered card inside a bordered card doubled
         every rule on the page. -->
    <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
      <!-- One control, not a label plus a short date plus the same date written
           out: the picker itself shows the French day through `format`. -->
      <div class="w-72">
        <!-- Teleported: the panel around this clips its overflow, which cut the
             calendar off at the card's edge. -->
        <VueDatePicker
          :model-value="pickedDate"
          :format="formatPicked"
          :min-date="minDate"
          :max-date="maxDate"
          :enable-time-picker="false"
          :clearable="false"
          auto-apply
          teleport="body"
          placeholder="Choisir la journée"
          locale="fr"
          @update:model-value="onDatePicked"
        />
      </div>

      <!-- Nothing counted, nothing to clear -->
      <button
        v-if="caisseTotal > 0"
        type="button"
        class="ml-auto text-[13px] text-black/55 underline underline-offset-2 hover:text-danger"
        @click="moneyRef?.reset()"
      >
        Réinitialiser le comptage
      </button>
      <p v-if="errors.date" class="w-full text-danger text-[13px]">{{ errors.date }}</p>
    </div>

    <section>
      <Money ref="moneyRef" :show-summary="false" @totalCaisse="calcTotal" @resetCaisse="resetTotal" />

      <!-- One band for what gets filed: the cash left for tomorrow, typed, and
           the drawer total the count came to. -->
      <footer class="mt-4 px-4 py-4 rounded-xl border border-border bg-gray-light flex flex-wrap items-center gap-x-6 gap-y-4">
        <!-- Typed by hand: how much cash stays in the till for tomorrow, which
             is the caissier's call and not what the drawer happens to hold. -->
        <div class="flex items-center gap-3">
          <label
            class="text-[11px] font-bold uppercase tracking-[.07em]" for="newC"
            :class="errors.newC ? 'text-danger' : 'text-black/50'"
          >
            Nouvelle caisse
          </label>
          <div class="relative">
            <input
              type="text" id="newC"
              class="h-14 w-48 pl-4 pr-14 border rounded-lg outline-none tabular-nums font-bree-serif text-2xl bg-white
                focus:border-main focus:ring-[3px] focus:ring-main/[.15]"
              :class="errors.newC ? 'border-danger' : 'border-border'"
              placeholder="0"
              v-model="calculation.newC"
              @input="errors.newC = ''"
            />
            <span class="absolute top-1/2 right-4 -translate-y-1/2 text-black/45">DH</span>
          </div>
        </div>

        <div class="ml-auto flex items-center gap-5 lg:pl-6 lg:border-l border-border">
          <div class="flex flex-col gap-0.5">
            <span class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Total calculé</span>
            <Amount :key="calculateTotal" class="animate-pop" :value="calculateTotal" size="hero" tone="brand" :decimals="false" />
          </div>
          <AppButton type="submit" variant="primary" size="xl" :loading="loading">Sauvegarder</AppButton>
        </div>

        <p v-if="errors.newC" class="w-full text-danger text-[13px] -mt-1">{{ errors.newC }}</p>
      </footer>
    </section>
  </form>
</template>
