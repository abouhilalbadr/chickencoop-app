<script setup>
import { ref, reactive } from "vue"

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
    <div class="flex items-center flex-wrap gap-4">
      <button
        class="rounded-md border border-main px-6 py-1 font-bold first-letter:capitalize"
        :class="selectedExtra.includes('piment') ? 'bg-main text-white' : 'text-main'"
        @click="toggleExtra('piment')"
      >
        Piment
      </button>
      <button
        v-for="(extra, i) in extras"
        class="rounded-md border border-main px-6 py-1 font-bold first-letter:capitalize"
        :class="selectedExtra.includes(extra) ? 'bg-main text-white' : 'text-main'"
        @click="toggleExtra(extra)"
      >
        {{ extra }}
      </button>
    </div>
</template>
