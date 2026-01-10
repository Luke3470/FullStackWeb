import { useRouter } from 'vue-router'

const router = useRouter()

export const BASE_API_URL = 'http://localhost:3333'


export async function get<T>(endpoint: string, auth: string | null): Promise<T> {

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (auth) {
        headers['X-Authorization'] = auth
    }

    const res = await fetch(`${BASE_API_URL}/${endpoint}`, {
        method: 'GET',
        headers: headers,
    })

    const data = await res.json()

    if (!res.ok) {
        throw data
    }

    return data
}


export async function post<T>(endpoint: string, body: any | null, auth: string | null): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (auth) {
        headers['X-Authorization'] = auth
    }

    const options: RequestInit = {
        method: 'POST',
        headers,
    }

    if (body !== null) {
        options.body = JSON.stringify(body)
    }

    const res = await fetch(`${BASE_API_URL}/${endpoint}`, options)
    const data = await res.json()

    if (!res.ok) {
        throw data
    }

    return data
}


export function getTimeLeft(endEpoch: number) {
    const now = Date.now()
    let diff = endEpoch - now
    if (diff <= 0) return "Ended"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    diff -= days * 1000 * 60 * 60 * 24

    const hours = Math.floor(diff / (1000 * 60 * 60))
    diff -= hours * 1000 * 60 * 60

    const minutes = Math.floor(diff / (1000 * 60))
    diff -= minutes * 1000 * 60

    const seconds = Math.floor(diff / 1000)

    return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

export function UseNavigation (id: number)  {
    const router = useRouter()

    const goToItem = (id: number) => {
        router.push({ name: 'item', params: { id } })
    }

    return { goToItem }
}