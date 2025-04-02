<script setup>
import Tacos from "./icons/food/Tacos.vue";
import Sandwish from "./icons/food/Sandwish.vue";
import Burger from "./icons/food/Burger.vue";
import Salade from "./icons/food/Salade.vue";
import Jus from "./icons/food/Jus.vue";
import Drink from "./icons/food/Drink.vue";
import Naan from "./icons/food/Naan.vue";
import Wrap from "./icons/food/Wrap.vue";
import Fries from "./icons/food/Fries.vue";
import Wings from "./icons/food/Wings.vue";
import Pizza from "./icons/food/Pizza.vue";
import Oven from "./icons/food/Oven.vue";
import Panini from "./icons/food/Panini.vue";
import Breakfast from "./icons/food/Breakfast.vue";
import Dessert from "./icons/food/Dessert.vue";
import Shawarma from "./icons/food/Shawarma.vue"
import Plate from "./icons/food/Plate.vue"
import Bowl from "./icons/food/Bowl.vue"
import Amuse from "./icons/food/Amuse.vue"

defineProps(['food', 'showMenu'])
const emit = defineEmits(['active'])

const setActive = (i) => {
  emit('active', i)
}

</script>

<template>
  <button
    v-for="(item, i) in food"
    :key="i"
    class="border border-border rounded-md px-2 py-2 hover:bg-third hover:border-third transition-all flex flex-col justify-center items-center"
    :class="(!showMenu && item.active) && 'bg-third'"
    @click="setActive(i)"
  >
    <Tacos v-if="item.image === 'tacos'" class="h-10" />
    <Sandwish v-if="item.image === 'sandwish'" class="h-10" />
    <Burger v-if="item.image === 'burger'" class="h-10" />
    <Salade v-if="item.image === 'salade'" class="h-10" />
    <Jus v-if="item.image === 'jus'" class="h-10" />
    <Drink v-if="item.image === 'boissons'" class="h-10" />
    <Naan v-if="item.image === 'cheese naan'" class="h-10" />
    <Wrap v-if="item.image === 'wrap'" class="h-10" />
    <Fries v-if="item.image === 'frites'" class="h-10" />
    <Wings v-if="item.image === 'wings'" class="h-10" />
    <Pizza v-if="item.image === 'pizza'" class="h-10" />
    <Oven v-if="item.image === 'oven'" class="h-10" />
    <Panini v-if="item.image === 'panini'" class="h-10" />
    <Breakfast v-if="item.image === 'breakfast'" class="h-10" />
    <Dessert v-if="item.image === 'dessert'" class="h-10" />
    <Shawarma v-if="item.image === 'shawarma'" class="h-10" />
    <Plate v-if="item.image === 'plate'" class="h-10" />
    <Bowl v-if="item.image === 'bol'" class="h-10" />
    <Amuse v-if="item.image === 'amuse'" class="h-10" />
    <span class="capitalize text-xs">{{ item.name }}</span>
  </button>
</template>
