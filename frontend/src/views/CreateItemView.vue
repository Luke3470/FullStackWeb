<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDraftsStore, ItemDraft, useSessionStore } from '../stores/session.ts'
import { createItem } from '../services/core.service.ts'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const draftsStore = useDraftsStore()
const session = useSessionStore()
const { authToken } = storeToRefs(session)
const router = useRouter()

const name = ref('')
const description = ref('')
const currentBid = ref<number | null>(null)
const endDate = ref('')


const editingDraftId = ref<string | null>(null)

const resetForm = () => {
  name.value = ''
  description.value = ''
  currentBid.value = null
  endDate.value = ''
  editingDraftId.value = null
}


const currentEditingDraft = computed(() => {
  if (!editingDraftId.value) return null
  return draftsStore.drafts.find(d => d.id === editingDraftId.value) || null
})
const saveDraft = () => {
  if (!name.value || !name.value.trim()) {
    toast.error('Item title is required!')
    return
  }

  const draft: ItemDraft = {
    id: editingDraftId.value || Date.now().toString(),
    name: name.value.trim(),
    description: description.value,
    current_bid: currentBid.value || 0,
    end_date: endDate.value
  }

  draftsStore.saveDraft(draft)
  toast.success('Draft saved locally!')
  resetForm()
}


const editDraft = (draft: ItemDraft) => {
  name.value = draft.name
  description.value = draft.description
  currentBid.value = draft.current_bid || 0
  endDate.value = draft.end_date
  editingDraftId.value = draft.id
}


const deleteDraft = (id: string) => {
  draftsStore.deleteDraft(id)
  toast.success('Draft deleted!')
  if (editingDraftId.value === id) resetForm()
}


const submitItem = async () => {

  if (!name.value || !description.value || !endDate.value|| !endDate.value) {
    toast.error('Please fill all required fields!')
    return
  }

  try {
    const token = authToken.value
    const endDateObj = new Date(endDate.value)
    const endTimestamp = endDateObj.getTime()

    const payload = {
      name: name.value,
      description: description.value,
      starting_bid: currentBid.value || 0,
      end_date: endTimestamp
    }
    const response = await createItem(payload, token)
    if (response) {
      toast.success('Item submitted successfully!')
      if (editingDraftId.value) draftsStore.deleteDraft(editingDraftId.value)
      resetForm()
      router.push('/')
    }
  } catch (err: any) {
    toast.error('Failed to submit item: ' + err.message)
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-4 space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>
          {{ editingDraftId ? `Editing Draft: ${currentEditingDraft?.name}` : 'Create New Item' }}
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Item Name</Label>
          <Input id="name" v-model="name" placeholder="Item Name" />

          <Label for="description">Description</Label>
          <Textarea id="description" v-model="description" placeholder="Item Description" />

          <Label for="currentBid">Starting Bid (£)</Label>
          <Input id="currentBid" v-model="currentBid" type="number" placeholder="0" />

          <Label for="endDate">End Date</Label>
          <Input id="endDate" v-model="endDate" type="datetime-local" />
        </div>

        <div class="flex space-x-2 mt-4">
          <Button variant="secondary" @click="saveDraft">Save Draft</Button>
          <Button variant="default" @click="submitItem">Submit</Button>
          <Button variant="ghost" @click="resetForm">Clear</Button>
        </div>
      </CardContent>
    </Card>

    <div v-if="draftsStore.drafts.length">
      <h3 class="text-xl font-semibold mb-2">Local Drafts</h3>
      <ul class="space-y-2">
        <li
            v-for="draft in draftsStore.drafts"
            :key="draft.id"
            class="border rounded-md p-4 flex justify-between items-center"
        >
          <div>
            <p class="font-semibold">{{ draft.name }}</p>
            <p class="text-sm text-muted-foreground">{{ draft.description }}</p>
          </div>
          <div class="flex space-x-2">
            <Button size="sm" variant="outline" @click="editDraft(draft)">Edit</Button>
            <Button size="sm" variant="destructive" @click="deleteDraft(draft.id)">Delete</Button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
