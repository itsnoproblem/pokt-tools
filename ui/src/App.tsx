import * as React from "react"
import {Box, ChakraProvider, Flex} from "@chakra-ui/react"
import {ColorModeSwitcher} from "./ColorModeSwitcher"
import theme from "./theme";
import AccountBalance from "./AccountBalance";
import MonthlyRewards from "./MonthlyRewards";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    useParams
} from "react-router-dom";

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

export const App = () => {
    return (
        <ChakraProvider theme={theme}>
            <Router>
                <Routes>
                    <Route path={"/node/:address/rewards"} element={(<Rewards/>)}/>
                </Routes>

            </Router>
        </ChakraProvider>
    )
}
