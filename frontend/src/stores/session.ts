import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSessionStore = defineStore('session', () => {
    const loggedIn = ref(!!localStorage.getItem('session_token'))
    const setLoggedIn = (value: boolean) => {
        loggedIn.value = value
    }
    return { loggedIn, setLoggedIn }
})
