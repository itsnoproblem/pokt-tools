import {
    Box,
    Button,
    HStack, Link, LinkBox,
    Popover, PopoverBody, PopoverContent,
    PopoverTrigger,
    Spacer,
    Text,
    Tooltip,
    useBreakpointValue
} from "@chakra-ui/react";
import {MdBrightness1} from "react-icons/all";
import * as React from "react";
import {NodeContext} from "../node-context";
import {useContext, useRef} from "react";

export const NodeStatus = () => {
    const metricsId = 'rewards';
    const errorsId = 'errors';
    let activePath = '';

    const pathElements = window.location.pathname.split('/');
    switch(pathElements[pathElements.length-1]) {
        case metricsId:
            activePath = metricsId;
            break;
        case errorsId:
            activePath = errorsId;
            break;
    }

    console.log("activePath", activePath)

    const node = useContext(NodeContext);
    const statusColor = (node.isJailed || !node.exists) ? "#FF0000"   : "#2bd950";
    const status = (node.isJailed || !node.exists) ?
        (node.exists ? "Jailed" : "Invalid address") : "Not Jailed";
    const formattedDate = `${node.lastChecked?.toLocaleString()}`;
    const isMobile = useBreakpointValue({base: false, sm: true})

    return (
        <>
            {isMobile && (
                <>
                    <Button variant={activePath === metricsId ? "outline" : "ghost"} title={"Metrics"} href={`/node/${node.address}/rewards`}>Metrics</Button>
                    <Button variant={activePath === errorsId ? "outline" : "ghost"} title={"Errors"} href={`/node/${node.address}/errors`}>Errors</Button>
                </>
            )}
            <Spacer/>
            {isMobile && (<Box><em>Updated: {formattedDate}</em></Box>)}
            <Box>
                <Popover placement={"bottom"} strategy={"fixed"}>
                    <PopoverTrigger>
                        <MdBrightness1
                            title={"Node status: " + status}
                            aria-label={"Node status: " + status}
                            fill={statusColor}
                        />
                    </PopoverTrigger>
                    <PopoverContent>
                        <PopoverBody>{"Node status: " + status}</PopoverBody>
                    </PopoverContent>
                </Popover>
            </Box>

            <HStack spacing={0}>
                <Button alignSelf="flex-end" colorScheme={"gray"} marginLeft={0} borderRadius={25} borderRightRadius={0} marginRight={0} _focus={{boxShadow: "none"}}>
                    {node.address.substring(0,6)}...{node.address.substring(node.address.length-4, node.address.length)}
                </Button>
                <Button alignSelf="flex-end" colorScheme={"blue"}  borderRadius={25} borderLeftRadius={0} marginStart={0} marginInlineStart={0} ml={0} _focus={{boxShadow: "none"}}>
                    {Number(node.balance/1000000).toFixed(2)}&nbsp;
                    <Text d={"inline"} fontSize={"xs"}> POKT</Text>
                </Button>
            </HStack>
        </>
    )
}