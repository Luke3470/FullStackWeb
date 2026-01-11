import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSessionStore = defineStore('session', () => {
    const loggedIn = ref(!!localStorage.getItem('session_token'))
    const authToken = ref(localStorage.getItem('session_token'))
    const userId = ref(localStorage.getItem('user_id'))

    function setLoggedIn(value: boolean) {
        loggedIn.value = value
        if (!value) {
            authToken.value = null
            userId.value = null
            localStorage.removeItem('session_token')
            localStorage.removeItem('user_id')
        }
    }

    function setAuthToken(token: string | null, id?: string) {
        authToken.value = token
        userId.value = id ?? null
        loggedIn.value = !!token

        if (token) localStorage.setItem('session_token', token)
        else localStorage.removeItem('session_token')

        if (id) localStorage.setItem('user_id', id)
        else localStorage.removeItem('user_id')
    }

    function setUserId(id: string | null) {
        userId.value = id
        if (id) localStorage.setItem('user_id', id)
        else localStorage.removeItem('user_id')
    }

    return { loggedIn, authToken, userId, setLoggedIn, setAuthToken, setUserId }
})

export interface ItemDraft {
    id: string
    name: string
    description: string
    current_bid?: number
    end_date: string
    first_name?: string
    last_name?: string
}

export const useDraftsStore = defineStore('drafts', () => {
    const drafts = ref<ItemDraft[]>(JSON.parse(localStorage.getItem('item_drafts') || '[]'))

    const saveDraft = (draft: ItemDraft) => {
        const index = drafts.value.findIndex(d => d.id === draft.id)
        if (index >= 0) drafts.value[index] = draft
        else drafts.value.push(draft)

        localStorage.setItem('item_drafts', JSON.stringify(drafts.value))
    }

    const deleteDraft = (id: string) => {
        drafts.value = drafts.value.filter(d => d.id !== id)
        localStorage.setItem('item_drafts', JSON.stringify(drafts.value))
    }

    const clearDrafts = () => {
        drafts.value = []
        localStorage.removeItem('item_drafts')
    }

    return { drafts, saveDraft, deleteDraft, clearDrafts }
})