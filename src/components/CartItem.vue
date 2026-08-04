<script setup>
import { computed } from 'vue'

import Money from './ui/Money.vue'
import Delete from './icons/Delete.vue'

const props = defineProps(['item'])

const showNumber = computed(() => (props.item.number > 1 ? `${props.item.number}×` : ''))
</script>

<template>
  <!-- The whole row still removes the line — that is how the till has always
       worked — but the bin now says so, instead of a red curtain on hover. -->
  <div
    class="group relative border-b last:border-none border-border flex items-start gap-3 py-3 px-2 cursor-pointer w-full
      transition-colors hover:bg-danger/[.06]"
  >
    <img v-if="item.image" :src="item.image" :alt="item.name" class="h-12 w-12 object-cover rounded-lg shrink-0">
    <div class="flex flex-col gap-1 min-w-0 flex-1">
      <h3 class="font-bree-serif text-[15px] leading-tight">
        <span v-if="showNumber" class="text-main">{{ showNumber }}</span>
        {{ item.name }}
        <span v-if="item.size" class="uppercase text-main">({{ item.size }})</span>
      </h3>
      <p v-if="item.viandes?.length || item.sauces?.length || item.extras?.length" class="flex flex-col gap-0.5 text-black/55 text-xs">
        <span v-if="item.viandes?.length">Viandes : {{ item.viandes.join(', ') }}</span>
        <span v-if="item.sauces?.length">Sauces : {{ item.sauces.join(', ') }}</span>
        <span v-if="item.extras?.length">Extras : {{ item.extras.join(', ') }}</span>
      </p>
      <p v-if="item.note" class="text-xs text-[#7a5c00] bg-yellow/[.22] rounded-md px-2 py-1 self-start">
        Note : {{ item.note }}
      </p>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <Money :value="item.price" :decimals="false" />
      <span class="w-8 h-8 rounded-lg flex items-center justify-center text-black/30 transition-colors group-hover:bg-danger group-hover:text-white">
        <delete />
      </span>
    </div>
  </div>
</template>
