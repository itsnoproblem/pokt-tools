export type RelayTestResponse = {
    chain_id: string
    chain_name: string
    duration_avg_ms: number
    duration_min_ms: number
    duration_max_ms: number
    message: string
    relay_request: RelayRequest
    relay_responses: RelayResponse[]
    status_code: number
    success: boolean
}

export type RelayRequest = {
    method: string
    path: string
    data: string
}

export type RelayResponse = {
    duration_ms: number
    status_code: number
    data: any
}