<script setup>
import { ref, computed, reactive, onMounted } from "vue"
import axios from 'axios'

import { useStore } from "../store"

import Header from "../components/Header.vue";
import Card from "../components/Card.vue";
import AddButton from "../components/AddButton.vue";
import FoodList from "../components/FoodList.vue";
import TacosModal from "../components/TacosModal.vue";
import FoodModal from "../components/FoodModal.vue";
import MenuModal from "../components/MenuModal.vue";
import Panier from "../components/Cart.vue";
import OrdersNotif from "../components/OrdersNotif.vue"
import OrdersPrints from "../components/OrdersPrints.vue"
import Menu from "../components/icons/food/Menu.vue";
import PreOrder from "../components/PreOrder.vue";
import CategoryTile from "../components/ui/CategoryTile.vue";

const store = useStore()

const page = ref('caisse')
const cart = ref([])
const tacosModal = ref(false)
const foodModal = ref(false)
const menuModal = ref(false)
const step = ref(1)
const hideNext = ref(false)
const hidePrev = ref(true)
const currentFood = ref({})
const showMenu = ref(false)

const food = ref([])
const menu = ref([])
const allFood = ref({})

let settings = reactive([])

const notifications = computed(() => store.notifications.sort((a, b) => (new Date(b.updatedAt) - new Date(a.updatedAt))))
const prints = computed(() => store.prints || [])
const activeFood = computed(() => food.value.find((item) => ( item.active )))

const changePage = (p) => {
  if (p === 'caisse') {
    document.body.style.overflow = 'auto'
  } else if (p === 'preorder') {
    document.body.style.overflow = 'hidden'
  }
  page.value = p
}

const setActive = (i) => {
  showMenu.value = false
  food.value.map(item => item.active = false)
  food.value[i].active = true
}
const stepChanger = (e) => {
  if (e === 'next') {
    step.value += 1
    hideNext.value = (step.value >= 2)
    hidePrev.value = (step.value === 1)
  }
  else if (e === 'prev') {
    step.value -= 1
    hideNext.value = (step.value > 2)
    hidePrev.value = (step.value === 1)
  }
  else {
    step.value = 1
    hideNext.value = false
    hidePrev.value = true
  }
}
const openTacosModal = () => {
  tacosModal.value = true
}
const closeTacosModal = () => {
  tacosModal.value = false
}
const closeFoodModal = () => {
  foodModal.value = false
}
const closeMenuModal = () => {
  menuModal.value = false
}
const setCurrent = (i) => {
  currentFood.value = allFood.value[activeFood.value.image][i]
  foodModal.value = true
}
const setCurrentMenu = (i) => {
  currentFood.value = menu.value[i]
  menuModal.value = true
}
const addToCart = (order) => {
  if (order.number) {
    for (let i = 0; i < order.number; i++) {
      cart.value.push(order)
    }
  } else {
    cart.value.push(order)
  }
}
const delFromCart = (i) => {
  if (i === 'clear')
    cart.value = []
  else
    cart.value.splice(i, 1);
}
const getCategories = async () => {
  try {
    const { data } = await axios.get('/categories', {
      headers: {
        'Authorization': `Bearer ${store.user.accessToken}`
      }
    })
    if (data?.data.length > 0) {
      const respFood = data.data.map((item, i) => ({ name: item.name, image: item.image, active: (i === 0) ? true : false }))
      data.data.map(item => {
        allFood.value[item.image] = item.products
      })
      food.value = respFood
    }
  } catch (error) {
    console.log(error);
  }
}
const getSettings = async () => {
  try {
    const { data } = await axios.get('/settings', {
      headers: {
        'Authorization': `Bearer ${store.user.accessToken}`
      }
    })
    if (data?.data.length > 0) {
      settings.push(data.data[0])
    }
    else {
      settings.push({
        make: JSON.stringify({
          m: {
            size: '1',
            price: '22',
            sauces: '2',
          },
          l: {
            size: '2',
            price: '28',
            sauces: '2',
          },
          xl: {
            size: '3',
            price: '35',
            sauces: '2',
          },
        }),
        more: JSON.stringify({
          sauces: {
            items: [],
            price: 2
          },
          extras: {
            items: [],
            price: 3
          },
          viandes: {
            items: [],
          },
        })
      })
    }
  } catch (error) {
    console.log(error);
  }
}
const getMenu = async () => {
  showMenu.value = true
  try {
    const { data } = await axios.get('/menus', {
      headers: {
        'Authorization': `Bearer ${store.user.accessToken}`
      }
    })
    if (data?.data.length > 0) {
      menu.value = data?.data;
    }
  } catch (error) {
    console.log(error);
  }
}

