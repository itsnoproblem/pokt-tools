import {Box, HStack, Stat, StatHelpText, StatLabel, StatNumber, useBreakpointValue} from "@chakra-ui/react";
import React, {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {CryptoNode} from "../types/crypto-node";
import {useParams} from "react-router-dom";
import {MonthlyReward} from "../types/monthly-reward";

declare const window: any;

interface NodeStatusProps {
    onNodeLoaded: (b: CryptoNode) => void,
    rewards: MonthlyReward[],
}

export const AppStatus = (props: NodeStatusProps) => {
    const [rpcEndpoint, setRpcEndpoint] = useState("");
    const [hasLoaded, setHasLoaded] = useState(false);
    const { address } = useParams();
    const isMobile = useBreakpointValue({base: false, sm: true})

    const avgPoktForLastDays = (numDays: number): number => {
        const today = new Date();
        const pastDate = new Date();
        pastDate.setTime(today.getTime() - (numDays * 86400 * 1000));
        console.log(`${numDays} days ago`, pastDate.toString());

        let thirtyDayTotal = 0;
        props.rewards.map((r) => {
            r.transactions.map((t) => {
                const txDate = new Date(t.time);
                if(txDate.getTime() >= pastDate.getTime()) {
                    thirtyDayTotal += t.num_proofs;
                }
                return true;
            });
            return true;
        });

        return Math.round((thirtyDayTotal/numDays) * 0.0089);
    }

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
    }, [address, hasLoaded, props, updateBalance, props.rewards])

    const sortedRewards = props.rewards.sort((i, j) => {
        return (i.num_relays < j.num_relays) ? 1 : -1;
    });

    return(
        <HStack mt={4} mb={8} ml={'auto'} mr={'auto'} p={0}>
            {isMobile && (
                <>
                    <Box  p={5} minWidth={"185px"} borderWidth={1} borderRadius={20} borderColor={"gray.50"}>
                        <Stat align={"center"}>
                            <StatLabel>Top Chain This Month</StatLabel>
                            <StatNumber>{sortedRewards[0]?.relays_by_chain[0]?.num_relays?.toLocaleString()}</StatNumber>
                            <StatHelpText>{sortedRewards[0]?.relays_by_chain[0]?.name}</StatHelpText>
                        </Stat>
                    </Box>
                    <Box  p={5} minWidth={"185px"}>
                        <Stat align={"center"}>
                            <StatLabel>30 Day Average</StatLabel>
                            <StatNumber>{avgPoktForLastDays(30)}</StatNumber>
                            <StatHelpText>POKT per day</StatHelpText>
                        </Stat>
                    </Box>
                    <Box borderWidth={1} borderRadius={20} p={5} minWidth={"185px"} borderColor={"gray.50"}>
                        <Stat align={"center"}>
                            <StatLabel>90 Day Average</StatLabel>
                            <StatNumber>{avgPoktForLastDays(90)}</StatNumber>
                            <StatHelpText>POKT per day</StatHelpText>
                        </Stat>
                    </Box>
                    <Box  p={5} minWidth={"185px"}>
                        <Stat align={"center"}>
                            <StatLabel>120 Day Average</StatLabel>
                            <StatNumber>{avgPoktForLastDays(120)}</StatNumber>
                            <StatHelpText>POKT per day</StatHelpText>
                        </Stat>
                    </Box>
                </>
            )}
        </HStack>
    )
}
