<script setup>
import { ref } from "vue"
import axios from 'axios'

import { useStore } from "../store"

import Notifications from './icons/Notifications.vue';
import Delete from './icons/Delete.vue';

const store = useStore()

const props = defineProps(['notif'])
const loading = ref(false)

const allNot = ref(props.notif || [])

const getAllNotifications = async () => {
  try {
    loading.value = true
    const { data } = await axios.get('/orders/caisse', {
      headers: {
        'Authorization': `Bearer ${store.user.accessToken}`
      }
    })
    allNot.value = data?.data
    store.setNotifications(data?.data)
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="bg-white border border-black/[.07] rounded-xl shadow-sm overflow-hidden flex flex-col">
    <header class="flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0">
      <notifications class="text-main" />
      <h2 class="font-bree-serif text-[17px]">Commandes prêtes</h2>
      <span
        v-if="allNot.length"
        class="min-w-[26px] h-[26px] px-1.5 rounded-full bg-second text-white text-[13px] font-bold flex items-center justify-center tabular-nums"
      >
        {{ allNot.length }}
      </span>
      <button
        class="ml-auto h-9 w-9 rounded-lg border border-border flex items-center justify-center text-black/55 transition-colors hover:bg-gray-light"
        title="Rafraîchir"
        @click="getAllNotifications"
      >
        <span v-if="loading" class="loading !w-4 !h-4"></span>
        <svg v-else viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
      </button>
    </header>

    <div class="max-h-64 overflow-y-auto p-3 flex flex-col gap-2">
      <p v-if="allNot.length === 0" class="text-black/45 text-center py-8">Pas de notifications</p>
      <div
        v-for="(item, i) in allNot"
        :key="i"
        class="rounded-lg border border-second/30 bg-second/[.08] px-3 py-2.5 flex items-center gap-3"
      >
        <svg class="fill-second shrink-0" width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M10.0156 18.8574C14.4339 18.8574 18.0156 15.2757 18.0156 10.8574C18.0156 6.43914 14.4339 2.85742 10.0156 2.85742C5.59735 2.85742 2.01562 6.43914 2.01562 10.8574C2.01562 15.2757 5.59735 18.8574 10.0156 18.8574ZM13.7227 9.56453C14.1133 9.174 14.1133 8.54084 13.7227 8.15032C13.3322 7.75979 12.699 7.75979 12.3085 8.15032L9.01562 11.4432L7.72273 10.1503C7.33221 9.75979 6.69904 9.75979 6.30852 10.1503C5.91799 10.5408 5.91799 11.174 6.30852 11.5645L8.30852 13.5645C8.69904 13.9551 9.33221 13.9551 9.72273 13.5645L13.7227 9.56453Z"/>
        </svg>
        <span>
          La commande <span class="font-bree-serif text-lg">N° {{ item.number }}</span> est prête
        </span>
        <button
          class="ml-auto w-9 h-9 rounded-lg flex items-center justify-center text-black/35 transition-colors hover:bg-danger hover:text-white"
          title="Retirer"
          @click="store.removeNotification(i)"
        >
          <delete />
        </button>
      </div>
    </div>
  </section>
</template>
