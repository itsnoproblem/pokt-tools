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
    Text, useClipboard,
    useColorModeValue
} from "@chakra-ui/react";
import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {CheckIcon, CopyIcon} from "@chakra-ui/icons";
declare const window: any;

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

interface RewardTransactionProps {
    tx: Transaction
    color: string
}

const RewardTransaction = (props: RewardTransactionProps) => {
    const tx = props.tx;
    const numProofs = tx.num_proofs;
    const description = numProofs + " relays on [" + tx.chain_id + "]";
    const amount = Number(numProofs?.valueOf() * 0.0089).toFixed(4) + " POKT";
    const {hasCopied, onCopy} = useClipboard(tx.hash);
    const time = new Date(tx.time);

    return (
        <>
            <GridItem padding={2} backgroundColor={props.color} align="left" pl={4}>{tx.height}</GridItem>
            <GridItem padding={2} backgroundColor={props.color}>
                <Box>
                    {time.toLocaleString()}
                </Box>
            </GridItem>
            <GridItem padding={2} backgroundColor={props.color}>
                <Text title={tx.hash}>
                    {tx.hash.substring(0, 6)}...{tx.hash.substring(tx.hash.length - 4, tx.hash.length)}&nbsp;
                    {hasCopied && <CheckIcon/>}
                    {!hasCopied && <CopyIcon  onClick={onCopy} cursor={"pointer"}/>}
                </Text>
            </GridItem>
            <GridItem padding={2} backgroundColor={props.color}>{tx.type}</GridItem>
            <GridItem padding={2} backgroundColor={props.color} align={"right"}>{amount}</GridItem>
            <GridItem padding={2} backgroundColor={props.color} pr={4} align={"right"}>{description}</GridItem>
        </>
    )
}

interface MonthlyRewardsProps {
    address: string
}

const MonthlyRewards = (props: MonthlyRewardsProps) => {
    const [months, setMonths] = useState([]);
    const [rpcUrl, setRpcUrl] = useState("");
    const [hasLoaded, setHasLoaded] = useState(false);

    const getRewards = useCallback(() => {
        if(rpcUrl === "") {
            return;
        }

        axios.get(rpcUrl).then((result) => {
            setMonths(result.data.data);
            console.log(result);
            setHasLoaded(true);
        }).catch((err) => {
            console.error(err);
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
            const url = `${window._env_.RPC_URL}/node/${props.address}/rewards`;
            setRpcUrl(url);
            getRewards();
        }
    },  [hasLoaded, props.address, getRewards]);

    const bgOdd = useColorModeValue("gray.200", "gray.800");
    const bgEven = useColorModeValue("gray.50", "gray.700");

    return (
        <Accordion allowMultiple>
            {months.map((month: MonthlyReward, i) => {
                return (
                    <AccordionItem key={i.toString()}>
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

                                {month.transactions.slice(0).reverse().map((tx, j) => {
                                    const rowColor = (j % 2 === 0) ? bgEven : bgOdd;
                                    return (
                                        <RewardTransaction key={tx.hash} tx={tx} color={rowColor}/>
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