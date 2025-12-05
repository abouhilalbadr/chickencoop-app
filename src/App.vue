<script setup>
import { computed, onMounted } from 'vue';
import Swal from 'sweetalert2'
import SoundNotif from './assets/sounds/current.mp3'

import { useStore } from "./store"

const store = useStore()
const audio = new Audio(SoundNotif)

const showAlert = computed(() => {
  if (store.alert.show && store.type === 'caisse') {
    audio.play()
    return Swal.fire({
      position: 'top-end',
      icon: store.alert.status,
      title: store.alert.message,
      showConfirmButton: false,
      timer: 3000
    })
  }
  return ''
})

const disableMenu = () => {
  document.addEventListener('contextmenu', e => {
    e.preventDefault();
    return false;
  }, { capture: true })

  document.addEventListener('selectstart', e => {
    e.preventDefault();
    return false;
  }, { capture: true })
}

onMounted(() => {
  disableMenu()
})

</script>

<template>
  <div class="bg-body">
    <p class="hidden">{{ showAlert }}</p>
    <router-view></router-view>
  </div>
</template>
