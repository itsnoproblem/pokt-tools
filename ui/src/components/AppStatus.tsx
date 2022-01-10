import {Box, VStack} from "@chakra-ui/react";
import React, {useCallback, useContext, useEffect, useState} from "react";
import axios from "axios";
import {CryptoNode} from "../types/crypto-node";
import {NodeContext} from "../node-context";
import {useParams} from "react-router-dom";

declare const window: any;

interface NodeStatusProps {
    onNodeLoaded: (b: CryptoNode) => void
}

export const AppStatus = (props: NodeStatusProps) => {
    const [rpcEndpoint, setRpcEndpoint] = useState("");
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [hasLoaded, setHasLoaded] = useState(false);
    const node = useContext(NodeContext);
    const { address } = useParams();

    console.log("NODE", node);

    const updateBalance = useCallback(() => {
        if(rpcEndpoint === "" || address === "") {
            return;
        }
        
        axios.get(rpcEndpoint)
            .then(async (result) => {
                console.log("Node status result", result);

                const node: CryptoNode = {
                    exists: result.data.data.address !== "",
                    address: result.data.data.address,
                    balance: result.data.data.balance,
                    chains: result.data.data.chains,
                    isJailed: result.data.data.is_jailed,
                    stakedBalance: result.data.data.staked_balance,
                }
                node.lastChecked = new Date();
                props.onNodeLoaded(node);

                console.log(rpcEndpoint, node);
                setHasLoaded(true);
            })
            .catch((err) => {
                console.error(err);
                // node.exists = false;
                // props.onNodeLoaded(node);
                setHasLoaded(true);
            });
    }, [props, address, rpcEndpoint]);

    useEffect(() => {
        if(!hasLoaded) {
            const rpcUrl = `${window._env_.RPC_URL}/node/${address}`
            setRpcEndpoint(rpcUrl);
            updateBalance();
        }
    }, [address, hasLoaded, props, updateBalance])

    return(
        <VStack align={"left"} w={"100%"} fontSize={"sm"} p={4} mb={4}>
            <Box align={"left"}></Box>
        </VStack>
    )
}
