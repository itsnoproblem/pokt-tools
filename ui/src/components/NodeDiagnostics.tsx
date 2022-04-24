import {
    Box,
    HStack,
    Kbd,
    Link,
    Popover,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverTrigger,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs
} from "@chakra-ui/react";
import {PingTester} from "./PingTester";
import {RelaySimulator} from "./RelaySimulator";
import {InfoIcon} from "@chakra-ui/icons";
import {BiLinkExternal} from "react-icons/all";
import React from "react";
import {Withdraw} from "./Withdraw";

export const NodeDiagnostics = () => {
    return (
        <Box>
            {/*<Heading colorScheme={"messenger"} size={"md"} borderBottomWidth={1}>Diagnostics</Heading>*/}
            <Tabs mt={4} variant={"line"} colorScheme='cyan'>
                <TabList>
                    <Tab title={"Relay Tests"}>
                        Relay Tests
                        <Popover variant={"ghost"}>
                            <PopoverTrigger><InfoIcon ml={2}/></PopoverTrigger>
                            <PopoverContent
                                mt={4}
                                ml={10}
                                backgroundColor={"blue.700"}
                                color={"gray.50"}
                            >
                                <PopoverCloseButton />
                                <PopoverBody>
                                    <Box
                                        lineHeight={"1.6em"}
                                        textAlign={"left"}
                                        fontSize={"sm"}
                                    >
                                        This tool lets you simulate relays to chains supported by your pocket node.  Before running these tests,
                                        your node needs to be running with the <Kbd color={"orange.500"}>--simulateRelay</Kbd> option enabled. Learn more in the &nbsp;
                                        <HStack d={"inline-flex"}>
                                            <Link color={"cyan.400"} target="_blank" href={"https://docs.pokt.network/home/paths/node-runner#test-your-node"}>
                                                official docs
                                            </Link>
                                            <Link color={"cyan.400"} target="_blank" href={"https://docs.pokt.network/home/paths/node-runner#test-your-node"}>
                                                <BiLinkExternal/>
                                            </Link>
                                        </HStack>
                                    </Box>
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                    </Tab>
                    <Tab title={"Ping test"}>
                        Ping Test
                        <Popover variant={"ghost"}>
                            <PopoverTrigger><InfoIcon ml={2}/></PopoverTrigger>
                            <PopoverContent
                                mt={4}
                                ml={10}
                                backgroundColor={"blue.700"}
                                color={"gray.50"}
                            >
                                <PopoverCloseButton />
                                <PopoverBody>
                                    <Box
                                        lineHeight={"1.6em"}
                                        textAlign={"left"}
                                        fontSize={"sm"}
                                    >
                                        This tool tests the latency of a <Kbd>GET</Kbd> request to your pocket node's
                                        <Kbd>/v1</Kbd> endpoint.
                                    </Box>
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                    </Tab>
                    <Tab title={"Withdraw POKT"}>
                        Withdraw
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <RelaySimulator/>
                    </TabPanel>
                    <TabPanel>
                        <PingTester/>
                    </TabPanel>
                    <TabPanel>
                        <Withdraw/>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    )
}