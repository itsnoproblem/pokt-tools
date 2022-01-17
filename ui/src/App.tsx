import * as React from "react"
import {useState} from "react"
import {Box, ChakraProvider, Flex, HStack, IconButton, useBreakpointValue} from "@chakra-ui/react"
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
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

export const App = () => {
    const defaultNode: CryptoNode = {
        exists: false,
        address: "",
        balance: 0,
        chains: [],
        isJailed: true,
        stakedBalance: 0,
    }

    let defaultRewards: MonthlyReward[] = [];

    const [node, setNode] = useState(defaultNode);
    const [rewards, setRewards] = useState(defaultRewards);

    return (
        <ChakraProvider theme={theme}>
            <NodeContext.Provider value={node}>
                <Flex direction={"column"} className={"outer-grid"} minH="100vh" w="100%" p={3}>
                    <HStack justifyContent={"space-between"}>
                        {window.location.pathname === "/" ? (
                            <Box/>
                        ) : (
                            <HomeButton alignSelf="flex-start"/>
                        )}
                        {window.location.pathname === "/" ? (
                            <Box/>
                        ) : (
                            <NodeStatus />
                        )}
                        <HStack>
                            <ColorModeSwitcher
                                _focus={{boxShadow: "none"}}
                                alignSelf="flex-end"
                            />
                            <IconButton
                                    aria-label={"Source code"}
                                    icon={(<FaGithub/>)}
                                    onClick={() => { window.location.href="https://github.com/itsnoproblem/pokt-calculator"} }
                                    _focus={{boxShadow: "none"}}
                                    alignSelf="flex-end"
                                    size="md"
                                    fontSize="lg"
                                    variant="ghost"
                                    color="current"
                                    marginLeft="2"
                            />
                        </HStack>
                    </HStack>
                    <Router>
                        <Routes>
                            <Route
                                path={"/node/:address/rewards"}
                                element={(
                                    <Rewards onNodeLoaded={setNode}
                                             rewards={rewards}
                                             onRewardsLoaded={setRewards}
                                    />
                                )}/>
                            <Route path={"/"} element={(<Home/>)}/>
                        </Routes>

                    </Router>
                </Flex>
            </NodeContext.Provider>
        </ChakraProvider>
    )
}
