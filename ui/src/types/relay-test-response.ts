export type RelayTestResponse = {
    chain_id: string
    chain_name: string
    duration_ms: number
    message: string
    relay_request: RelayRequest
    relay_response: RelayResponse
    status_code: number
    success: boolean
}

export type RelayRequest = {
    method: string
    path: string
    data: string
}

export type RelayResponse = {
    status_code: number
    data: any
}