import {Flex} from "@chakra-ui/react";
import * as React from "react";
import {useContext} from "react";
import {NodeContext} from "../node-context";
import {CryptoNode} from "../types/crypto-node";
import {AppStatus} from "./AppStatus";
import {MonthlyRewards} from "./MonthlyRewards";
import {useParams} from "react-router-dom";

interface RewardsProps {
    onNodeLoaded: (n: CryptoNode) => void,
}

export const Rewards = (props: RewardsProps) => {
   const node = useContext(NodeContext)
    const {address} = useParams();
    console.log(`Got ${address} from params`);
    if(address !== "") {
        node.address = address ?? "";
        props.onNodeLoaded(node);
    }

    return (
        <Flex direction={"column"} className={"outer-grid"} minH="100vh" p={3}>
            {node.address && (
            <>
                <AppStatus onNodeLoaded={props.onNodeLoaded}/>
                <MonthlyRewards/>
            </>
            )}
        </Flex>
    )
}