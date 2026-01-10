<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { searchItems } from '../services/core.service.ts'
import { getTimeLeft, UseItemNavigation } from  '../services/services.config.ts'

const { goToItem } = UseItemNavigation()

const endingSoon = ref<any[]>([])
const currentIndex = ref(0)

const prevItem = () => {
  currentIndex.value = (currentIndex.value - 1 + endingSoon.value.length) % endingSoon.value.length
}

const nextItem = () => {
  currentIndex.value = (currentIndex.value + 1) % endingSoon.value.length
}

const loadEndingSoon = async () => {
  try {
    const data = await searchItems({ limit: 4, offset: 0 })
    endingSoon.value = Array.isArray(data) ? data : []
    currentIndex.value = 0
  } catch (err: any) {
    console.error('Failed to load ending soon items', err)
    toast.error(err?.error_message || 'Unable to load ending soon items')
  }
}

let timer: number
onMounted(() => {
  loadEndingSoon()
  timer = setInterval(() => {
    endingSoon.value = [...endingSoon.value]
  }, 1000)
})

onBeforeUnmount(() => clearInterval(timer))

</script>

<template>
  <div class="p-6 text-center">
    <h1 class="text-3xl font-bold mb-2">Welcome To Auctionary!</h1>
    <h2 class="text-2xl font-semibold mb-2">The Site For All Your Computer Needs</h2>
    <p class="text-lg mb-4">This is an auction site dedicated to second-hand computer parts</p>
    <hr class="border-t-2 border-purple-500 rounded w-280 mx-auto my-4" />

    <h2 class="text-2xl font-bold mt-6 mb-4 max-w-6xl mx-auto">Ending Soon!</h2>

    <div v-if="endingSoon.length === 0" class="text-muted-foreground">
      No items ending soon.
    </div>

    <div v-else class="max-w-3xl mx-auto relative flex items-center">
      <Button class="absolute left-0 z-10" variant="outline" @click="prevItem">‹</Button>

      <Card class="w-full mx-6 shadow-lg">
        <CardHeader>
          <CardTitle class="text-lg font-semibold">{{ endingSoon[currentIndex].name }}</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-2">
          <img
              src="https://via.placeholder.com/600x300"
          alt="Item image"
          class="w-full h-64 object-cover rounded-md"
          />
          <p class="text-sm text-muted-foreground">{{ endingSoon[currentIndex].description }}</p>
          <p class="font-medium">
            Current Bid: <span class="text-green-600 font-bold">${{ endingSoon[currentIndex].current_bid }}</span>
          </p>
          <p class="text-purple-600 font-semibold" >
            Time Left: {{ getTimeLeft(endingSoon[currentIndex].end_date) }}
          </p>
          <Button class="mt-2 w-full" @click="goToItem(endingSoon[currentIndex].item_id)">
            Bid Now
          </Button>
        </CardContent>
      </Card>

      <Button class="absolute right-0 z-10" variant="outline" @click="nextItem">›</Button>
    </div>

    <div class="flex justify-center mt-4 space-x-2">
      <span
          v-for="(item, index) in endingSoon"
          :key="item.item_id"
          @click="currentIndex = index"
          class="w-3 h-3 rounded-full cursor-pointer"
          :class="currentIndex === index ? 'bg-purple-500' : 'bg-purple-300'"
      ></span>
    </div>
  </div>
</template>
