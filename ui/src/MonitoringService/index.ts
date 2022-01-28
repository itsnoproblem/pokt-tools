import {RPC_URL} from "../configuration";
import axios from "axios";
import {CryptoNode} from "../types/crypto-node";
import {MonthlyReward} from "../types/monthly-reward";

const HTTP_STATUS_OK = 200;

export const getNode = async (address: string): Promise<CryptoNode> => {
    const url = `${RPC_URL}/node/${address}`
    let node: CryptoNode;

    return axios.get(url)
        .then(async (result) => {
            node = {
                exists: result.data.data.address !== "",
                address: result.data.data.address,
                balance: result.data.data.balance,
                chains: result.data.data.chains,
                isJailed: result.data.data.is_jailed,
                pubkey: result.data.data.pubkey,
                stakedBalance: result.data.data.staked_balance,
            }
            node.lastChecked = new Date();
            return node;
        })
        .catch((err) => {
            console.error(err);
            throw err;
        });
}

export  const getClaims = async (address: string): Promise<MonthlyReward[]> => {
    const url = `${RPC_URL}/node/${address}/rewards`;
    return axios.get(url).then((result) => {
        let rewards: MonthlyReward[] = result.data.data as MonthlyReward[];

        if(result.status !== HTTP_STATUS_OK) {
            throw new Error(`RPC returned status ${result.status} for ${url}`)
        }

        return rewards;
    });
}

export const getHeight = async (): Promise<number> => {
    const url = `${RPC_URL}/height`;
    return axios.get(url).then((result) => {
        if(result.status !== HTTP_STATUS_OK) {
            throw new Error(`RPC returned status ${result.status} for ${url}`);
        }

       return result.data.data.height;
    });
}
