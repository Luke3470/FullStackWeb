import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSessionStore = defineStore('session', () => {
    const loggedIn = ref(!!localStorage.getItem('session_token'))
    const authToken = ref(localStorage.getItem('session_token'))

    function setLoggedIn(value: boolean) {
        loggedIn.value = value
        if (!value) authToken.value = null
    }

    function setAuthToken(token: string) {
        authToken.value = token
        loggedIn.value = true
        localStorage.setItem('session_token', token)
    }

    return { loggedIn, authToken, setLoggedIn, setAuthToken }
})