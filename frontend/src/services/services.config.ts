
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


export async function post<T>(endpoint: string, body: any, auth:string | null): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (auth) {
        headers['X-Authorization'] = auth
    }
    const res = await fetch(`${BASE_API_URL}/${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    })

    if (!res.ok) {
        throw new Error(`POST ${endpoint} failed: ${res.statusText}`)
    }

    return res.json()
}

