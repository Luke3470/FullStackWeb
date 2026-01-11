<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { toast } from "vue-sonner"
import { getUserDetails, getUserQuestions } from "../services/user.service.ts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { getTimeLeft } from '../services/services.config.ts'
import { useSessionStore } from '../stores/session.ts'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()

const session = useSessionStore()
const { userId } = storeToRefs(session)

const viewingUserId = ref<string | null>(route.params.id as string || null)
const user = ref<any>(null)
const loading = ref(true)
const questionsToAnswer = ref<any[]>([])

const fetchUserQuestions = async () => {
  if (!viewingUserId.value) return
  try {
    const response = await getUserQuestions(viewingUserId.value)
    if (!response || response.error_message) {
      questionsToAnswer.value = []
      return
    }
    questionsToAnswer.value = response
  } catch (err: any) {
    console.error(err)
    toast.error('Failed to fetch questions: ' + err.message)
  }
}

const fetchUser = async () => {
  if (!viewingUserId.value) return
  loading.value = true
  user.value = null
  questionsToAnswer.value = []
  try {
    const response = await getUserDetails(viewingUserId.value)

    if (!response || response.error_message) {
      toast.error(response?.error_message ?? "User not found")
      return
    }

    user.value = response

    if (userId.value === viewingUserId.value) {
      await fetchUserQuestions()
    }

  } catch (err: any) {
    console.error(err)
    toast.error("Failed to fetch user: " + err.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUser()
})


watch(
    () => route.params.id,
    (newId) => {
      viewingUserId.value = newId as string
      fetchUser()
    }
)
const goToItem = (itemId: number) => {
  router.push(`/item/${itemId}`)
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-4">
    <div v-if="loading" class="text-center py-8">
      Loading user profile...
    </div>

    <div v-else>
      <div class="mb-6">
        <h1 class="text-2xl font-bold">
          {{ user.first_name }} {{ user.last_name }}
        </h1>
      </div>
      <Tabs defaultValue="selling">
        <TabsList class="mb-4">
          <TabsTrigger value="selling">Selling ({{ user.selling?.length ?? 0 }})</TabsTrigger>
          <TabsTrigger value="biddingOn">Bidding On ({{ user.bidding_on?.length ?? 0 }})</TabsTrigger>
          <TabsTrigger value="auctionsEnded">Ended Auctions ({{ user.auctions_ended?.length ?? 0 }})</TabsTrigger>
          <TabsTrigger
              v-if="userId === viewingUserId"
              value="questionToAnswer">
            Questions to Answer ({{ questionsToAnswer.length ?? 0 }})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="selling">
          <div v-if="!user.selling?.length" class="text-center text-muted-foreground">
            No items currently selling.
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card v-for="item in user.selling" :key="item.item_id" @click="goToItem(item.item_id)" class="cursor-pointer">
              <CardHeader>
                <CardTitle>{{ item.name }}</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">{{ item.description }}</p>
                <p class="font-semibold text-purple-600">Ends in: {{ getTimeLeft(item.end_date) }}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="biddingOn">
          <div v-if="!user.bidding_on?.length" class="text-center text-muted-foreground">
            Not currently bidding on any items.
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card v-for="item in user.bidding_on" :key="item.item_id" @click="goToItem(item.item_id)" class="cursor-pointer">
              <CardHeader>
                <CardTitle>{{ item.name }}</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">{{ item.description }}</p>
                <p class="font-semibold text-purple-600">Ends in: {{ getTimeLeft(item.end_date) }}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="auctionsEnded">
          <div v-if="!user.auctions_ended?.length" class="text-center text-muted-foreground">
            No ended auctions.
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card v-for="item in user.auctions_ended" :key="item.item_id" @click="goToItem(item.item_id)" class="cursor-pointer">
              <CardHeader>
                <CardTitle>{{ item.name }}</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">{{ item.description }}</p>
                <p class="font-semibold text-purple-600">Ended at: {{ new Date(item.end_date * 1000).toLocaleString() }}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="questionToAnswer">
          <div v-if="!questionsToAnswer.length" class="text-center text-muted-foreground">
            No questions to answer.
          </div>
          <div v-else class="space-y-4">
            <Card v-for="q in questionsToAnswer" :key="q.item_id + q.question" class="cursor-pointer">
              <CardHeader>
                <CardTitle>{{ q.name }}</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">{{ q.question }}</p>
                <Button variant="outline" class="mt-2" @click="goToItem(q.item_id)">
                  View Item
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
