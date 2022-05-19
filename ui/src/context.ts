import {createContext} from "react";
import {CryptoNode} from "./types/crypto-node";

const defaultNodeContext: CryptoNode = {
    exists: false,
    address: '',
    service_url: '',
    balance: 0,
    chains: [],
    isJailed: true,
    pubkey: '',
    stakedBalance: 0,
    latestBlockHeight: 0,
};

export const NodeContext = createContext(defaultNodeContext);

