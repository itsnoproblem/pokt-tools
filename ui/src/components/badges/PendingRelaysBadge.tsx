import {Badge, ChakraProps, useColorModeValue, useDisclosure} from "@chakra-ui/react";
import React from "react";
import {POKTPerRelay} from "../NodeMetrics";
import {EVENT_TOGGLE_PENDING_UNITS, trackGoal} from "../../events";

type PendingRelaysProps = {
    num: number
} & ChakraProps;

export const PendingRelaysBadge = (props: PendingRelaysProps) => {
    const {isOpen, onToggle} = useDisclosure();
    const colorScheme = useColorModeValue('yellow', 'yellow');
    const variant = useColorModeValue('solid', 'outline');
    return (props.num > 0) ? (
        <Badge
            p={1} pl={2} ml={4} pr={2}
            borderRadius={55}
            variant={variant}
            colorScheme={colorScheme}
            onClick={() => {
                trackGoal(EVENT_TOGGLE_PENDING_UNITS);
                onToggle();
            }}
            _hover={{ cursor: "pointer" }}
            aria-label={"switch between relays and pokt amount pending"}
            // fontSize={"x-small"}
        >
            {isOpen ? (
                <>{(props.num * POKTPerRelay ).toLocaleString()} pending POKT</>
            ) : (
                <>{props.num.toLocaleString()} pending relays</>
            )}
        </Badge>
    ) : (<></>)
}