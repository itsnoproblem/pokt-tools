import axios from "axios";
import {RelayTestResponse} from "../types/relay-test-response";
import {PingTestResponse} from "../types/ping-test-response";

const POKT_LINT_URL = 'https://2eqrf8goof.execute-api.us-east-1.amazonaws.com/prod';
const HTTP_STATUS_OK = 200;
const httpClientTimeout = 30000;
const RELAY_TEST_PATH = 'relay-test-qa';

export const simulateRelays = async (nodeURL: string, nodeID: string, chains: string[]): Promise<any> => {
    const url = `${POKT_LINT_URL}/${RELAY_TEST_PATH}`
    var data;
    console.log("simulateRelays", chains)
    data =  {
        node_url: nodeURL,
        node_id: nodeID,
        chain_ids: chains
    }

    return axios.post(url,data, {timeout: httpClientTimeout})
        .then(async (result) => {
            if(result.status !== HTTP_STATUS_OK){
                throw new Error(`${result.status}: ${result.statusText}`)
            }

            return result.data as Record<string, RelayTestResponse>;
        })
        .catch((err) => {
            console.error(url, err);
            throw err;
        });
}

export const pingTest = async (nodeURL: string, numPings: number): Promise<any> => {
    const url = `${POKT_LINT_URL}/ping-test-qa`

    return axios.post(url, {
        node_url: nodeURL,
        num_pings: numPings
    })
        .then(async (result) => {
            console.log(result);
            return result.data as PingTestResponse;
        })
        .catch((err) => {
            console.error(err);
            throw err;
        })
}


