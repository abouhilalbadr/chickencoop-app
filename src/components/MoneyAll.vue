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
    <div class="col-span-7 grid grid-cols-5 gap-4">
      <button type="button" @click.prevent="addNum(200)">
        <img src="../assets/images/200.jpg" alt="200DH">
      </button>
      <button type="button" @click.prevent="addNum(100)">
        <img src="../assets/images/100.jpg" alt="100DH">
      </button>
      <button type="button" @click.prevent="addNum(50)">
        <img src="../assets/images/50.jpg" alt="50DH">
      </button>
      <button type="button" @click.prevent="addNum(20)">
        <img src="../assets/images/20.jpg" alt="20DH">
      </button>
      <div></div>
      <button type="button" class="flex items-center justify-center" @click.prevent="addNum(10)">
        <img class="h-24" src="../assets/images/10.jpeg" alt="10DH">
      </button>
      <button type="button" class="flex items-center justify-center" @click.prevent="addNum(5)">
        <img class="h-24" src="../assets/images/5.jpeg" alt="5DH">
      </button>
      <button type="button" class="flex items-center justify-center" @click.prevent="addNum(2)">
        <img class="h-24" src="../assets/images/2.jpeg" alt="2DH">
      </button>
      <button type="button" class="flex items-center justify-center" @click.prevent="addNum(1)">
        <img class="h-24" src="../assets/images/1.jpeg" alt="1DH">
      </button>
      <button type="button" class="flex items-center justify-center" @click.prevent="addNum(0.5)">
        <img class="h-24" src="../assets/images/half.jpeg" alt="0.5DH">
      </button>
    </div>
    <div class="col-span-1">
      <button @click.prevent="deleteNum" class="text-white flex justify-center items-center rounded-md h-full w-full bg-red active:bg-black/60 active:scale-95 active:duration-[0s]">
        <delete />
      </button>
    </div>
  </div>
</template>
