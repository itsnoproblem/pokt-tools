export type PingTestResponse = {
    num_sent: number
    num_ok: number
    min_time_ms: number
    max_time_ms: number
    avg_time_ms: number
    median_time_ms: number
    results: PingResponse[]
}

export type PingResponse = {
    duration_ms: number
    status_code: number
}
