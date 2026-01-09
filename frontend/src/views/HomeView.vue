<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const endingSoon = ref([
  { id: 1, title: 'GPU RTX 3060', image: 'https://via.placeholder.com/600x300', timeLeft: '2h 30m' },
  { id: 2, title: 'Intel i7 CPU', image: 'https://via.placeholder.com/600x300', timeLeft: '4h 15m' },
  { id: 3, title: 'Corsair 16GB RAM', image: 'https://via.placeholder.com/600x300', timeLeft: '1h 50m' },
  { id: 4, title: 'Samsung SSD 1TB', image: 'https://via.placeholder.com/600x300', timeLeft: '3h 10m' },
])

const currentIndex = ref(0)

const prevItem = () => {
  currentIndex.value = (currentIndex.value - 1 + endingSoon.value.length) % endingSoon.value.length
}

const nextItem = () => {
  currentIndex.value = (currentIndex.value + 1) % endingSoon.value.length
}
</script>

<template>
  <div class="p-6 text-center">
    <h1 class="text-3xl font-bold mb-2">Welcome To Auctionary!</h1>
    <h2 class="text-2xl font-semibold mb-2">The Site For All Your Computer Needs</h2>
    <p class="text-lg mb-4">This is an auction site dedicated to second-hand computer parts</p>
    <hr class="border-t-2 border-purple-500 rounded w-280 mx-auto my-4" />

    <h2 class="text-2xl font-bold mt-6 mb-4 max-w-6xl mx-auto">Ending Soon!</h2>

    <div class="max-w-3xl mx-auto relative flex items-center">

      <Button class="absolute left-0 z-10" variant="outline" @click="prevItem">
        ‹
      </Button>

      <Card class="w-full mx-6 shadow-lg">
        <CardHeader>
          <CardTitle class="text-lg font-semibold">{{ endingSoon[currentIndex].title }}</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-2">
          <img
              :src="endingSoon[currentIndex].image"
              alt=""
              class="w-full h-64 object-cover rounded-md"
          />
          <p class="text-sm text-muted-foreground">Time left: {{ endingSoon[currentIndex].timeLeft }}</p>
          <Button class="mt-2 w-full">Bid Now</Button>
        </CardContent>
      </Card>

      <Button class="absolute right-0 z-10" variant="outline" @click="nextItem">
        ›
      </Button>
    </div>

    <div class="flex justify-center mt-4 space-x-2">
      <span
          v-for="(item, index) in endingSoon"
          :key="item.id"
          @click="currentIndex = index"
          class="w-3 h-3 rounded-full cursor-pointer"
          :class="currentIndex === index ? 'bg-purple-500' : 'bg-purple-300'"
      ></span>
    </div>
  </div>
</template>
