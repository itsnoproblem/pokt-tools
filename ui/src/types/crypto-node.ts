import {Chain} from './chain'

export type CryptoNode = {
    exists: boolean,
    address: string,
    balance: number,
    chains: Array<Chain>,
    isJailed: boolean,
    stakedBalance: number,
    lastChecked?: Date,
}

export interface NodeProps {
    onNodeLoaded: (b: CryptoNode) => void,
    node: CryptoNode,
    address?: string,
}