const addProductsToCart = async (order) => {
  try {
    const { data } = await axios.put(`/preorder/${order.id}`, {
      status: 'TERMINEE'
    }, {
      headers: {
        'Authorization': `Bearer ${store.user.accessToken}`
      }
    })
    if (data?.data) {
      store.setPreOrderType(order.type)
      store.removePreorder(order.id)
      if (typeof order.products === 'object') {
        cart.value.push(...order.products)
      }
      else {
        const items = JSON.parse(order.products)
        items.map(item => cart.value.push(item))
      }
      changePage('caisse')
    }
  } catch (error) {
    console.log(error);
  }
}

const addItemsToCart = (order) => {
  store.setPreOrderType("LIVRAISON")
  order.items.items.map(item => cart.value.push(item))
}

const updateCart = (e) => {
  cart.value = e
}

const getPreorders = async () => {
  try {
    const { data } = await axios.get('/preorder', {
      headers: {
        'Authorization': `Bearer ${store.user.accessToken}`
      }
    })
    if (data?.data.length > 0) {
      store.setPreorders(data.data)
    }
  } catch (error) {
    console.log(error);
  }
}

onMounted(() => {
  store.setUser(store.user)
  getCategories()
  getSettings()
  getPreorders()
})

</script>

<template>
  <Header page="caisse" @change-page="changePage" @add-to-cart="addItemsToCart" />
  <pre-order v-if="page === 'preorder'" @change-page="changePage" @add-to-cart="addProductsToCart" />
  <food-modal
    v-if="settings.length > 0"
    :currentFood="currentFood"
    :settings="settings"
    :foodModal="foodModal"
    @send-data="addToCart"
    @food-close="closeFoodModal"
  />
  <menu-modal
    v-if="settings.length > 0"
    :currentFood="currentFood"
    :settings="settings"
    :foodModal="menuModal"
    @send-data="addToCart"
    @food-close="closeMenuModal"
  />
  <tacos-modal
    v-if="settings.length > 0"
    :tacosModal="tacosModal"
    :step="step"
    :settings="settings"
    :hidePrev="hidePrev"
    :hideNext="hideNext"
    @send-data="addToCart"
    @change-step="stepChanger"
    @tacos-close="closeTacosModal"
  />
  <main class="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 items-start">
    <div class="lg:col-span-8 flex flex-col gap-4">
      <!-- Category rail. Menu sits in the same row as the categories because
           that is what it is: one more way to pick a product. -->
      <nav class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
        <food-list
          :food="food"
          :showMenu="showMenu"
          @active="setActive"
        />
        <category-tile label="Menu" :active="showMenu" @click="getMenu">
          <Menu class="h-8" :class="showMenu ? 'fill-white' : 'fill-main'" />
        </category-tile>
      </nav>

      <section class="bg-white border border-black/[.07] rounded-xl shadow-sm overflow-hidden">
        <!-- Grows with the category, never past the screen -->
        <div class="max-h-[calc(100vh-260px)] overflow-y-auto p-4">
          <div v-if="showMenu" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              v-for="(item, i) in menu"
              :key="i"
              :item="item"
              @click="setCurrentMenu(i)"
            />
          </div>
          <div v-else class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <Card
              v-for="(item, i) in allFood[activeFood?.image]"
              :key="i"
              :item="item"
              @click="setCurrent(i)"
            />
            <add-button
              v-if="activeFood?.image === 'tacos'"
              title="Composer votre Tacos"
              @open-modal="openTacosModal"
            />
          </div>
        </div>
      </section>

      <!-- Both boards only exist when they have something in them -->
      <div v-if="notifications.length > 0 || prints.length > 0" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <orders-notif v-if="notifications.length > 0" :notif="notifications" />
        <orders-prints v-if="prints.length > 0" :prints="prints" />
      </div>
    </div>

    <div class="lg:col-span-4 lg:sticky lg:top-20">
      <panier :cart="cart" @cart-del="delFromCart" @update-cart="updateCart" page="caisse" />
    </div>
  </main>
</template>
