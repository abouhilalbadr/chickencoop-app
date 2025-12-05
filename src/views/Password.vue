<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive, onMounted } from "vue";
import axios from 'axios'

import Cart from "../components/icons/Cart.vue";
import Cash from "../components/icons/Cash.vue";
import Tablet from "../components/icons/Tablet.vue";
import ChevronLeft from "../components/icons/ChevronLeft.vue";

import { useStore } from "../store"

const store = useStore()
const router = useRouter()
const loading = ref(false)
const users = ref([])
const login = reactive({
  email: store.type === 'stockage' ? 'charge@chickencoop.ma' : store.type === 'tablet' ? 'tablet@chickencoop.ma' : '',
  password: ''
})

const getAllCaissiers = async () => {
  try {
    const { data } = await axios.get('/public/caissiers')
    return data
  } catch (error) {
    console.log(error);
  }
}

const deleteNum = () => {
  login.password = login.password.slice(0, -1);
}
const addNum = (num) => {
  login.password += num
}
const reset = () => {
  login.password = ''
}
const validatePass = async () => {
  try {
    loading.value = true
    const { data: user } = await axios.post('/auth/login', {
      email: login.email,
      password: login.password
    })
    store.setUser(user)
    if (user.role === 'CAISSE' || user.role === 'STOCK') {
      login.password = ''
      router.push(`/${store.type}`)
    }
    loading.value = false
  } catch (error) {
    console.log(error);
    loading.value = false
  }
}
const returnBack = () => {
  router.push('/')
}

onMounted(async () => {
  if (store.type === 'caisse') {
    const caissiers = await getAllCaissiers()
    users.value = caissiers.users
    // Default to the first caissier's email if available
    if (!login.email && users.value?.length) {
      login.email = users.value[0].email
      // login.email = 'caisse@chickencoop.ma'
    }
  }
})

</script>

<template>
  <div class="flex flex-col justify-center items-center min-h-screen gap-6 p-8">
    <div v-if="store.type" class="flex justify-center items-center">
      <div v-if="store.type === 'stockage'"
        class="flex flex-col items-center gap-2 border-2 border-main rounded-md w-64 py-4 bg-main">
        <Cart class="h-32 fill-white" />
        <span class="text-white font-bree-serif font-bold text-3xl">Charges</span>
      </div>
      <div v-else-if="store.type === 'caisse'"
        class="flex flex-col items-center gap-2 border-2 border-main rounded-md w-64 py-4 bg-main">
        <Cash class="h-32 fill-white" />
        <span class="text-white font-bree-serif font-bold text-3xl">Caisse</span>
      </div>
      <div v-else class="flex flex-col items-center gap-2 border-2 border-main rounded-md w-64 py-4 bg-main">
        <Tablet class="h-32 fill-white" />
        <span class="text-white font-bree-serif font-bold text-3xl">Tablet</span>
      </div>
    </div>
    <div v-if="store.type === 'caisse'" class="min-w-[600px] rounded-md flex items-center">
      <select v-model="login.email"
        class="col-span-5 px-4 text-2xl bg-gray tracking-wider focus:outline-none w-full rounded-md h-24">
        <option v-for="(user, i) in users" :key="i" :value="user.email">
          {{ user.name }}
        </option>
      </select>
    </div>
    <div class="min-w-[600px] max-w-sm mx-auto flex items-center">
      <div
        class="keyboard grid grid-cols-4 grid-rows-6 gap-1 p-1 w-full h-[450px] font-bold rounded-md ring-2 ring-white/20 shadow text-white select-none">
        <div class="col-span-4 row-span-2 rounded-md">
          <input type="text"
            class="col-span-5 px-4 text-4xl bg-gray tracking-wider select-auto focus:outline-none w-full rounded-md h-24 text-main"
            placeholder="0000" v-model="login.password" />
        </div>
        <button @click="addNum('1')">
          <span>1</span>
        </button>
        <button @click="addNum('2')">
          <span>2</span>
        </button>
        <button @click="addNum('3')">
          <span>3</span>
        </button>
        <button @click="deleteNum">
          <span class="text-xl">Supprimer</span>
        </button>
        <button @click="addNum('4')">
          <span>4</span>
        </button>
        <button @click="addNum('5')">
          <span>5</span>
        </button>
        <button @click="addNum('6')">
          <span>6</span>
        </button>
        <button @click="reset">
          <span class="text-xl">Réinitialiser</span>
        </button>
        <button @click="addNum('7')">
          <span>7</span>
        </button>
        <button @click="addNum('8')">
          <span>8</span>
        </button>
        <button @click="addNum('9')">
          <span>9</span>
        </button>
        <button @click="validatePass"
          class="row-span-2 !bg-second !text-white disabled:bg-second/50 disabled:cursor-wait" :disabled="loading">
          <span v-if="loading" class="loading"></span>
          <span v-else class="text-xl">Connexion</span>
        </button>
        <button @click="addNum('0')" class="col-span-3">
          <span>0</span>
        </button>
      </div>
    </div>
    <button @click="returnBack"
      class="bg-main flex gap-2 items-center text-white rounded-md px-10 py-4 fixed top-0 left-0 m-4">
      <chevron-left />
      <span>Retour</span>
    </button>
  </div>
</template>
