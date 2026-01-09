import { get } from './services.config.ts';
import {toast} from "vue-sonner";
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

interface SearchRefs {
    searchQuery: any
    statusFilter: any
    limit: any
    offset: any
    results: any
}

export async function searchItems(
    params: SearchParams = {},
): Promise<ItemList> {
    const query = new URLSearchParams()
    if (params.q) query.append('q', params.q)
    if (params.status) query.append('status', params.status)
    if (params.limit) query.append('limit', params.limit.toString())
    if (params.offset) query.append('offset', params.offset.toString())

    let endpoint;
    if (!params){
        endpoint = `search?${query.toString()}`
    }
    else
    {
        endpoint = `search?${query.toString()}`
    }
    return get<ItemList>(endpoint, null)
}

export async function performSearch (refs: SearchRefs) {
    const { searchQuery, statusFilter, limit, offset, results } = refs

    try {
        const data = await searchItems({
            q: searchQuery.value || undefined,
            status: statusFilter.value || undefined,
            limit: limit.value,
            offset: offset.value,
        })

        results.value = Array.isArray(data) ? data : []

    } catch (err) {
        console.error("Search failed:", err)
        results.value = []

        const message = err?.error_message || "Unable to fetch results from the server."
        toast.error(message)
    }
}
