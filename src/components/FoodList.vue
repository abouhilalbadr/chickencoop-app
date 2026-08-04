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
import CategoryTile from "./ui/CategoryTile.vue"

defineProps(['food', 'showMenu'])
const emit = defineEmits(['active'])

// The category's icon, keyed the way the API names it
const ICONS = {
  tacos: Tacos,
  sandwish: Sandwish,
  burger: Burger,
  salade: Salade,
  jus: Jus,
  boissons: Drink,
  'cheese naan': Naan,
  wrap: Wrap,
  frites: Fries,
  wings: Wings,
  pizza: Pizza,
  oven: Oven,
  panini: Panini,
  breakfast: Breakfast,
  dessert: Dessert,
  shawarma: Shawarma,
  plate: Plate,
  bol: Bowl,
  amuse: Amuse,
}

const setActive = (i) => {
  emit('active', i)
}
</script>

<template>
  <!-- The selected category is a filled brand tile. It used to be the yellow
       highlight, which also meant "warning" everywhere else in the product. -->
  <CategoryTile
    v-for="(item, i) in food"
    :key="i"
    :label="item.name"
    :active="!showMenu && item.active"
    @click="setActive(i)"
  >
    <component
      :is="ICONS[item.image]"
      v-if="ICONS[item.image]"
      class="h-8"
      :class="(!showMenu && item.active) ? 'fill-white' : 'fill-main'"
    />
  </CategoryTile>
</template>
