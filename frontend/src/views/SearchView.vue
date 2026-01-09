<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { performSearch } from '../services/core.service.ts'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { getTimeLeft, UseNavigation } from  '../services/services.config.ts'

const { goToItem } = UseNavigation()

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const statusFilter = ref('')
const limit = ref(10)
const offset = ref(0)
const page = ref(1)

const results = ref<any[]>([])

let timer: number
onMounted(() => {
  timer = setInterval(() => {
    results.value = [...results.value]
  }, 1000)
})
onBeforeUnmount(() => clearInterval(timer))


watch(
    [() => route.query.q, () => route.query.status],
    ([newQuery, newStatus]) => {
      searchQuery.value = (newQuery as string) || ''
      statusFilter.value = (newStatus as string) || ''
      offset.value = 0
      page.value = 1
      performSearch({ searchQuery, statusFilter, limit, offset, results })
    },
    { immediate: true }
)

const handleEnter = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    router.push({
      name: 'search',
      query: { q: searchQuery.value, status: statusFilter.value }
    })
  }
}

const nextPage = () => {
  offset.value += limit.value
  page.value += 1
  performSearch()
}

const prevPage = () => {
  if (offset.value >= limit.value) {
    offset.value -= limit.value
    page.value -= 1
    performSearch()
  }
}

const setStatus = (status: string) => {
  statusFilter.value = status
  offset.value = 0
  page.value = 1
  performSearch({ searchQuery, statusFilter, limit, offset, results })
}

</script>

<template>
  <div class="max-w-4xl mx-auto mt-12 px-4">
    <div class="flex justify-between items-center mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">
            Status: {{ statusFilter || 'All' }}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="setStatus('')">All</DropdownMenuItem>
          <DropdownMenuItem @click="setStatus('BID')">BID</DropdownMenuItem>
          <DropdownMenuItem @click="setStatus('OPEN')">OPEN</DropdownMenuItem>
          <DropdownMenuItem @click="setStatus('ARCHIVE')">ARCHIVE</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div v-if="results.length === 0" class="text-center text-muted-foreground">
      No results found.
    </div>

    <ul v-else class="space-y-4 mb-6">
      <li
          v-for="item in results"
          :key="item.item_id"
          class="p-4 border rounded-md shadow-sm bg-background"
          @click="goToItem(item.item_id)"
      >
        <h3 class="text-xl font-semibold mb-1">{{ item.name }}</h3>
        <p class="text-sm text-muted-foreground mb-2">{{ item.description }}</p>
        <p class="font-medium">
          Current Bid: <span class="text-green-600 font-bold">${{ item.current_bid }}</span>
        </p>
        <p class="text-purple-600 font-semibold">
          Time Left: {{ getTimeLeft(item.end_date) }}
        </p>
      </li>
    </ul>

    <div class="flex justify-between items-center">
      <Button :disabled="page === 1" @click="prevPage">Previous</Button>
      <span class="text-sm text-muted-foreground">Page {{ page }}</span>
      <Button :disabled="results.length < limit" @click="nextPage">Next</Button>
    </div>
  </div>
</template>


