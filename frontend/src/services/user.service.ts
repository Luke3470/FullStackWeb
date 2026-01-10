import { post } from './services.config.ts'
import { toast } from "vue-sonner"

export async function logIn(email: string, password: string) {
    try {
        return await post('login', { email, password })
    } catch (err: any) {
        console.error("Login failed:", err)
        const message = err?.response?.data?.error_message || err.message || "Unable to login."
        toast.error(message)
        return null
    }
}

export async function logOut(token: string) {
    try {
        return await post('logout',null,token)
    } catch (err: any) {
        console.error("Log Out failed:", err)
        const message = err?.response?.data?.error_message || err.message || "Unable to login."
        toast.error(message)
        return null
    }
}