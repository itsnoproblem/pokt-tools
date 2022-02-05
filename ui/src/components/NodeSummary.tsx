import {Avatar, Box, HStack, IconButton, Link, useClipboard} from "@chakra-ui/react";
import React, {useContext} from "react";
import {NodeContext} from "../context";
import {CheckIcon, CopyIcon} from "@chakra-ui/icons";
import {ConnectedChainsBadge} from "./badges/ConnectedChainsBadge";

export const NodeSummary = () => {
    const node = useContext(NodeContext);
    const {onCopy, hasCopied} = useClipboard(node.address)

    return node.address === '' ? (<></>) : (
        <Box margin={"auto"} p={[2, 8]}>
            <HStack>
                <Avatar size={"lg"} mr={[1, 2]}/>
                <Box pl={4} borderLeftWidth={1}>
                    <HStack>
                        <Box fontFamily={"monospace"}>{node.address}</Box>
                        <IconButton
                            aria-label={"copy node id"}
                            size={"xs"}
                            ml={1}
                            _focus={{boxShadow: 0}}
                            onClick={onCopy}
                            icon={hasCopied ? (<CheckIcon/>) : (<CopyIcon/>)}
                        />
                    </HStack>
                    <Box mt={1}><Link href={`${node.service_url}/v1`} target={"_blank"}>{node.service_url}</Link></Box>
                    <Box mt={2}><ConnectedChainsBadge/></Box>
                </Box>
            </HStack>

        </Box>
    );
}