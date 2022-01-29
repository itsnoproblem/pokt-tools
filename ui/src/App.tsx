import * as React from "react"
import {useState} from "react"
import {ChakraProvider, Flex} from "@chakra-ui/react"
import {BrowserRouter as Router, Route, Routes, useParams} from "react-router-dom";
import theme from "./theme";
import {NodeContext} from "./context";
import {CryptoNode} from "./types/crypto-node";
import {MonthlyReward} from "./types/monthly-reward";
import {Home} from "./pages/Home";
import {Rewards} from "./pages/Rewards";
import {Errors} from "./pages/Errors";
import {AppHeader} from "./components/AppHeader";

export const App = () => {
    const defaultNode: CryptoNode = {
        exists: false,
        address: '',
        service_url: '',
        balance: 0,
        chains: [],
        isJailed: true,
        pubkey: '',
        stakedBalance: 0,
    }
    const defaultRewards: MonthlyReward[] = [];
    const [node, setNode] = useState(defaultNode);
    const [rewards, setRewards] = useState(defaultRewards);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const {address} = useParams();

    return (
        <ChakraProvider theme={theme}>
            <NodeContext.Provider value={node}>
                <Flex direction={"column"} className={"outer-grid"} minH="100vh" w={["100vw", "100%"]} p={3}>
                    <Router>
                        <Routes>
                            <Route
                                path={"/node/:address/rewards"}
                                element={(
                                    <>
                                        <AppHeader
                                            address={address ?? ''}
                                            isRefreshing={isRefreshing}
                                            setIsRefreshing={setIsRefreshing}
                                            onNodeLoaded={setNode}
                                            rewards={rewards}
                                            onRewardsLoaded={setRewards}
                                        />
                                        {/* Rewards Page */}
                                        <Rewards
                                            onNodeLoaded={setNode}
                                            onRewardsLoaded={setRewards}
                                            rewards={rewards}
                                            isRefreshing={isRefreshing}
                                            setIsRefreshing={setIsRefreshing}
                                        />
                                    </>
                                )}
                            />
                            <Route
                                path={"/node/:address/errors"}
                                element={(
                                    <>
                                        <AppHeader
                                            address={address ?? ''}
                                            isRefreshing={isRefreshing}
                                            setIsRefreshing={setIsRefreshing}
                                            onNodeLoaded={setNode}
                                            rewards={rewards}
                                            onRewardsLoaded={setRewards}
                                        />
                                        <Errors/>
                                    </>
                                )}
                            />
                            <Route path={"/"} element={(
                                <>
                                    <AppHeader
                                        address={address ?? ''}
                                        isRefreshing={isRefreshing}
                                        setIsRefreshing={setIsRefreshing}
                                        onNodeLoaded={setNode}
                                        rewards={rewards}
                                        onRewardsLoaded={setRewards}
                                    />
                                    <Home/>
                                </>
                            )}/>
                        </Routes>

                    </Router>
                </Flex>
            </NodeContext.Provider>
        </ChakraProvider>
    )
}
