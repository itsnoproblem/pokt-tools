import * as React from "react"
import {useState} from "react"
import {Box, Button, ChakraProvider, Flex, FormControl, Heading, HStack, Input} from "@chakra-ui/react"
import {ColorModeSwitcher} from "./ColorModeSwitcher"
import theme from "./theme";
import AccountBalance from "./AccountBalance";
import MonthlyRewards from "./MonthlyRewards";
import {BrowserRouter as Router, Route, Routes, useParams} from "react-router-dom";

interface RewardsProps {
    address?: string
}
const Rewards = (props: RewardsProps) => {
    let { address } = useParams();
    return (
        <Box textAlign="center" fontSize="xl">
            <Flex direction={"column"} className={"outer-grid"} minH="100vh" p={3}>
                <ColorModeSwitcher alignSelf="flex-end"/>
                <AccountBalance address={address ?? ""}/>
                <MonthlyRewards address={address ?? ""}/>
            </Flex>
        </Box>
    )
}

const Home = () => {
    const [nodeId, setNodeId] = useState("")

    return (
        <Box w={"100%"} h={"100vh"}>
            <Heading p={40} align={"center"}>POKT Calculator</Heading>
            <HStack p={40} pt={20}>
                <Input placeholder={"node id"} value={nodeId} onChange={(e) => {setNodeId(e.target.value)}}/>
                <Button onClick={() => {
                    if(nodeId != "") {
                        window.location.href = `/node/${nodeId}/rewards`;
                    }
                }}>View</Button>
            </HStack>
        </Box>
    )
}

export const App = () => {
    return (
        <ChakraProvider theme={theme}>
            <Router>
                <Routes>
                    <Route path={"/node/:address/rewards"} element={(<Rewards/>)}/>
                    <Route path={"/"} element={(<Home/>)}/>
                </Routes>

            </Router>
        </ChakraProvider>
    )
}
