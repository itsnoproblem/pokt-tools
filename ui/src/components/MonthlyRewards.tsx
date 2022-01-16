import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Grid,
    GridItem,
    HStack, Spacer, Tab, TabList, TabPanel, TabPanels, Tabs,
    Text, useBreakpointValue,
    useColorModeValue
} from "@chakra-ui/react";
import {useCallback, useContext, useEffect, useState} from "react";
import axios from "axios";
import {NodeContext} from "../node-context";
import {MonthlyReward} from "../types/monthly-reward";
import {RewardTransaction} from "./RewardTransaction";

declare const window: any;

export const MonthlyRewards = () => {
    const [months, setMonths] = useState([]);
    const [rpcUrl, setRpcUrl] = useState("");
    const [hasLoaded, setHasLoaded] = useState(false);
    const node = useContext(NodeContext)
    const isMobile = useBreakpointValue([false, true]);

    const getRewards = useCallback(() => {
        if(rpcUrl === "") {
            return;
        }

        axios.get(rpcUrl).then((result) => {
            setMonths(result.data.data);
            console.log(result);
            setHasLoaded(true);
        }).catch((err) => {
            console.error("ERROR", err);
            setHasLoaded(true);
        });
    },[rpcUrl]);

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

    return (
        <Accordion allowMultiple w={"100%"}>
            {months.map((month: MonthlyReward, i) => {
                return (
                    <AccordionItem key={i.toString()}>
                        <h2>
                            <AccordionButton>
                                <Box flex='1'>
                                    <HStack>
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
                                    <Tab>Metrics</Tab>
                                    <Tab>Transactions</Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel>0101010101</TabPanel>
                                    <TabPanel>
                                        <Grid templateColumns='repeat(6, 1fr)' gap={0} fontFamily={"monospace"} fontSize={"xs"} p={5}>
                                            <GridItem padding={2} fontWeight={900} align="left" pl={4}>Height</GridItem>
                                            <GridItem padding={2} fontWeight={900}>Time</GridItem>
                                            <GridItem padding={2} fontWeight={900}>Hash</GridItem>
                                            <GridItem padding={2} fontWeight={900}>Tx Type</GridItem>
                                            <GridItem padding={2} fontWeight={900} align={"right"} >Amount</GridItem>
                                            <GridItem padding={2} fontWeight={900} pr={4} align={"right"}>Description</GridItem>

                                            {month.transactions.slice(0).reverse().map((tx, j) => {
                                                const rowColor = (j % 2 === 0) ? bgEven : bgOdd;
                                                return (
                                                    <RewardTransaction key={tx.hash} tx={tx} color={rowColor}/>
                                                )
                                            })}
                                        </Grid>
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
