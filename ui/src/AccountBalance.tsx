import {Box, Text, VStack} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import axios from "axios";

interface AccountBalanceProps {
    address: string
}
const AccountBalance = (props: AccountBalanceProps) => {
    const rpcEndpoint = `http://localhost:7878/node/${props.address}`
    const [balance, setBalance] = useState(0);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const updateBalance = () => {
        axios.get(rpcEndpoint)
            .then(async (result) => {
                console.log("balance result", result);

                const bal = result.data.data.balance;
                setBalance(bal);
                setLastUpdated(new Date());
                console.log("Set balance to", balance);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    useEffect(() => {
        window.addEventListener('load', updateBalance);
    })

    return(
        <VStack align={"left"} w={"100%"} fontSize={"sm"} p={4} mb={4}>
            <Box align={"left"}><b>Account:</b> {props.address}</Box>
            <Box align={"left"}><b>Balance:</b> {new Number(balance/1000000).toFixed(4)}
                <Text d={"inline"} fontSize={"xs"}>POKT</Text>
            </Box>
            <Box align={"left"}><b>Updated:</b> {lastUpdated.toString()}</Box>
        </VStack>
    )
}
export default AccountBalance