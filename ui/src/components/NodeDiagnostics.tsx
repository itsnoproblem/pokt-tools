import {Box, Heading, Tab, TabList, TabPanel, TabPanels, Tabs} from "@chakra-ui/react";
import {PingTester} from "./PingTester";
import {RelaySimulator} from "./RelaySimulator";

export const NodeDiagnostics = () => {
    return (
        <Box mt={8}>
            <Heading size={"md"} borderBottomWidth={1}>Diagnostics</Heading>
            <Tabs mt={4} variant={"line"} colorScheme='cyan'>
                <TabList>
                    <Tab>Ping</Tab>
                    <Tab>Simulate Relays</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <PingTester/>
                    </TabPanel>
                    <TabPanel>
                        <RelaySimulator/>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    )
}