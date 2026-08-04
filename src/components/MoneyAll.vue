<script setup>
import { computed, ref } from 'vue';
import Image1 from '../assets/images/1.jpg';
import Image2 from '../assets/images/2.jpg';
import Image5 from '../assets/images/5.jpg';
import Image10 from '../assets/images/10.jpg';
import Image20 from '../assets/images/20.jpg';
import Image50 from '../assets/images/50.jpg';
import Image100 from '../assets/images/100.jpg';
import Image200 from '../assets/images/200.jpg';

const emit = defineEmits(['totalCaisse', 'resetCaisse', 'applyTotal'])

// The count and its two actions can live outside the card — see calc/Add, where
// they share one footer with the close's own total instead of stacking two
// button rows on top of each other.
defineProps({
  showSummary: { type: Boolean, default: true },
})

// Notes first, then coins — the order a drawer is counted in
const money = ref([
  { value: 200, image: Image200, fois: 0 },
  { value: 100, image: Image100, fois: 0 },
  { value: 50, image: Image50, fois: 0 },
  { value: 20, image: Image20, fois: 0 },
  { value: 10, image: Image10, fois: 0 },
  { value: 5, image: Image5, fois: 0 },
  { value: 2, image: Image2, fois: 0 },
  { value: 1, image: Image1, fois: 0 },
])

const calculation = computed(() =>
  money.value.reduce((sum, item) => sum + item.value * (parseInt(item.fois) || 0), 0)
)

// The tally is live now. It used to need an "Ajouter" per denomination, which
// then locked that row: a miscount meant resetting the whole drawer.
const push = () => emit('totalCaisse', calculation.value)

const step = (item, by) => {
  item.fois = Math.max(0, (parseInt(item.fois) || 0) + by)
  push()
}

const onInput = (item) => {
  const n = parseInt(item.fois)
  item.fois = Number.isNaN(n) || n < 0 ? 0 : n
  push()
}

const deleteNum = () => {
  money.value.forEach((item) => { item.fois = 0 })
  emit('resetCaisse')
}

defineExpose({ reset: deleteNum })
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- One card per denomination: the note big enough to recognise, how many
         of them, and what that line comes to. -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <!-- One row per denomination: note, what it is worth, how many. The
           stepper is sized to a finger, not to the card. -->
      <div
        v-for="(item, i) in money"
        :key="i"
        class="rounded-xl border bg-white p-2.5 flex items-center gap-3 transition-colors"
        :class="item.fois > 0 ? 'border-main/40' : 'border-border'"
      >
        <img class="h-12 w-[70px] object-contain rounded-md shrink-0" :src="item.image" :alt="`${item.value} DH`">
        <div class="flex flex-col min-w-0">
          <span class="font-bree-serif text-lg tabular-nums leading-none">
            {{ item.value }} <span class="text-xs text-black/45">DH</span>
          </span>
          <span class="text-[12.5px] tabular-nums mt-0.5" :class="item.fois > 0 ? 'text-main font-medium' : 'text-black/40'">
            = {{ (item.value * (parseInt(item.fois) || 0)).toLocaleString('fr-FR') }} DH
          </span>
        </div>

        <div class="ml-auto flex items-center rounded-lg border border-border overflow-hidden shrink-0">
          <button
            type="button"
            class="w-10 h-10 text-xl bg-gray-light transition-colors hover:bg-main hover:text-white active:scale-95"
            @click.prevent="step(item, -1)"
          >
            −
          </button>
          <input
            v-model="item.fois"
            type="number"
            min="0"
            inputmode="numeric"
            class="w-12 h-10 text-center tabular-nums outline-none border-x border-border
              focus:ring-[3px] focus:ring-main/[.15]"
            @input="onInput(item)"
          >
          <button
            type="button"
            class="w-10 h-10 text-xl bg-gray-light transition-colors hover:bg-main hover:text-white active:scale-95"
            @click.prevent="step(item, 1)"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <!-- What the drawer holds, and the one move that follows from it -->
    <div v-if="showSummary" class="flex flex-wrap items-center gap-4 rounded-xl bg-gray-light border border-border px-4 py-3">
      <div class="flex items-baseline gap-2.5">
        <span class="text-black/55">Total compté</span>
        <span :key="calculation" class="animate-pop font-bree-serif text-[30px] tabular-nums text-main">
          {{ calculation.toLocaleString('fr-FR') }}
          <span class="text-base text-black/45">DH</span>
        </span>
      </div>
      <div class="ml-auto flex gap-2.5">
        <button
          type="button"
          class="h-12 px-5 rounded-lg border border-border bg-white text-black/70 transition-colors hover:bg-black/[.06]"
          @click.prevent="deleteNum"
        >
          Réinitialiser
        </button>
        <button
          type="button"
          class="h-12 px-5 rounded-lg bg-main text-white transition-colors hover:bg-main-hover disabled:opacity-45 disabled:pointer-events-none"
          :disabled="calculation === 0"
          @click.prevent="emit('applyTotal', calculation)"
        >
          Reporter dans Nouvelle caisse
        </button>
      </div>
    </div>
  </div>
</template>
