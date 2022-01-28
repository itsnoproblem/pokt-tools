import {
    Box, Center,
    Flex,
    HStack,
    IconButton, Kbd,
    Spinner,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber, Text,
    useBreakpointValue,
} from "@chakra-ui/react";
import {MdRefresh} from "react-icons/all";
import React, {useCallback, useContext, useState} from "react";

import {CryptoNode} from "../types/crypto-node";
import {MonthlyReward} from "../types/monthly-reward";
import {NodeContext} from "../context";

import {ConnectedChainsBadge} from "./badges/ConnectedChainsBadge";
import {getClaims, getNode, getHeight} from "../MonitoringService";

interface AppStatusProps {
    rewards: MonthlyReward[],
    onNodeLoaded: (node: CryptoNode) => void,
    onRewardsLoaded: (months: MonthlyReward[]) => void,
    isRefreshing: boolean,
    setIsRefreshing: (is: boolean) => void,
}

export const AppStatus = (props: AppStatusProps) => {
    const POKTPerRelay = 0.0089;
    const [currentHeight, setCurrentHeight] = useState(0);
    const isMobile = useBreakpointValue([true, false])
    const node = useContext(NodeContext);

    const avgPoktForLastDays = (numDays: number): number => {
        const today = new Date();
        let pastDate = new Date();
        pastDate.setTime(today.getTime() - (numDays * 86400 * 1000));
        if(numDays === 0) {
            pastDate = new Date();
            pastDate.setHours(0, 0, 1);
        }

        let total = 0;
        props.rewards.map((r) => {
            r.transactions.map((t) => {
                const txDate = new Date(t.time);
                if((txDate.getTime() >= pastDate.getTime()) && t.is_confirmed) {
                    total += t.num_proofs;
                }
                return this;
            });
            return this;
        });

        let relays = total;
        if(numDays > 0) {
            relays = (total/numDays);
        }

        return Math.round(relays * POKTPerRelay);
    }

    const sortedRewards = props.rewards;
    const sortedByChain = (sortedRewards[0] !== undefined) ?
        sortedRewards[0].relays_by_chain.sort((a, b) => {
            return (a.num_relays > b.num_relays) ? -1 : 1;
        }) : [];
    // console.log("this month", sortedRewards[0]);
    // sortedRewards[0].transactions.map((tx, i) => {
    //     if(!tx.is_confirmed) {
    //         if(currentHeight <= tx.expire_height) {
    //
    //         }
    //     }
    //     return true;
    // });

    const updateNodeData = useCallback(async () => {
        if(!node.address) {
            return;
        }

        props.setIsRefreshing(true);
        try {
            const h = await getHeight();
            setCurrentHeight(h);
            const n = await getNode(node.address);
            props.onNodeLoaded(n);
            const c = await getClaims(node.address);
            props.onRewardsLoaded(c);
        }
        catch (err) {
            console.error("updateNodeData", err);
        }
        props.setIsRefreshing(false);

    }, [node, props]);

    return(
        <>
            <HStack mt={8} ml={'auto'} mr={'auto'} p={0}>
                {!isMobile && (
                    <>
                        <Box  p={5} minWidth={"185px"} borderWidth={1} borderRadius={20} borderColor={"gray.50"}>
                            <Stat align={"center"}>
                                <StatLabel>Top Chain This Month</StatLabel>
                                <StatNumber>{sortedByChain[0]?.name}</StatNumber>
                                <StatHelpText>{sortedByChain[0]?.num_relays?.toLocaleString()} relays</StatHelpText>
                            </Stat>
                        </Box>
                        <Box  p={5} minWidth={"185px"}>
                            <Stat align={"center"}>
                                <StatLabel>10 Day Average</StatLabel>
                                <StatNumber>{avgPoktForLastDays(10)}</StatNumber>
                                <StatHelpText>POKT per day</StatHelpText>
                            </Stat>
                        </Box>
                        <Box borderWidth={1} borderRadius={20} p={5} minWidth={"185px"} borderColor={"gray.50"}>
                            <Stat align={"center"}>
                                <StatLabel>30 Day Average</StatLabel>
                                <StatNumber>{avgPoktForLastDays(30)}</StatNumber>
                                <StatHelpText>POKT per day</StatHelpText>
                            </Stat>
                        </Box>
                        <Box  p={5} minWidth={"185px"}>
                            <Stat align={"center"}>
                                <StatLabel>90 Day Average</StatLabel>
                                <StatNumber>{avgPoktForLastDays(90)}</StatNumber>
                                <StatHelpText>POKT per day</StatHelpText>
                            </Stat>
                        </Box>
                        <Box  p={5} minWidth={"185px"} borderWidth={1} borderRadius={20} borderColor={"gray.50"}>
                            <Stat align={"center"}>
                                <StatLabel>Last 24 hrs</StatLabel>
                                <StatNumber>{avgPoktForLastDays(1) ?? 0}</StatNumber>
                                <StatHelpText>POKT earned</StatHelpText>
                            </Stat>
                        </Box>
                    </>
                )}
            </HStack>
            {(!isMobile && node !== undefined) && (
                <Box mb={4} mt={12}>
                    <Center ml="auto" mr="auto">
                        <Text>Height: <Kbd>{currentHeight}</Kbd></Text>
                        <Box  color={"gray.400"} ml={8}><em>Updated: {node.lastChecked?.toLocaleString()}</em></Box>
                        <IconButton
                            ml={4} mr={4}
                            aria-label={"Refresh"}
                            variant={"ghost"}
                            _focus={{boxShadow: 0}}
                            icon={props.isRefreshing ? (<Spinner size={"xs"}/>) : (<MdRefresh/>)}
                            onClick={updateNodeData}
                        />
                        <ConnectedChainsBadge/>
                    </Center>
                </Box>
            )}
        </>

)}
