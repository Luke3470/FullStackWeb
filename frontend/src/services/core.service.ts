import { get } from './services.config.ts';
import { toast } from "vue-sonner";
import { ref } from 'vue';

export type ItemStatus = 'BID' | 'OPEN' | 'ARCHIVE'

export interface SearchParams {
    q?: string
    status?: ItemStatus
    limit?: number
    offset?: number
}

export interface Item {
    id: number
    title: string
    image: string
    end_date: number
    current_bid?: number
    creator?: string
    status?: ItemStatus

}

export interface ItemList {
    items: Item[]
    total: number
}

interface SearchParams {
    searchQuery?: string
    statusFilter?: string
    limit?: number
    offset?: number
}

export async function searchItems(
    params: SearchParams = {},
    auth: string | null
): Promise<ItemList> {
    const query = new URLSearchParams()
    if (params.q) query.append('q', params.q)
    if (params.status) query.append('status', params.status)
    if (params.limit !== undefined) query.append('limit', String(params.limit))
    if (params.offset !== undefined) query.append('offset', String(params.offset))

    let endpoint;

    endpoint = `search?${query.toString()}`
    return get<ItemList>(endpoint, auth)
}

export async function performSearch(params: SearchParams = {}, auth: string | null = null): Promise<any[]> {
    try {
        const data = await searchItems(
            {
                q: params.searchQuery || undefined,
                status: params.statusFilter || undefined,
                limit: params.limit,
                offset: params.offset
            },
            auth
        )

        return Array.isArray(data) ? data : []
    } catch (err) {
        console.error("Search failed:", err)
        toast.error(err?.error_message || "Unable to fetch results from the server.")
        return []
    }
}