import {
    Box,
    HStack,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import React, {useEffect, useRef, useState} from "react";
import {CryptoNode} from "../types/crypto-node";
import {MonthlyReward, monthNames} from "../types/monthly-reward";
import {
    EVENT_TOGGLE_LIFETIME_AVG,
    EVENT_TOGGLE_LIFETIME_AVG_PER_SESS,
    EVENT_TOGGLE_TEN_THIRTY_NINETY,
    trackGoal
} from "../events";

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

    const statHoverColor = useColorModeValue('cyan.800', 'blue.100');
    const statBorderColor = useColorModeValue('gray.50', 'gray.50');
    const { isOpen: showAllTime, onToggle: toggleShowAllTime } = useDisclosure({ defaultIsOpen: true });
    const { isOpen: showAllTimePerSess, onToggle: toggleShowAllTimePerSess } = useDisclosure({ defaultIsOpen: true })
    const [tenThirtyNinetyState, setTenThirtyNinetyState] = useState(0);

    const emptyTimeUnits: TimeUnits = { units: '---', value: -1 }
    const [timeBetweenRewardsLatest, setTimeBetweenRewardsLatest] = useState(emptyTimeUnits);
    const [timeBetweenRewardsAllTime, setTimeBetweenRewardsAllTime] = useState(emptyTimeUnits);
    const [timeSinceReward, setTimeSinceReward] = useState(emptyTimeUnits);
    const [avgPoktPerSessionLatestMonth, setAvgPoktPerSessionLatestMonth] = useState(0);
    const [avgPoktPerSession, setAvgPoktPerSession] = useState(0);
    const [latestMonthName, setLatestMonthName] = useState('');


    const scrollRef = useRef(null);


    const avgPoktForLastDays = (numDays: number): number => {
        const today = new Date();
        let pastDate = new Date();
        pastDate.setTime(today.getTime() - (numDays * 86400 * 1000));
        if(numDays === 0) {
            pastDate = new Date();
            pastDate.setHours(0, 0, 1);
        }

        let total = 0;
        let lifetimeNumRelays = 0;
        let lifetimeNumSessions = 0;
        props.rewards.map((r) => {
            r.transactions.map((t) => {
                const txDate = new Date(t.time);
                if((txDate.getTime() >= pastDate.getTime()) && t.is_confirmed) {
                    total += t.num_proofs;
                }
                lifetimeNumRelays += t.num_proofs;
                lifetimeNumSessions++;
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

    const sortedRewards = props.rewards;
    const sortedByChain = (sortedRewards[0] !== undefined) ?
        sortedRewards[0].relays_by_chain.sort((a, b) => {
            return (a.num_relays > b.num_relays) ? -1 : 1;
        }) : [];

    useEffect(() => {

        const timeSince = (test: Date): TimeUnits => {
            const now = Date.now();
            const testSec = test.getTime();
            const seconds = (now - testSec) / 1000;
            return timeUnits(seconds);
        }

        const latestTxTime = () => {
            for(let j = 0; j < props.rewards.length; j++) {
                const txs = props.rewards[j].transactions;

                for(let i=txs.length-1; i >= 0; i--) {
                    if(txs[i].is_confirmed) {
                        // console.log("latestTxTime", txs[i].time)
                        return new Date(txs[i].time);
                    };
                }
            }
        }

        let lifetimeNumRelays = 0;
        let lifetimeNumSessions = 0;
        props.rewards.map((r) => {
            r.transactions.map((t) => {
                lifetimeNumRelays += t.num_proofs;
                lifetimeNumSessions++;
                return this;
            });
            return this;
        });
        setAvgPoktPerSession((lifetimeNumRelays/lifetimeNumSessions) * 0.0089);

        const latestMonth = sortedRewards[0]?.month;
        const lastRewardDate = latestTxTime();
        setTimeBetweenRewardsLatest(timeUnits(sortedRewards[0]?.avg_sec_between_rewards ?? -1));
        setLatestMonthName(latestMonth ? monthNames[latestMonth] : '---');
        if(latestMonth) {
            setAvgPoktPerSessionLatestMonth((sortedRewards[0].num_relays / sortedRewards[0].transactions.length) * 0.0089);
        }

        if(lastRewardDate) {
            setTimeSinceReward(timeSince(lastRewardDate));
        }

        let secBetweenRewardsAllTime = 0;
        let numRewardsAllTime = 0;
        sortedRewards.map((r, i) => {
            secBetweenRewardsAllTime += r.total_sec_between_rewards;
            numRewardsAllTime += r.transactions.length;
            return numRewardsAllTime;
        });
        setTimeBetweenRewardsAllTime(timeUnits(secBetweenRewardsAllTime / numRewardsAllTime));

    }, [props, sortedRewards]);

    return(
        <>
            <Box mt={8} mb={8} ml={'auto'} mr={'auto'} p={0} pl={4} pr={4} w={["100%", 'unset']} h={"100%"}
                    overflow={['scroll', 'unset']} ref={scrollRef}
            >

                {/*{!isMobile && (*/}
                {/*    <HorizontalScroll reverseScroll={true} animValues={15} pageLock={true}>*/}
                <HStack>
                    <Box  p={5} minWidth={"185px"} borderWidth={1} borderRadius={20} borderColor={"gray.50"}>
                        <Stat align={"center"}>
                            <StatLabel>Top Chain This Month</StatLabel>
                            <StatNumber>{sortedByChain[0]?.name}</StatNumber>
                            <StatHelpText>{sortedByChain[0]?.num_relays?.toLocaleString()} relays</StatHelpText>
                        </Stat>
                    </Box>
                    <Box p={5} minWidth={"185px"}
                         _hover={ {color: statHoverColor} }
                         cursor={'pointer'}
                         onClick={() => {
                             const newState = tenThirtyNinetyState + 1;
                             setTenThirtyNinetyState(newState > 2 ? 0 : newState);
                             trackGoal(EVENT_TOGGLE_TEN_THIRTY_NINETY);
                        }}
                    >
                        {tenThirtyNinetyState === 0 && (
                            <Stat align={"center"}>
                                <StatLabel>10 Day Average</StatLabel>
                                <StatNumber>{avgPoktForLastDays(10)}</StatNumber>
                                <StatHelpText>POKT per day</StatHelpText>
                            </Stat>
                        )}
                        {tenThirtyNinetyState === 1 && (
                            <Stat align={"center"}>
                                <StatLabel>30 Day Average</StatLabel>
                                <StatNumber>{avgPoktForLastDays(30)}</StatNumber>
                                <StatHelpText>POKT per day</StatHelpText>
                            </Stat>
                        )}
                        {tenThirtyNinetyState === 2 && (
                            <Stat align={"center"}>
                                <StatLabel>90 Day Average</StatLabel>
                                <StatNumber>{avgPoktForLastDays(90)}</StatNumber>
                                <StatHelpText>POKT per day</StatHelpText>
                            </Stat>
                        )}

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
                            <StatNumber>{timeSinceReward.value > 0 ? timeSinceReward.value : '--'}</StatNumber>
                            <StatHelpText>{timeSinceReward.units} ago</StatHelpText>
                        </Stat>
                    </Box>
                    <Box p={5} minWidth={"185px"} borderWidth={1} borderRadius={20}
                         borderColor={statBorderColor}
                         _hover={ {borderColor: statHoverColor} }
                         cursor={'pointer'}
                         onClick={() => {
                             trackGoal(EVENT_TOGGLE_LIFETIME_AVG);
                             toggleShowAllTime();
                         }}
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
                                            {timeBetweenRewardsAllTime.value && timeBetweenRewardsAllTime.value >= 0 ?
                                                `${timeBetweenRewardsAllTime.value.toString()} ${timeBetweenRewardsAllTime.units}` : '---'
                                            }
                                        </>
                                    ) : (
                                        <>
                                            {timeBetweenRewardsLatest.value && timeBetweenRewardsAllTime.value >= 0 ?
                                                timeBetweenRewardsLatest.value.toString() : '--'
                                            }
                                            {timeBetweenRewardsLatest.units}
                                        </>
                                    )
                                }

                            </StatNumber>
                            <StatHelpText>between rewards</StatHelpText>
                        </Stat>
                    </Box>
                    <Box p={5} minWidth={"185px"}
                         cursor={'pointer'}
                         onClick={() => {
                             trackGoal(EVENT_TOGGLE_LIFETIME_AVG_PER_SESS);
                             toggleShowAllTimePerSess();
                         }}
                    >
                        <Stat _hover={ {color: statHoverColor} } align={"center"}>
                            <StatLabel>
                                {showAllTimePerSess ?
                                    (<>Lifetime Avg</>) :
                                    (<>{timeBetweenRewardsLatest.value < 0 ? '---' : latestMonthName} Avg</>)

                                }
                            </StatLabel>
                            <StatNumber>
                                {showAllTimePerSess ?
                                    (
                                        <>{avgPoktPerSession >= 0 ? avgPoktPerSession.toFixed(0) : '---'}</>
                                    ) : (
                                        <>{avgPoktPerSessionLatestMonth >= 0 ? avgPoktPerSessionLatestMonth.toFixed(0) : '---'}</>
                                    )
                                }

                            </StatNumber>
                            <StatHelpText>POKT per session</StatHelpText>
                        </Stat>
                    </Box>
                    {/*</HorizontalScroll>*/}
                </HStack>
                {/*)}*/}
            </Box>

        </>

)}
