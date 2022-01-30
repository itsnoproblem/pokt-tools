import {
    Avatar,
    AvatarGroup,
    Box,
    Center,
    Editable,
    EditableInput,
    EditablePreview, GridItem, Heading, HStack, IconButton,
    Kbd, Link, LinkBox, SimpleGrid,
    useClipboard
} from "@chakra-ui/react";
import React, {useContext} from "react";
import {NodeContext} from "../context";
import {CheckIcon, CopyIcon} from "@chakra-ui/icons";
import {ConnectedChainsBadge} from "./badges/ConnectedChainsBadge";

export const NodeSummary = () => {
    const node = useContext(NodeContext);
    const {onCopy, hasCopied} = useClipboard(node.address)

    return node.address === '' ? (<></>) : (
        <Box margin={"auto"} p={8}>
            <HStack>
                <Avatar size={"lg"} mr={2}/>
                <Box pl={4} borderLeftWidth={1}>
                    <Box>
                        <Kbd>{node.address}</Kbd>
                        <IconButton _focus={{boxShadow: 0}} size={"xs"} aria-label={"copy node id"} icon={hasCopied ? (<CheckIcon/>) : (<CopyIcon/>)} onClick={onCopy}/>
                    </Box>
                    <Box mt={1}>
                        <Editable defaultValue='Nickname (coming soon)'>
                            <EditablePreview />
                            <EditableInput />
                        </Editable>
                    </Box>
                    <Box mt={1}><Link href={`${node.service_url}/v1`} target={"_blank"}>{node.service_url}</Link></Box>
                    <Box mt={2}><ConnectedChainsBadge/></Box>
                </Box>
            </HStack>

        </Box>
    );
}