<script setup>
import { ref, reactive } from "vue"
import OptionChip from "./ui/OptionChip.vue"

const selectedExtra = ref([])
const emit = defineEmits(['saveExtras'])
const props = defineProps(['settings'])

const more = reactive(JSON.parse(props.settings[0]?.more))
const extras = more.extras.items

const toggleExtra = (extra) => {
  const index = selectedExtra.value.indexOf(extra);
  if (index > -1)
    selectedExtra.value.splice(index, 1);
  else
    selectedExtra.value.push(extra)
  emit('saveExtras', {extras: selectedExtra.value, price: extra === 'piment' ? 5 : more.extras.price, operation: (index > -1 ? 'minus' : 'plus')})
}
</script>

<template>
  <div class="flex items-center flex-wrap gap-2.5">
    <!-- Piment is priced apart from the catalogue, so it is listed apart -->
    <OptionChip
      label="piment"
      :selected="selectedExtra.includes('piment')"
      @click="toggleExtra('piment')"
    />
    <OptionChip
      v-for="(extra, i) in extras"
      :key="i"
      :label="extra"
      :selected="selectedExtra.includes(extra)"
      @click="toggleExtra(extra)"
    />
  </div>
</template>
