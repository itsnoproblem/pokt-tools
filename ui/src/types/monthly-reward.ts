import {Transaction} from "./transaction";

export type MonthlyReward = {
    year: number,
    month: number,
    num_relays: number,
    pokt_amount: number,
    transactions: Array<Transaction>
}