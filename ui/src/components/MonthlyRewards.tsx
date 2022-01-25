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
    SimpleGrid, Skeleton,
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

import {useCallback, useContext, useEffect, useState} from "react";
import axios from "axios";
import {NodeContext} from "../node-context";
import {MonthlyReward} from "../types/monthly-reward";
import {RewardTransaction} from "./RewardTransaction";
import {PieChart} from "./PieChart";

declare const window: any;

type MonthlyRewardsProps = {
    rewards: MonthlyReward[],
    onRewardsLoaded: (r: MonthlyReward[]) => void,
}

export const MonthlyRewards = (props: MonthlyRewardsProps) => {
    const [rpcUrl, setRpcUrl] = useState("");
    const [hasLoaded, setHasLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const node = useContext(NodeContext)
    const isMobile = useBreakpointValue([false, true]);

    const getRewards = useCallback(() => {
        if(rpcUrl === "") {
            return;
        }

        setIsLoading(true);
        axios.get(rpcUrl).then((result) => {
            props.onRewardsLoaded(result.data.data);
            // console.log("months result", result.data.data);
        }).catch((err) => {
            console.error("ERROR", err);
        }).finally(() => {
            setHasLoaded(true);
            setIsLoading(false);
        });
    },[rpcUrl, props]);

    const monthNames: Record<number, string> = {
        1: "January",
        2: "February",
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September",
        10: "October",
        11: "November",
        12: "December"
    }

    useEffect(() => {
        if(!hasLoaded) {
            const url = `${window._env_.RPC_URL}/node/${node.address}/rewards`;
            setRpcUrl(url);
            getRewards();
        }
    },  [hasLoaded, node.address, getRewards]);

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

    return isLoading ? (
        <Stack w={["100vw", "1280px"]} ml={"auto"} mr={"auto"} mt={2}>
            {Object.keys(monthNames).map(() => {
                return (<Skeleton height={'48px'}/>)
            })}
        </Stack>
    ) : (
        <Accordion allowMultiple w={["100vw", "1280px"]} ml={"auto"} mr={"auto"} mt={2}>
            {props.rewards.map((month: MonthlyReward, i) => {
                const relays = relaysByChain(month)
                return (
                    <AccordionItem key={i.toString()}>
                        <h2>
                            <AccordionButton>
                                <Box flex='1'>
                                    <HStack pt={1} pb={1}>
                                        <Box pl={[1,8]} w={["200px", "200px"]} textAlign='left'>{monthNames[month.month]} {month.year}</Box>
                                        <Spacer/>
                                        { isMobile && (<Box flexGrow={1} textAlign={"right"}>{Number(month.num_relays).toLocaleString()} relays</Box>) }
                                        <Box pr={[2,8]} flexGrow={1} textAlign='right'>
                                            {month.pokt_amount} <Text d="inline" fontSize={"xs"} textTransform={"uppercase"}>pokt</Text>
                                        </Box>
                                    </HStack>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            <Tabs>
                                <TabList>
                                    <Tab>Transactions</Tab>
                                    <Tab>Metrics</Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel>
                                        <Grid templateColumns='repeat(9, auto)' fontFamily={"monospace"} fontSize={"xs"} p={5}>
                                            <GridItem padding={2} fontWeight={900} align="left" pl={4}>Height</GridItem>
                                            <GridItem padding={2} fontWeight={900}>Time</GridItem>
                                            <GridItem padding={2} fontWeight={900} pr={4} align={"left"}>Description</GridItem>
                                            <GridItem padding={2} fontWeight={900} align={"right"} >Amount</GridItem>
                                            <GridItem padding={2} fontWeight={900} align={"center"}>Tx Type</GridItem>
                                            <GridItem padding={2} fontWeight={900} align={"center"}>Sess Height</GridItem>
                                            <GridItem padding={2} fontWeight={900}>App Pubkey</GridItem>
                                            <GridItem padding={2} fontWeight={900}>Hash</GridItem>
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
                                                    { relays.map((r) => {
                                                        return (
                                                            <>
                                                                <Box padding={3}>{r.id}</Box>
                                                                <Box padding={3} align={"right"}>{Number(r.value).toLocaleString()}</Box>
                                                                <Box padding={3} align={"right"}>{Number((r.value/month.num_relays)*100).toPrecision(4)}%</Box>
                                                            </>
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
