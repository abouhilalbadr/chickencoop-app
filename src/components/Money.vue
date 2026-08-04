<script setup>
import Delete from './icons/Delete.vue';

const emit = defineEmits(['reset', 'add'])

// The notes a customer actually hands over. Tapping one adds its value to what
// has been paid.
const NOTES = [
  { value: 200, image: new URL('../assets/images/200.jpg', import.meta.url).href },
  { value: 100, image: new URL('../assets/images/100.jpg', import.meta.url).href },
  { value: 50, image: new URL('../assets/images/50.jpg', import.meta.url).href },
  { value: 20, image: new URL('../assets/images/20.jpg', import.meta.url).href },
]
</script>

<template>
  <!-- The note is recognised by its colour from a metre away, so the picture
       gets the whole button and the value is written on it as a fallback. -->
  <div class="grid grid-cols-2 gap-2">
    <button
      v-for="note in NOTES"
      :key="note.value"
      class="group h-24 p-2 rounded-xl border border-border bg-white flex items-center gap-2 transition-all
        hover:border-main hover:shadow-lg active:scale-95 active:duration-[0s]"
      :aria-label="`${note.value} DH`"
      @click="emit('add', note.value)"
    >
      <!-- The whole note, uncropped — half a banknote is not recognisable —
           with the amount spelled out beside it for the same reason. -->
      <img :src="note.image" :alt="''" class="h-full w-auto object-contain rounded-md">
      <span class="flex-1 font-bree-serif text-2xl tabular-nums">
        {{ note.value }}
        <span class="text-sm text-black/45">DH</span>
      </span>
    </button>
    <button
      @click="emit('reset')"
      class="col-span-2 h-14 rounded-xl bg-gray-light border border-border text-black/70 flex justify-center items-center gap-2.5
        transition-colors hover:bg-black/[.06] active:scale-95 active:duration-[0s]"
    >
      <delete />
      <span>Effacer le montant payé</span>
    </button>
  </div>
</template>
