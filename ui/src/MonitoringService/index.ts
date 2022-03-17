import {RPC_URL} from "../configuration";
import axios, {AxiosResponse} from "axios";
import {CryptoNode} from "../types/crypto-node";
import {MonthlyReward} from "../types/monthly-reward";
import {Chain} from "../types/chain";

const HTTP_STATUS_OK = 200;

export const getNode = async (address: string): Promise<CryptoNode> => {
    const url = `${RPC_URL}/node/${address}`
    let node: CryptoNode;

    return axios.get(url)
        .then(async (result) => {
            node = {
                exists: result.data.data.address !== "",
                address: result.data.data.address,
                service_url: result.data.data.service_url,
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

export interface simulateRelayRequest {
    servicer_url: string
    chain_id: string
    payload: object
}

export const simulateRelay = async (req: simulateRelayRequest): Promise<AxiosResponse<any, any>> => {
    const url = `${RPC_URL}/tests/simulate-relay`;

    return axios.post(url, req, {
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        validateStatus: function () {
            return true;
        }
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

export const allChains: Chain[] = [
    {
        id: "0003",
        name: "AVAX"
    },
    {
        id: "00A3",
        name: "AVAX Archival"
    },
    {
        id: "0004",
        name: "BSC"
    },
    {
        id: "0010",
        name: "BSC Archival"
    },
    {
        id: "0021",
        name: "ETH"
    },
    {
        id: "0022",
        name: "ETH Archival"
    },
    {
        id:"0028",
        name: "ETH Archival Trace"
    },
    {
        id: "0026",
        name: "ETH Goerli"
    },
    {
        id: "0024",
        name: "ETH Kovan"
    },
    {
        id: "0025",
        name: "ETH Rinkeby"
    },
    {
        id: "0023",
        name: "ETH Ropsten"
    },
    {
        id: "0005",
        name: "FUSE"
    },
    {
        id: "000A",
        name: "FUSE Archival"
    },
    {
        id: "0040",
        name: "HMY 0"
    },
    {
        id: "0044",
        name: "IoTeX"
    },
    {
        id: "0001",
        name: "POKT"
    },
    {
        id: "0002",
        name: "POKT testnet"
    },
    {
        id: "0009",
        name: "Polygon"
    },
    {
        id: "000B",
        name: "Polygon Archival",
    },
    {
        id: "000F",
        name: "Polygon Mumbai"
    },
    {
        id: "0006",
        name: "Solana"
    },
    {
        id: "0027",
        name: "Gnosis (XDAI)"
    },
    {
        id: "000C",
        name: "xDAI Archival"
    }
];

