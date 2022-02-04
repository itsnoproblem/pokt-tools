import {Box, HStack, Stat, StatHelpText, StatLabel, StatNumber, useBreakpointValue,} from "@chakra-ui/react";
import React from "react";

import {CryptoNode} from "../types/crypto-node";
import {MonthlyReward} from "../types/monthly-reward";

interface AppStatusProps {
    rewards: MonthlyReward[],
    onNodeLoaded: (node: CryptoNode) => void,
    onRewardsLoaded: (months: MonthlyReward[]) => void,
    isRefreshing: boolean,
    setIsRefreshing: (is: boolean) => void,
}

interface timeAgo {
    units: string
    value: number
}

export const POKTPerRelay = 0.0089;

export const NodeMetrics = (props: AppStatusProps) => {

    const isMobile = useBreakpointValue([true, false])

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

    const timeSince = (test: Date): timeAgo => {
        const now = Date.now();
        const testSec = test.getTime();
        const seconds = (now - testSec) / 1000;
        let interval = seconds / 86400;
        if (interval > 1) {
            return {
                units: " days",
                value: Math.floor(interval)
            };
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return {
                units: " hours",
                value: Math.floor(interval)
            };
        }
        interval = seconds / 60;
        if (interval > 1) {
            return {
                units: "minutes",
                value: Math.floor(interval)
            };
        }

        return {
            units: "seconds",
            value: Math.floor(seconds)
        };
    }

    const sortedRewards = props.rewards;
    const sortedByChain = (sortedRewards[0] !== undefined) ?
        sortedRewards[0].relays_by_chain.sort((a, b) => {
            return (a.num_relays > b.num_relays) ? -1 : 1;
        }) : [];

    const latestTxTime = () => {
        for(let j = 0; j < props.rewards.length; j++) {
            const txs = props.rewards[j].transactions;
            console.log("txs", txs);
            for(let i=txs.length-1; i >= 0; i--) {
                if(txs[i].is_confirmed) {
                    console.log("latestTxTime", txs[i].time)
                    return new Date(txs[i].time);
                };
            }
        }
    }

    const lastRewardDate = latestTxTime();
    console.log(`latest: ${lastRewardDate}`)

    let timeSinceReward;
    if(lastRewardDate) {
        timeSinceReward = timeSince(lastRewardDate);
    } else {
        timeSinceReward = {
            units: "-----",
            value: "?",
        }
    }

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
                        <Box  p={5} minWidth={"185px"} borderWidth={1} borderRadius={20} borderColor={"gray.50"}>
                            <Stat align={"center"}>
                                <StatLabel>Last reward</StatLabel>
                                <StatNumber>{timeSinceReward.value}</StatNumber>
                                <StatHelpText>{timeSinceReward.units} ago</StatHelpText>
                            </Stat>
                        </Box>
                    </>
                )}
            </HStack>

        </>

)}
