import {createContext} from "react";
import {CryptoNode} from "./types/crypto-node";

export const defaultNodeContext: CryptoNode = {
    exists: false,
    address: "",
    balance: 0,
    chains: [],
    isJailed: true,
    stakedBalance: 0,
};

export const NodeContext = createContext(defaultNodeContext);
