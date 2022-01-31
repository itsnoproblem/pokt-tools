import {Box, Heading, Tab, TabList, TabPanel, TabPanels, Tabs} from "@chakra-ui/react";
import {PingTester} from "./PingTester";
import {RelaySimulator} from "./RelaySimulator";

export const NodeDiagnostics = () => {
    return (
        <Box mt={8}>
            <Heading colorScheme={"messenger"} size={"md"} borderBottomWidth={1}>Diagnostics</Heading>
            <Tabs mt={4} variant={"line"} colorScheme='cyan'>
                <TabList>
                    <Tab>Simulate Relays</Tab>
                    <Tab>Ping</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <RelaySimulator/>
                    </TabPanel>
                    <TabPanel>
                        <PingTester/>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    )
}