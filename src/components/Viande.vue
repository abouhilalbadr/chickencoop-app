<script setup>
import { ref, reactive } from "vue"

const selectedViande = ref([])
const emit = defineEmits(['saveViandes'])
const props = defineProps(['settings', 'max'])

const more = reactive(JSON.parse(props.settings[0]?.more))
const viandes = more.viandes.items

const toggleViande = (viande) => {
  const index = selectedViande.value.indexOf(viande);
  if (selectedViande.value.length < parseInt(props.max)) {
    if (index > -1)
      selectedViande.value.splice(index, 1);
    else
      selectedViande.value.push(viande)
  } else {
    if (index > -1)
      selectedViande.value.splice(index, 1);
  }
  emit('saveViandes', {viandes: selectedViande.value})

}

</script>
<template>
    <div class="flex items-center flex-wrap gap-4">
      <button
        v-for="(viande, i) in viandes"
        class="rounded-md border border-main px-10 py-2 font-bold first-letter:capitalize"
        :class="selectedViande.includes(viande) ? 'bg-main text-white' : 'text-main'"
        @click="toggleViande(viande)"
      >
        {{ viande }}
      </button>
    </div>
</template>