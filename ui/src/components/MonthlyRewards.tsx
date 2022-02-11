import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Grid,
    GridItem,
    HStack,
    SimpleGrid,
    Skeleton,
    Spacer,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useBreakpointValue,
    useColorModeValue
} from "@chakra-ui/react";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {NodeContext} from "../context";
import {MonthlyReward, monthNames} from "../types/monthly-reward";
import {RewardTransaction} from "./RewardTransaction";
import {PieChart} from "./PieChart";
import {getClaims} from "../MonitoringService";
import {EVENT_MONTH_CLOSE, EVENT_MONTH_METRICS, EVENT_MONTH_OPEN, EVENT_MONTH_TRANSACTIONS, trackGoal} from "../events";

type MonthlyRewardsProps = {
    rewards: MonthlyReward[],
    onRewardsLoaded: (r: MonthlyReward[]) => void,
    isRefreshing: boolean,
    setIsRefreshing: (is: boolean) => void,
}

export const MonthlyRewards = (props: MonthlyRewardsProps) => {
    const [hasLoaded, setHasLoaded] = useState(false);

    const node = useContext(NodeContext)
    const isMobile = useBreakpointValue([true, false]);

    const getRewards = useCallback(() => {
        props.setIsRefreshing(true);
        getClaims(node.address).then((months) => {
            props.onRewardsLoaded(months);
        }).catch((err) => {
            console.error("ERROR", err);
        }).finally(() => {
            setHasLoaded(true);
            props.setIsRefreshing(false);
        });
    },[node, props]);

    useEffect(() => {
        if(!hasLoaded) {
            getRewards();
        }
    },  [hasLoaded, getRewards]);

    const bgOdd = useColorModeValue("gray.200", "gray.800");
    const bgEven = useColorModeValue("gray.50", "gray.700");

    const relaysByChain = useCallback((month: MonthlyReward) => {
        let data = [];

        for(let i = 0; i < month.relays_by_chain.length; i++) {
            data[i] = {
                id: month.relays_by_chain[i].name,
                label: month.relays_by_chain[i].name,
                value: month.relays_by_chain[i].num_relays,
            };
        }
        return data.sort((i, j) => {
            return (i.value < j.value) ? 1 : -1;
        });
    }, []);

    return props.isRefreshing ? (
        <Stack w={["100vw", "1280px"]} ml={"auto"} mr={"auto"} mt={2}>

            {Object.keys(monthNames).map((k, i) => {
                i++;
                return (<Skeleton key={i} height={'48px'}/>)
            })}
        </Stack>
    ) : (
        <Accordion
            onChange={(e: number[]) => {
                if(e.length === 0) {
                    trackGoal(EVENT_MONTH_CLOSE);
                } else {
                    trackGoal(EVENT_MONTH_OPEN);
                }
            }}
            allowMultiple={true}
            maxW="100%"
            w={["100%", "1280px"]}
            ml={"auto"} mr={"auto"}
            mt={[2,8]} p={0}
        >
            {props.rewards.map((month: MonthlyReward, i) => {
                const relays = relaysByChain(month)
                return (
                    <AccordionItem key={i}>
                        <h2>
                            <AccordionButton>
                                <Box flex='1'>
                                    <HStack pt={1} pb={1}>
                                        <Box pl={[1,8]} w={["200px", "40%"]} textAlign='left'>{monthNames[month.month]} {month.year}</Box>
                                        {/*<Spacer/>*/}
                                        { !isMobile && (
                                            <>
                                                <Box
                                                    fontFamily={"Roboto Mono, mono"}
                                                    fontSize={"sm"}
                                                    w={"15%"} flexGrow={1} textAlign={"right"}>
                                                    {month.num_relays.toLocaleString()} <Text d={"inline"} fontSize="xs" textTransform={"uppercase"}> relays</Text>
                                                </Box>
                                                <Box fontFamily={"Roboto Mono, mono"} fontSize={"sm"} w={"15%"} flexGrow={1} textAlign={"right"}>
                                                    {month.transactions.length.toLocaleString()}
                                                    <Text d={"inline"} fontSize="xs" textTransform={"uppercase"}> sessions</Text>
                                                </Box>
                                                <Box fontFamily={"Roboto Mono, mono"} fontSize={"sm"} w={"15%"} flexGrow={1} textAlign={"right"}>
                                                    {((month.num_relays/month.transactions.length) * 0.0089).toFixed(2)}
                                                    <Text d={"inline"} fontSize="xs" textTransform={"uppercase"}> pokt/sess</Text>
                                                </Box>
                                            </>
                                        ) }
                                        <Box fontFamily={"Roboto Mono, mono"} fontSize={"sm"} minW={["150px", "15%"]} pr={[2,8]} flexGrow={1} textAlign='right'>
                                            {month.pokt_amount} <Text d="inline" fontSize={"xs"} textTransform={"uppercase"}>pokt</Text>
                                        </Box>
                                    </HStack>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            <Tabs onChange={(i) => {
                                console.log(`tab ${i}`)
                                if(i === 0) {
                                    trackGoal(EVENT_MONTH_TRANSACTIONS);
                                } else if(i === 1) {
                                    trackGoal(EVENT_MONTH_METRICS);
                                }
                            }
                            }>
                                <TabList>
                                    <Tab onChange={(e) => { console.log(e); }}>Transactions</Tab>
                                    <Tab onChange={(e) => { console.log(e); }}>Metrics</Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel p={0}>
                                        <Grid templateColumns={['repeat(5, auto)', 'repeat(8, auto)']} fontFamily={"monospace"} fontSize={"xs"} p={[1, 5]}>
                                            <GridItem padding={2} fontWeight={900} align="left" pl={4}>Height</GridItem>
                                            <GridItem padding={2} fontWeight={900}>Time</GridItem>
                                            {!isMobile && (<GridItem padding={2} fontWeight={900} pr={4} align={"right"}>Proofs</GridItem>)}
                                            <GridItem padding={2} fontWeight={900} pr={4} align={"right"} >Amount</GridItem>
                                            <GridItem padding={2} fontWeight={900} align={"center"}>Chain</GridItem>
                                            {!isMobile && (<GridItem padding={2} fontWeight={900}>App Pubkey</GridItem>)}
                                            {!isMobile && (<GridItem padding={2} fontWeight={900}>Hash</GridItem>)}
                                            <GridItem padding={2} fontWeight={900}>Confirmed</GridItem>
                                            {month.transactions.slice(0).reverse().map((tx, j) => {
                                                const rowColor = (j % 2 === 0) ? bgEven : bgOdd;
                                                return (
                                                    <RewardTransaction key={tx.hash} tx={tx} color={rowColor}/>
                                                )
                                            })}
                                        </Grid>
                                    </TabPanel>
                                    <TabPanel minHeight={"400px"}>
                                        <Stack direction={["column", "row"]}>
                                            <Box w={["100%", "100%"]} height={"400px"} color={"gray.50"}>
                                                <PieChart data={relays}/>
                                            </Box>
                                            <Box w={["100%", "100%"]}>
                                                <SimpleGrid columns={3} mt={8}>
                                                    <Box padding={3} backgroundColor={"blue.900"}>Chain</Box>
                                                    <Box padding={3} backgroundColor={"blue.900"} align={"right"}>Relays</Box>
                                                    <Box padding={3} backgroundColor={"blue.900"} align={"right"}>Percent</Box>
                                                    { relays.map((r, z) => {
                                                        return (
                                                            <React.Fragment key={z}>
                                                                <Box padding={3}>{r.id}</Box>
                                                                <Box padding={3} align={"right"}>{Number(r.value).toLocaleString()}</Box>
                                                                <Box padding={3} align={"right"}>{Number((r.value/month.num_relays)*100).toPrecision(4)}%</Box>
                                                            </React.Fragment>
                                                        )
                                                    })}
                                                </SimpleGrid>
                                            </Box>
                                        </Stack>

                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </AccordionPanel>
                    </AccordionItem>
                )
            })}
        </Accordion>
    )
}
