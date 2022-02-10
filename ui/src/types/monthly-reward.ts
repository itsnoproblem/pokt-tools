import {Transaction} from "./transaction";

export type MonthlyReward = {
    year: number,
    month: number,
    num_relays: number,
    pokt_amount: number,
    relays_by_chain: RelaysByChain[],
    avg_sec_between_rewards: number,
    total_sec_between_rewards: number,
    transactions: Array<Transaction>
    days_of_week: DayOfWeek[]
}

export type RelaysByChain = {
    chain: string,
    name: string,
    num_relays: number,
}

export type DayOfWeek = {
    name: string
    num_proofs: number
}

export const monthNames: Record<number, string> = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December"
}