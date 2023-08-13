<script setup>
import { computed } from 'vue';
import Swal from 'sweetalert2'

import { useStore } from "./store"

const store = useStore()

const showAlert = computed(() => {
  if (store.alert.show) {
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

</script>

<template>
<div class="bg-body">
  <p class="hidden">{{ showAlert }}</p>
  <router-view></router-view>
</div>
</template>
