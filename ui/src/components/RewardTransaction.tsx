import {Transaction} from "../types/transaction";
import {Box, GridItem, IconButton, Text, useBreakpointValue, useClipboard} from "@chakra-ui/react";
import {CheckCircleIcon, CheckIcon, CopyIcon, TimeIcon} from "@chakra-ui/icons";
import React from 'react';

interface RewardTransactionProps {
    tx: Transaction,
    color: string,
}

export const RewardTransaction = (props: RewardTransactionProps) => {
    const tx = props.tx;
    const numProofs = tx.num_relays;
    const amount = (tx.type === 'pocketcore/proof') ? '-' : Number(numProofs * tx.pokt_per_relay).toFixed(4) + " POKT";
    const poktPrice = tx.poktPrice ? tx.poktPrice : 0;
    const numberAmount =
      tx.type === "pocketcore/proof" ? 0 : Number(numProofs * tx.pokt_per_relay);
    const revenue = `$${Number(numberAmount * poktPrice).toFixed(2)}`;
    const {hasCopied, onCopy} = useClipboard(tx.hash);
    const {hasCopied: pubkeyHasCopied, onCopy: pubkeyCopy} = useClipboard(tx.app_pubkey);
    const time = new Date(tx.time);
    const isMobile = useBreakpointValue([true, false]);

    return (
        <React.Fragment key={tx.hash}>
            <GridItem padding={2} backgroundColor={props.color} align="left" pl={4}>{tx.height}</GridItem>
            <GridItem padding={2} backgroundColor={props.color}>
                <Box>
                    {time.toLocaleString()}
                </Box>
            </GridItem>
            {!isMobile && (<GridItem padding={2} backgroundColor={props.color} pr={4} align={"right"}>{numProofs.toLocaleString()} relays</GridItem>)}
            <GridItem padding={2} backgroundColor={props.color} pr={2} pl={2} align={"left"}>({tx.chain.id}) {tx.chain.name}</GridItem>
            {!isMobile && (<GridItem padding={2} backgroundColor={props.color} pr={4} align={"right"}>{tx.pokt_per_relay.toFixed(8)}</GridItem>)}
            <GridItem padding={2} backgroundColor={props.color} align={"right"}>{amount}</GridItem>
            <GridItem padding={2} backgroundColor={props.color} align={"center"}>{revenue}</GridItem>
            {!isMobile && (
                <GridItem padding={2} backgroundColor={props.color}>
                    <Text title={tx.app_pubkey}>
                        {tx.app_pubkey.substring(0, 3)}...{tx.app_pubkey.substring(tx.app_pubkey.length - 3, tx.app_pubkey.length)}&nbsp;
                        {pubkeyHasCopied && <CheckIcon/>}
                        {!pubkeyHasCopied && <CopyIcon  onClick={pubkeyCopy} cursor={"pointer"}/>}
                    </Text>
                </GridItem>
            )}
            {!isMobile && (
                <GridItem padding={2} backgroundColor={props.color}>
                    <Text title={tx.hash}>
                        {tx.hash.substring(0, 3)}...{tx.hash.substring(tx.hash.length - 3, tx.hash.length)}&nbsp;
                        {hasCopied && <CheckIcon/>}
                        {!hasCopied && <CopyIcon  onClick={onCopy} cursor={"pointer"}/>}
                    </Text>
                </GridItem>
            )}
            <GridItem backgroundColor={props.color} align={"center"}>
                {tx.is_confirmed ?
                    (
                        <IconButton
                            variant="ghost"
                            boxShadow={0}
                            _focus={{boxShadow: "none"}}
                            _hover={{}}
                            cursor={"default"}
                            aria-label="confirmed"
                            title={`confirmed for session height ${tx.session_height}`}
                            icon={(<CheckCircleIcon color="green.400"/>)}
                        />
                    ) : (
                        <IconButton
                            variant="ghost"
                            boxShadow={0}
                            _focus={{boxShadow: "none"}}
                            _hover={{}}
                            cursor={"default"}
                            aria-label="unconfirmed"
                            title={`unconfirmed, expires at block ${tx.expire_height}`}
                            icon={(<TimeIcon  color="yellow.400"/>)}
                        />
                    )
                }
            </GridItem>
        </React.Fragment>
    )
}
