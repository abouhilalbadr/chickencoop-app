<script setup>
  import Delete from './icons/Delete.vue';

  const emit = defineEmits(['reset', 'add'])

  const addNum = (num) => {
    emit('add', num)
  }

  const deleteNum = () => {
    emit('reset')
  }

</script>

<template>
  <div class="grid grid-cols-8 gap-2 my-6">
    <div class="col-span-7 grid grid-cols-4 gap-2">
      <button @click="addNum(200)">
        <img src="../assets/images/200.jpg" alt="200DH">
      </button>
      <button @click="addNum(100)">
        <img src="../assets/images/100.jpg" alt="100DH">
      </button>
      <button @click="addNum(50)">
        <img src="../assets/images/50.jpg" alt="50DH">
      </button>
      <button @click="addNum(20)">
        <img src="../assets/images/20.jpg" alt="20DH">
      </button>
    </div>
    <div class="col-span-1">
      <button @click="deleteNum" class="text-black flex justify-center items-center rounded-md h-full w-full bg-border active:bg-black/60 active:scale-95 active:duration-[0s]">
        <delete />
      </button>
    </div>
  </div>
</template>