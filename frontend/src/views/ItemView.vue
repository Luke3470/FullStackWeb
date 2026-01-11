<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed  } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session.ts'
import { getItemDetails, getItemBids, submitBid} from '../services/core.service.ts'
import { getItemQuestions, submitQuestionAnswer, submitQuestion } from '../services/questions.service.ts';
import { getTimeLeft } from '../services/services.config.ts'
import { toast } from 'vue-sonner'
import { storeToRefs } from 'pinia';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()
const { authToken, userId } = storeToRefs(session)

const itemId = ref<string | null>(null)
const loading = ref(true)
const tick = ref(0)
const item = ref<any>(null)
const bids = ref<any[]>([])
const questions = ref<any[]>([])
const newAnswers = ref<{ [key: number]: string }>({})
const showBidModal = ref(false)
const bidAmount = ref<number | null>(null)
const showQuestionModal = ref(false)
const newQuestion = ref("")

const minimumBid = computed(() => {
  if (!item.value) return 0
  return item.value.current_bid ?? item.value.starting_bid ?? 0
})

const timeLeft = computed(() => {
  if (!item.value?.end_date) return ''
  tick.value
  return getTimeLeft(item.value.end_date)
})

const canAnswer = computed(() => {
  return item.value?.creator_id == userId.value
})

const openQuestionModal = () => {
  if (!authToken.value) {
    return toast.error("You must be logged in to ask a question.")
  }
  showQuestionModal.value = true

}

const closeQuestionModal = () => {
  showQuestionModal.value = false
  newQuestion.value = ""
}

const openBidModal = () => {
  if (!authToken.value) {
    return toast.error("You must be logged in to place a bid.")
  }
  showBidModal.value = true
}

const closeBidModal = () => {
  showBidModal.value = false
  bidAmount.value = null
}

const goToUser = (userId: number) => {
  router.push(`/user/${userId}`)
}

const formatDate = (epochMs: number) => {
  const d = new Date(epochMs)
  return d.toLocaleString()
}

const placeBid = async () => {
  if (!bidAmount.value || bidAmount.value <= 0) {
    return toast.error("Please enter a valid bid.")
  }

  if (bidAmount.value <= minimumBid.value) {
    return toast.error(`Your bid must be greater than £${minimumBid.value}.`)
  }

  try {

    await submitBid(item.value.item_id, {amount: bidAmount.value}, authToken.value)

    toast.success("Your bid has been placed!")
    closeBidModal()

    const bidResponse = await getItemBids(itemId.value)
    if (bidResponse) bids.value = bidResponse

    const updatedItem = await getItemDetails(itemId.value!)
    if (updatedItem) item.value = updatedItem

  } catch (err: any) {
    toast.error("Failed to place bid: " + err.message)
  }
}

const submitNewQuestion = async () => {
  if (!newQuestion.value.trim()) {
    return toast.error("Please enter a question.")
  }

  try {
    await submitQuestion(item.value.item_id, { question_text: newQuestion.value }, authToken.value)
    toast.success("Your question was posted!")
    closeQuestionModal()

    await fetchQuestions(item.value.item_id)
  } catch (err: any) {
    toast.error("Failed to submit question: " + err.message)
  }
}

const submitAnswer = async (questionId: number) => {
  const answer = newAnswers.value[questionId]?.trim()
  if (!answer) return toast.error('Answer cannot be empty.')

  try {
    console.log(questionId,{answer_text:answer},authToken.value)
    await submitQuestionAnswer(questionId, {answer_text:answer}, authToken.value)

    toast.success('Answer submitted!')

    await fetchQuestions(itemId.value)

  } catch (err: any) {
    console.error(err)
    toast.error('Failed to submit answer: ' + err?.message)
  }
}

const fetchQuestions = async (id:string) => {
    const questionResponse = await getItemQuestions(id)
    if (questionResponse) {
      questions.value = questionResponse
    } else {
      toast.error("Questions Couldn't be collected")
    }
}

const fetchItemDetails = async (id: string) => {
  loading.value = true
  try {
    const response = await getItemDetails(id)
    if (response) {
      item.value = response
    } else {
      toast.error('Item not found')
      router.push('/')
    }
    const bidResponse = await getItemBids(id)
    if (bidResponse) {
      bids.value = bidResponse
    } else {
      toast.error("Bids Couldn't be collected")
    }
    fetchQuestions(id)

  } catch (err: any) {
    console.error(err)
    toast.error('Failed to fetch item: ' + err.message)
    router.push('/')
  } finally {
    if (item.value) loading.value = false
  }
}

let timer: number
onMounted(() => {
  itemId.value = route.params.id
  if (itemId.value) {
    fetchItemDetails(itemId.value)
  } else {
    toast.error('No item ID provided')
    router.push('/')
  }
  timer = setInterval(() => {
    tick.value++
  }, 1000)
})

onBeforeUnmount(() => clearInterval(timer))

