import {
    Box,
    Button,
    Code,
    FormControl, FormErrorIcon,
    FormLabel,
    HStack,
    Kbd,
    Link,
    Select,
    SimpleGrid, Spinner,
    Textarea, useDisclosure, useToast
} from "@chakra-ui/react";
import {BiError, BiLinkExternal} from "react-icons/all";
import {useContext, useState} from "react";
import {NodeContext} from "../context";
import React from "react";
import axios, {AxiosResponse} from "axios";
import {CheckCircleIcon} from "@chakra-ui/icons";
import {simulateRelayRequest, simulateRelay} from "../MonitoringService";

export const RelaySimulator = () => {
    const toast = useToast();
    const node = useContext(NodeContext);
    const {isOpen: testIsRunning, onOpen: startTest, onClose: stopTest} = useDisclosure();
    const defaultPayload = { jsonrpc: "2.0", method: "eth_chainId", params: [], id: 1 };
    const [testPayload, setTestPayload] = useState(defaultPayload)
    const [testChain, setTestChain] = useState('');
    const [testResponse, setTestResponse] = useState<AxiosResponse<any, any>>();


    const runTest = async () => {
        startTest();
        const payload: simulateRelayRequest = {
            servicer_url: node.service_url,
            chain_id: testChain,
            payload: testPayload,
        }

        try {
            const response = await simulateRelay(payload);
            setTestResponse(response);
        } catch(err) {
            console.error(err);
            toast({
                title: `Failed to run test for ${testChain}`,
                description: `${err}`,
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
        }
        stopTest();
    }



    return (
        <Box>
            <Box lineHeight={"1.6em"}>
                This tool lets you simulate relays to chains supported by your pocket node.  Before running these tests,
                your node needs to be running with the <Kbd>--simulateRelays</Kbd> option enabled. Learn more in the &nbsp;
                <HStack d={"inline-flex"}>
                    <Link color={"cyan.400"} target="_blank" href={"https://docs.pokt.network/home/paths/node-runner#test-your-node"}>
                    official docs
                    </Link>
                    <Link color={"cyan.400"} target="_blank" href={"https://docs.pokt.network/home/paths/node-runner#test-your-node"}>
                        <BiLinkExternal/>
                    </Link>
                </HStack>
            </Box>
            <FormControl mt={4}>
                <FormLabel>Payload to send</FormLabel>
                <Textarea
                    fontFamily={"monospace"}
                    rows={6}
                    defaultValue={JSON.stringify(testPayload, null, 2)}
                />
            </FormControl>
            <HStack mt={4}>
                <FormControl w={"100%"}>
                    <FormLabel>Chain</FormLabel>
                    <Select placeholder={"Select Chain"}
                            onChange={(e) => {
                                setTestChain((e.target[e.target.selectedIndex] as HTMLOptionElement).value);
                            }}
                    >
                        {node.chains.map((ch, i) => (
                            <option key={i} value={ch.id}>{ch.id} - {ch.name}</option>
                        ))}
                    </Select>
                </FormControl>
                <FormControl>
                    <FormLabel>&nbsp;</FormLabel>
                    {testIsRunning ? (
                        <Spinner/>
                    ) : (
                        <Button colorScheme={"messenger"} onClick={runTest}>Run</Button>
                    )}
                </FormControl>
            </HStack>
            {testResponse && (
                <FormControl mt={4}>
                    <FormLabel>
                        <HStack>
                            <Box>Response status: ({testResponse.status}) {testResponse.statusText}</Box>
                            {testResponse.status === 200 ? (<CheckCircleIcon color="green.400"/>) : (<BiError/>)}
                        </HStack>
                    </FormLabel>
                    <Textarea fontFamily={"monospace"} fontSize={"xs"} value={testResponse.data.data ?? JSON.stringify(testResponse.data.error, null, 2)} rows={6} />
                </FormControl>
            )}
        </Box>
    )
}