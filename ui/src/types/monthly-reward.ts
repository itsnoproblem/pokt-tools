import {Transaction} from "./transaction";

export type MonthlyReward = {
    year: number,
    month: number,
    num_relays: number,
    pokt_amount: number,
    relays_by_chain: RelaysByChain[]
    transactions: Array<Transaction>
}

export type RelaysByChain = {
    chain: string,
    name: string,
    num_relays: number,
}