</script>

<template>
  <div class="max-w-6xl mx-auto p-4 space-y-6">
    <div class="flex flex-col lg:flex-row gap-6">
      <Card class="flex-1 lg:w-3/4">
        <CardHeader>
          <CardTitle class="text-lg font-bold">{{ item?.name }}</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <img
              src="https://via.placeholder.com/600x300"
              alt="Item image"
              class="w-full h-64 object-cover rounded-md"
          />
          <p class="text-sm text-muted-foreground">{{ item?.description }}</p>

          <p v-if="(item?.current_bid ?? item?.starting_bid) !== item?.starting_bid">
            <span class="font-semibold">Current Bid:</span>
            ${{ item?.current_bid ?? item?.starting_bid ?? '0' }}
          </p>

          <p>
            <span class="font-semibold">Starting Bid:</span>
            ${{ item?.starting_bid ?? '0' }}
          </p>

          <p class="font-semibold text-purple-600">
            <span>End Date:</span>
            {{ timeLeft }}
          </p>

          <p v-if="item?.current_bid_holder">
            <span class="font-semibold">Current Bid Holder:</span>
            <Button variant="link" @click="goToUser(item.current_bid_holder.user_id)">
              {{ item.current_bid_holder.first_name }} {{ item.current_bid_holder.last_name }}
            </Button>
          </p>

          <p>
            <span class="font-semibold">Created By:</span>
            <Button variant="link" @click="goToUser(item?.creator_id)">
              {{ item?.first_name }} {{ item?.last_name }}
            </Button>
          </p>
          <Button
              v-if="!canAnswer"
              class="mt-2"
              @click="openBidModal"
          >
            Place Bid
          </Button>
        </CardContent>
      </Card>

      <div class="lg:w-1/4 w-full overflow-x-auto">
        <table class="min-w-full border rounded-md">
          <thead>
          <tr>
            <th class="px-4 py-2 text-left">Bidder</th>
            <th class="px-4 py-2 text-left">Amount</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="bid in bids.slice(0, 8)" :key="bid.bid_id" class="border-t">
            <td class="px-4 py-2">
              <Button variant="link" @click="goToUser(bid.user_id)">
                {{ bid.first_name }} {{ bid.last_name }}
              </Button>
            </td>
            <td class="px-4 py-2">${{ bid.amount }}</td>
          </tr>
          <tr v-if="bids.length === 0">
            <td colspan="3" class="text-center py-4">No bids yet.</td>
          </tr>
          </tbody>
        </table>
      </div>

    </div>

    <div class="space-y-4">
      <h2 class="text-lg font-bold">Questions</h2>
      <Button
          v-if="!canAnswer"
          class="mt-2"
          @click="openQuestionModal"
      >
        Ask a Question
      </Button>
      <div v-if="questions.length === 0" >
        No questions yet.
      </div>

      <div v-else class="space-y-2">
        <Card v-for="q in questions" :key="q.question_id">
          <CardContent class="space-y-2">
            <p class="font-semibold">{{ q.question_text }}</p>
            <p>
              {{ q.answer_text ?? 'Waiting for response' }}
            </p>
            <div v-if="canAnswer">
              <textarea
              v-model="newAnswers[q.question_id]"
              :placeholder="q.answer_text ? 'Edit your answer...' : 'Write your answer...'"
              class="w-full border rounded-md p-2 text-sm"
              ></textarea>
              <Button
                  variant="outline"
                  class="mt-1"
                  @click="submitAnswer(q.question_id)"
              >
                {{ q.answer_text ? 'Update Answer' : 'Submit Answer' }}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  <div
      v-if="showBidModal"
      class="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
  >
    <div class="bg-card p-6 rounded-lg shadow-xl w-full max-w-md space-y-4">
      <h2 class="text-xl font-semibold">Place a Bid</h2>

      <p class="text-sm">
        Bidding on: <strong>{{ item?.name }}</strong>
      </p>

      <input
          v-model.number="bidAmount"
          type="number"
          min="1"
          class="w-full border rounded-md p-2"
          placeholder="Enter bid amount"
      />

      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="closeBidModal">Cancel</Button>
        <Button @click="placeBid">Submit Bid</Button>
      </div>
    </div>
  </div>
  <div
      v-if="showQuestionModal"
      class="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
  >
    <div class="bg-card p-6 rounded-lg shadow-xl w-full max-w-md space-y-4">
      <h2 class="text-xl font-semibold">Ask a Question</h2>

      <p class="text-sm">
        Asking about: <strong>{{ item?.name }}</strong>
      </p>

      <textarea
          v-model="newQuestion"
          rows="3"
          class="w-full border rounded-md p-2 text-sm"
          placeholder="Type your question..."
      ></textarea>

      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="closeQuestionModal">Cancel</Button>
        <Button @click="submitNewQuestion">Submit Question</Button>
      </div>
    </div>
  </div>
</template>
