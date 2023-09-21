<script setup>
import { ref, reactive } from "vue"

const selectedSauce = ref([])
const emit = defineEmits(['saveSauces'])
const props = defineProps(['settings'])

const more = reactive(JSON.parse(props.settings[0]?.more))
const sauces = more.sauces.items


const toggleSauce = (sauce) => {
  const index = selectedSauce.value.indexOf(sauce);
  if (index > -1)
    selectedSauce.value.splice(index, 1);
  else
    selectedSauce.value.push(sauce)
  emit('saveSauces', {sauces: selectedSauce.value, price: more.sauces.price, operation: (index > -1 ? 'minus' : 'plus')})
}

</script>
<template>
  <div class="flex items-center flex-wrap gap-4">
      <button
        v-for="(sauce, i) in sauces"
        class="rounded-md border border-main px-6 py-1 font-bold first-letter:capitalize"
        :class="selectedSauce.includes(sauce) ? 'bg-main text-white' : 'text-main'"
        @click="toggleSauce(sauce)"
      >
        {{ sauce }}
      </button>
    </div>
</template>
