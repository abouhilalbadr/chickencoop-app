<script setup>
    import Arrow from './icons/Arrow.vue';
  const emit = defineEmits(['reset', 'add'])

const deleteNum = () => {
    emit('reset')
}

const addNum = (num) => {
    emit('add', num)
}
</script>

<template>
  <div class="keyboard grid grid-cols-4 grid-rows-4 gap-1 px-1 my-6 w-full h-[300px] font-bold rounded-md text-white select-none">
      <button @click="addNum('1')">
          <span>1</span>
      </button>
      <button @click="addNum('2')">
          <span>2</span>
      </button>
      <button @click="addNum('3')">
          <span>3</span>
      </button>
      <button @click="addNum('x')" class="row-span-4 !bg-border">
          <arrow />
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
      <button @click="addNum('7')">
          <span>7</span>
      </button>
      <button @click="addNum('8')">
          <span>8</span>
      </button>
      <button @click="addNum('9')">
          <span>9</span>
      </button>
      <button @click="deleteNum" class="!bg-main !text-white">
          <span>c</span>
      </button>
      <button @click="addNum('0')">
          <span>0</span>
      </button>
      <button @click="addNum('.')">
          <span>.</span>
      </button>
    </div>
</template>