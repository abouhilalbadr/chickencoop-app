<script setup>
  import { ref } from "vue"
  import axios from 'axios'

  import { useStore } from "../store"

  import Notifications from './icons/Notifications.vue';
  import Delete from './icons/Delete.vue';

  const store = useStore()

  const props = defineProps(['notif'])

  const allNot = ref(props.notif || [])

  const getAllNotifications = async () => {
    try {
      const { data } = await axios.get('/orders/caisse', {
        headers: {
          'Authorization': `Bearer ${store.user.accessToken}`
        }
      })
      allNot.value = data?.data
      store.setNotifications(data?.data)
    } catch (error) {
      console.log(error);
    }
  }
</script>

<template>
  <div class="px-4">
    <div class="flex gap-4 items-center">
      <notifications class="text-main" />
      <h2 class="relative title text-2xl text-main font-bree-serif font-bold">Notifications</h2>
      <button class="text-main" @click="getAllNotifications">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
      </button>
    </div>
    <div class="flex flex-col gap-4 mt-8 max-h-64 h-64 overflow-scroll">
      <p v-if="allNot.length === 0" class="text-black/50 p-2">Pas de notifications</p>
      <p
        v-for="(item, i) in allNot"
        :key="i"
        class="px-4 py-2 text-xl border border-main text-main bg-notif rounded-md flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <svg class="fill-main" width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.0156 18.8574C14.4339 18.8574 18.0156 15.2757 18.0156 10.8574C18.0156 6.43914 14.4339 2.85742 10.0156 2.85742C5.59735 2.85742 2.01562 6.43914 2.01562 10.8574C2.01562 15.2757 5.59735 18.8574 10.0156 18.8574ZM13.7227 9.56453C14.1133 9.174 14.1133 8.54084 13.7227 8.15032C13.3322 7.75979 12.699 7.75979 12.3085 8.15032L9.01562 11.4432L7.72273 10.1503C7.33221 9.75979 6.69904 9.75979 6.30852 10.1503C5.91799 10.5408 5.91799 11.174 6.30852 11.5645L8.30852 13.5645C8.69904 13.9551 9.33221 13.9551 9.72273 13.5645L13.7227 9.56453Z"/>
          </svg>
          <span>La commande N&#186; <span class="text-black font-bold">{{ item.number }}</span> est prête</span>
        </div>
        <button @click="store.removeNotification(i)">
          <delete />
        </button>
      </p>
    </div>
  </div>
</template>