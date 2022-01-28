import {createContext} from "react";
import {CryptoNode} from "./types/crypto-node";

const defaultNodeContext: CryptoNode = {
    exists: false,
    address: "",
    balance: 0,
    chains: [],
    isJailed: true,
    pubkey: '',
    stakedBalance: 0,
};

const defaultAppContext = {
    isRefreshing: true,
    setIsRefreshing: (is: boolean) => { console.log("default"); },
}

export const NodeContext = createContext(defaultNodeContext);
export const AppContext = createContext(defaultAppContext);


