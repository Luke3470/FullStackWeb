import { get } from './services.config.ts';

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