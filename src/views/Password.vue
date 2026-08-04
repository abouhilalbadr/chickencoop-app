<script setup>
import { useRouter } from 'vue-router'
import { computed, ref, reactive, onMounted } from "vue";
import axios from 'axios'

import Cart from "../components/icons/Cart.vue";
import Cash from "../components/icons/Cash.vue";
import Tablet from "../components/icons/Tablet.vue";
import ChevronLeft from "../components/icons/ChevronLeft.vue";

import { useStore } from "../store"

const store = useStore()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const users = ref([])
const login = reactive({
  email: store.type === 'stockage' ? 'charge@chickencoop.ma' : store.type === 'tablet' ? 'tablet@chickencoop.ma' : 'caisse@chickencoop.ma',
  password: ''
})

const post = computed(() => {
  if (store.type === 'stockage') return { label: 'Charges', icon: Cart }
  if (store.type === 'tablet') return { label: 'Tablet', icon: Tablet }
  return { label: 'Caisse', icon: Cash }
})

// The pad shows how many digits have been keyed, not the digits themselves
const dots = computed(() => Math.max(login.password.length, 4))

const getAllCaissiers = async () => {
  try {
    const { data } = await axios.get('/public/caissiers')
    return data
  } catch (error) {
    console.log(error);
  }
}

const deleteNum = () => {
  error.value = ''
  login.password = login.password.slice(0, -1);
}
const addNum = (num) => {
  error.value = ''
  login.password += num
}
const reset = () => {
  error.value = ''
  login.password = ''
}
const validatePass = async () => {
  if (!login.password) return
  try {
    error.value = ''
    loading.value = true
    const { data: user } = await axios.post('/auth/login', {
      email: login.email,
      password: login.password
    })
    store.setUser(user)
    if (user.role === 'CAISSE' || user.role === 'STOCK') {
      login.password = ''
      router.push(`/${store.type}`)
    } else {
      error.value = "Ce compte n'a pas accès à ce poste"
    }
    loading.value = false
  } catch (err) {
    // Until now a wrong code did nothing visible at all
    error.value = 'Code incorrect. Veuillez réessayer.'
    login.password = ''
    loading.value = false
  }
}
const returnBack = () => {
  router.push('/')
}

onMounted(async () => {
  if (store.type === 'caisse') {
    const caissiers = await getAllCaissiers()
    users.value = caissiers?.users || []
    // Default to the first caissier's email if available
    if (!login.email && users.value?.length) {
      login.email = users.value[0].email
    }
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center items-center p-8">
    <button
      @click="returnBack"
      class="fixed top-4 left-4 h-12 px-5 rounded-lg bg-white border border-border text-black flex gap-2 items-center transition-colors hover:bg-gray-light"
    >
      <chevron-left />
      <span>Retour</span>
    </button>

    <div class="w-full max-w-[460px] bg-white border border-black/[.07] rounded-xl shadow-sm overflow-hidden">
      <div class="flex items-center gap-3 px-5 h-[76px] border-b border-border">
        <span class="w-12 h-12 rounded-lg bg-main/[.10] flex items-center justify-center">
          <component :is="post.icon" class="h-7 fill-main" />
        </span>
        <div>
          <h1 class="font-bree-serif text-xl leading-tight">{{ post.label }}</h1>
          <p class="text-black/50 text-sm">Entrez le code d'accès</p>
        </div>
      </div>

      <div class="p-5 flex flex-col gap-4">
        <!-- Code state, then the error under it: the pad itself never moves -->
        <div class="h-[72px] rounded-xl bg-gray-light border border-border flex items-center justify-center gap-3.5">
          <span
            v-for="i in dots"
            :key="i"
            class="w-3.5 h-3.5 rounded-full transition-colors"
            :class="i <= login.password.length ? 'bg-main' : 'bg-black/15'"
          />
        </div>
        <p v-if="error" class="text-sm text-danger text-center -mt-1">{{ error }}</p>

        <div class="keyboard grid grid-cols-4 grid-rows-4 gap-2.5 h-[360px] select-none">
          <button @click="addNum('1')"><span>1</span></button>
          <button @click="addNum('2')"><span>2</span></button>
          <button @click="addNum('3')"><span>3</span></button>
          <button @click="deleteNum" class="!text-[15px]">Supprimer</button>
          <button @click="addNum('4')"><span>4</span></button>
          <button @click="addNum('5')"><span>5</span></button>
          <button @click="addNum('6')"><span>6</span></button>
          <button @click="reset" class="!text-[15px]">Réinitialiser</button>
          <button @click="addNum('7')"><span>7</span></button>
          <button @click="addNum('8')"><span>8</span></button>
          <button @click="addNum('9')"><span>9</span></button>
          <button
            @click="validatePass"
            class="row-span-2 !bg-second !border-second hover:!bg-second/85 !text-white !text-base disabled:opacity-50 disabled:pointer-events-none"
            :disabled="loading || !login.password"
          >
            <span v-if="loading" class="loading"></span>
            <span v-else>Connexion</span>
          </button>
          <button @click="addNum('0')" class="col-span-3"><span>0</span></button>
        </div>
      </div>
    </div>
  </div>
</template>
