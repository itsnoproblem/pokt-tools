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
    Text,
    useColorModeValue
} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import axios from "axios";

type Transaction = {
    hash: string,
    height: number,
    time: string,
    type: string,
    chain_id: string,
    num_proofs: number
}

type MonthlyReward = {
    year: number,
    month: number,
    num_relays: number,
    pokt_amount: number,
    transactions: Array<Transaction>
}

interface MonthlyRewardsProps {
    address: string
}

const MonthlyRewards = (props: MonthlyRewardsProps) => {
    const [months, setMonths] = useState([])

    const getRewards = () => {
        const url = `http://localhost:7878/node/${props.address}/rewards`;
        axios.get(url).then((result) => {
            setMonths(result.data.data);
            console.log(result);
        }).catch((err) => {
            console.error(err);
        });
    }

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
        window.addEventListener("load", getRewards);
    });

    const bgOdd = useColorModeValue("gray.200", "gray.800");
    const bgEven = useColorModeValue("gray.50", "gray.700")

    return (
        <Accordion allowMultiple>
            {months.map((month: MonthlyReward, i) => {
                return (
                    <AccordionItem>
                        <h2>
                            <AccordionButton>
                                <Box flex='1'>
                                    <HStack>
                                        <Box pl={8} textAlign='left'>{monthNames[month.month]} {month.year}</Box>
                                        <Box pr={8} flexGrow={1} textAlign='right'>
                                            {month.pokt_amount} <Text d="inline" fontSize={"xs"} textTransform={"uppercase"}>pokt</Text>
                                        </Box>
                                    </HStack>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            <Grid templateColumns='repeat(6, 1fr)' gap={0} fontFamily={"monospace"} fontSize={"xs"} p={5}>
                                <GridItem padding={2} fontWeight={900} align="left" pl={4}>Height</GridItem>
                                <GridItem padding={2} fontWeight={900}>Time</GridItem>
                                <GridItem padding={2} fontWeight={900}>Hash</GridItem>
                                <GridItem padding={2} fontWeight={900}>Tx Type</GridItem>
                                <GridItem padding={2} fontWeight={900} align={"right"} >Amount</GridItem>
                                <GridItem padding={2} fontWeight={900} pr={4} align={"right"}>Description</GridItem>

                                {month.transactions.map((tx, j) => {

                                    const rowColor = (j % 2 === 0) ? bgEven : bgOdd;
                                    const numProofs = tx.num_proofs;
                                    const description = numProofs + " relays on [" + tx.chain_id + "]";
                                    const amount = new Number(numProofs?.valueOf() * 0.0089).toFixed(4) + " POKT";

                                    return (
                                        <>
                                            <GridItem padding={2} backgroundColor={rowColor} align="left" pl={4}>{tx.height}</GridItem>
                                            <GridItem padding={2} backgroundColor={rowColor}><Box>{tx.time}</Box></GridItem>
                                            <GridItem padding={2} backgroundColor={rowColor}>
                                                {tx.hash.substring(0, 3)}...{tx.hash.substring(tx.hash.length - 4, tx.hash.length)}
                                            </GridItem>
                                            <GridItem padding={2} backgroundColor={rowColor}>{tx.type}</GridItem>
                                            <GridItem padding={2} backgroundColor={rowColor} align={"right"}>{amount}</GridItem>
                                            <GridItem padding={2} backgroundColor={rowColor} pr={4} align={"right"}>{description}</GridItem>
                                        </>
                                    )
                                })}
                            </Grid>
                        </AccordionPanel>
                    </AccordionItem>
                )
            })}
        </Accordion>
    )
}

export default MonthlyRewards