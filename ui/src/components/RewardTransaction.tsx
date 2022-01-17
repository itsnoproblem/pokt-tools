import {Transaction} from "../types/transaction";
import {Box, GridItem, Text, useClipboard} from "@chakra-ui/react";
import {CheckIcon, CopyIcon} from "@chakra-ui/icons";
import React from 'react';

interface RewardTransactionProps {
    tx: Transaction,
    color: string,
}

export const RewardTransaction = (props: RewardTransactionProps) => {
    const tx = props.tx;
    const numProofs = tx.num_proofs;
    const description = numProofs + " relays on [" + tx.chain_id + "]";
    const amount = Number(numProofs?.valueOf() * 0.0089).toFixed(4) + " POKT";
    const {hasCopied, onCopy} = useClipboard(tx.hash);
    const time = new Date(tx.time);

    return (
        <React.Fragment key={tx.hash}>
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
        </React.Fragment>
    )
}
