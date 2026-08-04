<script setup>
import { ref, reactive } from "vue"
import OptionChip from "./ui/OptionChip.vue"

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
  <div class="flex items-center flex-wrap gap-2.5">
    <OptionChip
      v-for="(sauce, i) in sauces"
      :key="i"
      :label="sauce"
      :selected="selectedSauce.includes(sauce)"
      @click="toggleSauce(sauce)"
    />
  </div>
</template>
