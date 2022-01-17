import {Flex} from "@chakra-ui/react";
import * as React from "react";
import {useContext} from "react";
import {NodeContext} from "../node-context";
import {CryptoNode} from "../types/crypto-node";
import {AppStatus} from "./AppStatus";
import {MonthlyRewards} from "./MonthlyRewards";
import {useParams} from "react-router-dom";
import {MonthlyReward} from "../types/monthly-reward";

interface RewardsProps {
    onNodeLoaded: (n: CryptoNode) => void,
    rewards: MonthlyReward[],
    onRewardsLoaded: (m: MonthlyReward[]) => void
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
        <Flex direction="column" className="outer-grid" minH="100vh" w={["100vw", "100%"]} p={[1, 3]}>
            {node.address && (
            <>
                <AppStatus rewards={props.rewards} onNodeLoaded={props.onNodeLoaded}/>
                <MonthlyRewards rewards={props.rewards} onRewardsLoaded={props.onRewardsLoaded}/>
            </>
            )}
        </Flex>
    )
}