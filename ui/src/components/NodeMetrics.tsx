import {
    Box, color,
    HStack,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    useBreakpointValue, useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";

import {CryptoNode} from "../types/crypto-node";
import {MonthlyReward, monthNames} from "../types/monthly-reward";
import {MonthlyRewards} from "./MonthlyRewards";

interface AppStatusProps {
    rewards: MonthlyReward[],
    onNodeLoaded: (node: CryptoNode) => void,
    onRewardsLoaded: (months: MonthlyReward[]) => void,
    isRefreshing: boolean,
    setIsRefreshing: (is: boolean) => void,
}

interface TimeUnits {
    units: string
    value: number
}

export const POKTPerRelay = 0.0089;

export const NodeMetrics = (props: AppStatusProps) => {

    const isMobile = useBreakpointValue([true, false]);
    const statHoverColor = useColorModeValue('cyan.800', 'blue.100');
    const statBorderColor = useColorModeValue('gray.50', 'gray.50');
    const { isOpen: showAllTime, onToggle: toggleShowAllTime } = useDisclosure({ defaultIsOpen: true });

    const emptyTimeUnits: TimeUnits = { units: '---', value: -1 }
    const [timeBetweenRewardsLatest, setTimeBetweenRewardsLatest] = useState(emptyTimeUnits);
    const [timeBetweenRewardsAllTime, setTimeBetweenRewardsAllTime] = useState(emptyTimeUnits);
    const [timeSinceReward, setTimeSinceReward] = useState(emptyTimeUnits);
    const [latestMonthName, setLatestMonthName] = useState('');

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

    const timeUnits = (seconds: number): TimeUnits => {
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

    const timeSince = (test: Date): TimeUnits => {
        const now = Date.now();
        const testSec = test.getTime();
        const seconds = (now - testSec) / 1000;
        return timeUnits(seconds);
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

    useEffect(() => {
        const latestMonth = sortedRewards[0]?.month;
        const lastRewardDate = latestTxTime();
        setTimeBetweenRewardsLatest(timeUnits(sortedRewards[0]?.avg_sec_between_rewards ?? -1));
        setLatestMonthName(latestMonth ? monthNames[latestMonth] : '---');

        if(lastRewardDate) {
            setTimeSinceReward(timeSince(lastRewardDate));
        }

        let secBetweenRewardsAllTime = 0;
        let numRewardsAllTime = 0;
        sortedRewards.map((r, i) => {
            secBetweenRewardsAllTime += r.total_sec_between_rewards;
            numRewardsAllTime += r.transactions.length;
        });
        setTimeBetweenRewardsAllTime(timeUnits(secBetweenRewardsAllTime / numRewardsAllTime));

    }, [props]);


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
                        <Box  p={5} minWidth={"185px"}>
                            <Stat align={"center"}>
                                <StatLabel>Last reward</StatLabel>
                                <StatNumber>{timeSinceReward.value}</StatNumber>
                                <StatHelpText>{timeSinceReward.units} ago</StatHelpText>
                            </Stat>
                        </Box>
                        <Box p={5} minWidth={"185px"} borderWidth={1} borderRadius={20}
                             borderColor={statBorderColor}
                             _hover={ {borderColor: statHoverColor} }
                             cursor={'pointer'}
                             onClick={toggleShowAllTime}
                        >
                            <Stat _hover={ {color: statHoverColor} } align={"center"}>
                                <StatLabel>
                                    {showAllTime ?
                                        (<>Lifetime Avg</>) :
                                        (<>{timeBetweenRewardsLatest.value < 0 ? '---' : latestMonthName} Avg</>)

                                    }
                                </StatLabel>
                                <StatNumber>
                                    {showAllTime ?
                                        (
                                            <>
                                                {timeBetweenRewardsAllTime.value}
                                                {timeBetweenRewardsAllTime.units}
                                            </>
                                        ) : (
                                            <>
                                                {timeBetweenRewardsLatest.value}
                                                {timeBetweenRewardsLatest.units}
                                            </>
                                        )
                                    }

                                </StatNumber>
                                <StatHelpText>between rewards</StatHelpText>
                            </Stat>
                        </Box>
                    </>
                )}
            </HStack>

        </>

)}
