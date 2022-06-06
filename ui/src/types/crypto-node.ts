import {Chain} from './chain'

export type CryptoNode = {
    exists: boolean,
    address: string,
    service_url: string,
    balance: number,
    chains: Array<Chain>,
    isJailed: boolean,
    pubkey: string,
    stakedBalance: number,
    lastChecked?: Date,
    latestBlockTime?: Date,
    latestBlockHeight: number
}

export interface NodeProps {
    onNodeLoaded: (b: CryptoNode) => void,
    node: CryptoNode,
    address?: string,
}