<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Router
const route = useRoute()
const router = useRouter()


const searchQuery = ref('')

const results = ref<string[]>([])

const performSearch = (query: string) => {
  if (!query) {
    results.value = []
    return
  }
  results.value = [
    `Result for "${query}" 1`,
    `Result for "${query}" 2`,
    `Result for "${query}" 3`,
  ]
}

watch(
    () => route.query.q,
    (newQuery) => {
      searchQuery.value = newQuery as string || ''
      performSearch(searchQuery.value)
    },
    { immediate: true }
)

const handleEnter = () => {
  if (event.key === 'Enter') {
    event.preventDefault()
    router.push({ name: 'search', query: { q: searchQuery.value } })
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto mt-12 px-4">
    <div v-if="results.length === 0" class="text-center text-muted-foreground">
      No results found.
    </div>

    <ul v-else class="space-y-2">
      <li
          v-for="(item, index) in results"
          :key="index"
          class="p-4 border rounded-md hover:bg-accent/10"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>
