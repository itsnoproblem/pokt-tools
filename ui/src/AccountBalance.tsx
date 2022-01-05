import {Box, Text, VStack} from "@chakra-ui/react";
import React, {useCallback, useEffect, useState} from "react";
import axios from "axios";
declare const window: any;

interface AccountBalanceProps {
    address: string
}
const AccountBalance = (props: AccountBalanceProps) => {
    const [rpcEndpoint, setRpcEndpoint] = useState("");
    const [balance, setBalance] = useState(0);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [hasLoaded, setHasLoaded] = useState(false);

    const updateBalance = useCallback(() => {
        if(rpcEndpoint === "") {
            return;
        }
        
        axios.get(rpcEndpoint)
            .then(async (result) => {
                console.log("balance result", result);

                const bal = result.data.data.balance;
                setBalance(bal);
                setLastUpdated(new Date());
                console.log("Set balance to", balance);
                setHasLoaded(true);
            })
            .catch((err) => {
                console.error(err);
                setHasLoaded(true);
            });
    }, [balance, rpcEndpoint]);

    useEffect(() => {
        if(!hasLoaded) {
            const rpcUrl = `${window._env_.RPC_URL}/node/${props.address}`
            setRpcEndpoint(rpcUrl);
            updateBalance();
        }
    }, [hasLoaded, props.address, updateBalance])

    return(
        <VStack align={"left"} w={"100%"} fontSize={"sm"} p={4} mb={4}>
            <Box align={"left"}><b>Account:</b> {props.address}</Box>
            <Box align={"left"}><b>Balance:</b> {Number(balance/1000000).toFixed(4)}
                <Text d={"inline"} fontSize={"xs"}>POKT</Text>
            </Box>
            <Box align={"left"}><b>Updated:</b> {lastUpdated.toString()}</Box>
        </VStack>
    )
}
export default AccountBalance