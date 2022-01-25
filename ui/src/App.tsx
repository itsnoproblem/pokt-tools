import * as React from "react"
import {useState} from "react"
import {Box, ChakraProvider, Flex, HStack, IconButton, useBreakpointValue} from "@chakra-ui/react"
import {BrowserRouter as Router, Route, Routes, useParams} from "react-router-dom";
import theme from "./theme";
import {NodeContext} from "./node-context";
import {CryptoNode} from "./types/crypto-node";
import {ColorModeSwitcher} from "./components/ColorModeSwitcher";
import {Home} from "./components/Home";
import {HomeButton} from "./components/HomeButton";
import {Rewards} from "./components/Rewards";
import {NodeStatus} from "./components/NodeStatus";
import {MonthlyReward} from "./types/monthly-reward";
import {Icon} from "@chakra-ui/icons";
import {FaGithub} from "react-icons/all";
import {Errors} from "./components/Errors";
import {AppHeader} from "./components/AppHeader";

export const App = () => {
    const defaultNode: CryptoNode = {
        exists: false,
        address: '',
        balance: 0,
        chains: [],
        isJailed: true,
        pubkey: '',
        stakedBalance: 0,
    }

    let defaultRewards: MonthlyReward[] = [];

    const [node, setNode] = useState(defaultNode);
    const [rewards, setRewards] = useState(defaultRewards);
    const {address} = useParams();

    return (
        <ChakraProvider theme={theme}>
            <NodeContext.Provider value={node}>
                <Flex direction={"column"} className={"outer-grid"} minH="100vh" w="100%" p={3}>
                    <Router>
                        <Routes>
                            <Route
                                path={"/node/:address/rewards"}
                                element={(
                                    <>
                                        {/* Home link, node status colormode switcher */}
                                        <AppHeader
                                            address={address}
                                            node={node}
                                            onNodeLoaded={setNode}
                                        />
                                        {/* Rewards Page */}
                                        <Rewards rewards={rewards}
                                            onRewardsLoaded={setRewards}
                                        />
                                    </>
                                )}
                            />
                            <Route
                                path={"/node/:address/errors"}
                                element={(
                                    <>
                                        {/* Home link, node status colormode switcher */}
                                        <AppHeader
                                            address={address}
                                            node={node}
                                            onNodeLoaded={setNode}
                                        />
                                        {/* Error reports */}
                                        <Errors/>
                                    </>
                                )}
                            />
                            <Route path={"/"} element={(<Home/>)}/>
                        </Routes>

                    </Router>
                </Flex>
            </NodeContext.Provider>
        </ChakraProvider>
    )
}
