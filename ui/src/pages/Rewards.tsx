import {Flex} from "@chakra-ui/react";
import * as React from "react";
import {useContext} from "react";
import {NodeContext} from "../context";
import {CryptoNode} from "../types/crypto-node";
import {AppStatus} from "../components/AppStatus";
import {MonthlyRewards} from "../components/MonthlyRewards";
import {useParams} from "react-router-dom";
import {MonthlyReward} from "../types/monthly-reward";

interface RewardsProps {
    onNodeLoaded: (n: CryptoNode) => void,
    rewards: MonthlyReward[],
    onRewardsLoaded: (m: MonthlyReward[]) => void,
    isRefreshing: boolean,
    setIsRefreshing: (b: boolean) => void,
}

export const Rewards = (props: RewardsProps) => {
    const node = useContext(NodeContext)
    const params = useParams();
    const address = params["address"];
    if(address !== "") {
        node.address = address ?? "";
    }

    return (
        <Flex direction="column" className="outer-grid" minH="100vh" w={["100vw", "100%"]} p={[1, 3]}>
            {node.address && (
            <>
                <AppStatus
                    rewards={props.rewards}
                    onNodeLoaded={props.onNodeLoaded}
                    onRewardsLoaded={props.onRewardsLoaded}
                    isRefreshing={props.isRefreshing}
                    setIsRefreshing={props.setIsRefreshing}
                />
                <MonthlyRewards
                    rewards={props.rewards}
                    onRewardsLoaded={props.onRewardsLoaded}
                    isRefreshing={props.isRefreshing}
                    setIsRefreshing={props.setIsRefreshing}
                />
            </>
            )}
        </Flex>
    )
}