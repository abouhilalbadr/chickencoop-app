<script setup>
import { useStore } from "../store"
import Money from "./ui/Money.vue"

const store = useStore()
defineProps(['item'])
</script>

<template>
  <!-- The catalogue photos are shot on white, so the name and the price sit
       under the image on their own row instead of on a scrim over it: a light
       dish used to swallow both. -->
  <button
    type="button"
    class="group bg-white border border-black/[.07] rounded-xl shadow-sm overflow-hidden flex flex-col text-left
      transition-all hover:shadow-lg hover:border-main/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main/40"
  >
    <!-- The photo is the thing being picked, so it gets the room: the name and
         the price ride under it on one line.

         The image is taken out of the flow. Left in it, a square photo stretched
         the box past the 4:3 ratio — `h-full` on the image resolves against a
         height the ratio is still deriving — so the catalogue's 1:1, 3:2 and
         1079×925 shots each produced a different card height. -->
    <span class="relative block w-full aspect-[4/3] bg-gray-light overflow-hidden">
      <img :src="item.image" :alt="item.name" class="absolute inset-0 w-full h-full object-contain p-1.5">
    </span>
    <span class="flex items-center justify-between gap-2 px-3 py-3 border-t border-border">
      <span class="font-bree-serif text-base leading-tight line-clamp-2">{{ item.name }}</span>
      <Money
        class="shrink-0 text-main"
        :value="store.glovo ? item.priceGlovo : item.price"
        size="total"
        :decimals="false"
      />
    </span>
  </button>
</template>
