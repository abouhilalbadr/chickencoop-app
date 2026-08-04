<script setup>
import { computed, ref, reactive, watch } from "vue"
import OptionChip from "./ui/OptionChip.vue"

const selectedViande = ref([])
const emit = defineEmits(['saveViandes'])
const props = defineProps(['settings', 'max'])

const more = reactive(JSON.parse(props.settings[0]?.more))
const viandes = more.viandes.items

const max = computed(() => parseInt(props.max) || 1)
const full = computed(() => selectedViande.value.length >= max.value)

const toggleViande = (viande) => {
  const index = selectedViande.value.indexOf(viande);
  if (selectedViande.value.length < max.value) {
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

// The tacos sizes carry different meat counts, so dropping to a smaller size
// has to drop the meats that no longer fit — the count is what is charged.
watch(max, (value) => {
  if (selectedViande.value.length > value) {
    selectedViande.value = selectedViande.value.slice(0, value)
    emit('saveViandes', { viandes: selectedViande.value })
  }
})
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <!-- How many are left, counted down as they are picked -->
    <div class="flex items-center gap-2 text-[13px]">
      <span
        class="tabular-nums font-medium px-2 py-0.5 rounded-full"
        :class="full ? 'bg-green/[.14] text-[#3c7a58]' : 'bg-black/[.06] text-black/70'"
      >
        {{ selectedViande.length }} / {{ max }}
      </span>
      <span class="text-black/55">
        {{ full ? 'Sélection complète' : `Encore ${max - selectedViande.length} au choix` }}
      </span>
    </div>
    <div class="flex items-center flex-wrap gap-2.5">
      <OptionChip
        v-for="(viande, i) in viandes"
        :key="i"
        :label="viande"
        :selected="selectedViande.includes(viande)"
        :disabled="full && !selectedViande.includes(viande)"
        @click="toggleViande(viande)"
      />
    </div>
  </div>
</template>
