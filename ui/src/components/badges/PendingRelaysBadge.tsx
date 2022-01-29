import {Badge} from "@chakra-ui/react";
import React from "react";

type PendingRelaysProps = {
    num: number
}
export const PendingRelaysBadge = (props: PendingRelaysProps) => {
    return (props.num > 0) ? (
        <Badge p={1} pl={2} ml={4} pr={2} borderRadius={15} variant='solid' colorScheme={'yellow'}>
            {props.num.toLocaleString()} pending relays
        </Badge>
    ) : (<></>)
}