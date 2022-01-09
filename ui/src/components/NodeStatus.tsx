import {Box, Button, HStack, Spacer, Text} from "@chakra-ui/react";
import {MdBrightness1} from "react-icons/all";
import * as React from "react";
import {NodeContext} from "../node-context";
import {useContext} from "react";

export const NodeStatus = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const node = useContext(NodeContext);
    const statusColor = (node.isJailed || !node.exists) ? "#FF0000"   : "#2bd950";
    const status = (node.isJailed || !node.exists) ?
        (node.exists ? "Jailed" : "Invalid address") : "Not Jailed";
    const formattedDate = `${node.lastChecked?.toUTCString()}`;
    
    return (
        <>
            <Box><em>Updated: {formattedDate}</em></Box>
            <Spacer/>
            <MdBrightness1 fill={statusColor} title={"Node status: " + status}/>
            <HStack spacing={0}>
                <Button alignSelf="flex-end" colorScheme={"gray"} marginLeft={0} borderRadius={25} borderRightRadius={0} marginRight={0} _focus={{boxShadow: "none"}}>
                    {node.address.substring(0,6)}...{node.address.substring(node.address.length-4, node.address.length)}
                </Button>
                <Button alignSelf="flex-end" colorScheme={"blue"}  borderRadius={25} borderLeftRadius={0} marginStart={0} marginInlineStart={0} ml={0} _focus={{boxShadow: "none"}}>
                    {Number(node.balance/1000000).toFixed(4)}&nbsp;
                    <Text d={"inline"} fontSize={"xs"}> POKT</Text>
                </Button>
            </HStack>
        </>
    )
}