<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { performSearch } from '../services/core.service.ts'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { getTimeLeft, UseUserNavigation, UseItemNavigation } from  '../services/services.config.ts'
import { useSessionStore } from "@/stores/session.ts";

const { goToItem } = UseItemNavigation()
const { goToUser } = UseUserNavigation()

const session = useSessionStore()

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const statusFilter = ref('')
const limit = ref(10)
const offset = ref(0)
const page = ref(1)
const results = ref<any[]>([])

const handleGoToUser = (id: string | null | undefined, event: MouseEvent) => {
  event.stopPropagation()
  if (!id) {
    console.warn('No user ID to navigate to')
    return
  }
  goToUser(String(id))
}

const handleEnter = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    router.push({
      name: 'search',
      query: { q: searchQuery.value, status: statusFilter.value },
    })
  }
}

const nextPage = async () => {
  offset.value += limit.value
  page.value += 1
  const token = localStorage.getItem('session_token') || null

  results.value = await performSearch(
      {
        searchQuery: searchQuery.value,
        statusFilter: statusFilter.value,
        limit: limit.value,
        offset: offset.value
      },token
  )
}

const prevPage = async () => {
  if (offset.value >= limit.value) {
    offset.value -= limit.value
    page.value -= 1
    const token = localStorage.getItem('session_token') || null

    results.value = await performSearch(
        {
          searchQuery: searchQuery.value,
          statusFilter: statusFilter.value,
          limit: limit.value,
          offset: offset.value
        },token
    )
  }
}

const setStatus = async (status: string) => {
  statusFilter.value = status
  offset.value = 0
  page.value = 1
  let token = localStorage.getItem('session_token')
  if (!token) {
    token = null;
  }
  results.value = await performSearch({ searchQuery: searchQuery.value,
    statusFilter: statusFilter.value,
    limit: limit.value,
    offset: offset.value },token)
}

let timer: number
onMounted(() => {
  timer = setInterval(() => {
    results.value = [...results.value]
  }, 1000)
})
onBeforeUnmount(() => clearInterval(timer))

watch(
    [() => route.query.q, () => route.query.status, () => session.authToken ],
    async ([newQuery, newStatus, authRef]) => {
      let token = localStorage.getItem('session_token')
      if (!token) {
        token = null;
      }

      searchQuery.value = (newQuery as string) || ''
      statusFilter.value = (newStatus as string) || ''
      offset.value = 0
      page.value = 1

      results.value = await performSearch(
          {
            searchQuery: searchQuery.value,
            statusFilter: statusFilter.value,
            limit: limit.value,
            offset: offset.value
          },
          token
      )
    },
    { immediate: true }
)

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
          Current Bid: <span class="text-green-600 font-bold">£ {{ item.current_bid }}</span>
        </p>
        <p class="text-purple-600 font-semibold">
          Time Left: {{ getTimeLeft(item.end_date) }}
        </p>
        <p class="font-semibold cursor-pointer" @click="(event) => handleGoToUser(item.creator_id, event)">
          Listed By: {{ item.first_name }} {{ item.last_name }}
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


