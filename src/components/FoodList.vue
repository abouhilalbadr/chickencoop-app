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
    <Tacos v-if="item.image === 'tacos'" class="h-12" />
    <Sandwish v-if="item.image === 'sandwish'" class="h-16" />
    <Burger v-if="item.image === 'burger'" class="h-16" />
    <Salade v-if="item.image === 'salade'" class="h-16" />
    <Jus v-if="item.image === 'jus'" class="h-16" />
    <Drink v-if="item.image === 'boissons'" class="h-16" />
    <Naan v-if="item.image === 'cheese naan'" class="h-16" />
    <Wrap v-if="item.image === 'wrap'" class="h-16" />
    <Fries v-if="item.image === 'frites'" class="h-16" />
    <Wings v-if="item.image === 'wings'" class="h-16" />
    <span class="capitalize">{{ item.name }}</span>
  </button>
</template>