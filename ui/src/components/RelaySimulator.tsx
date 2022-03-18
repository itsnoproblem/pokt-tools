import {
    Box,
    Button,
    FormControl, FormErrorIcon,
    FormLabel,
    HStack, Input,
    Kbd,
    Link, SimpleGrid,
    Spinner, Stack,
    Textarea,
    useDisclosure,
    useToast
} from "@chakra-ui/react";
import {AiFillCloseCircle, BiError, BiErrorCircle, BiLinkExternal} from "react-icons/all";
import React, {useContext, useRef, useState} from "react";
import {NodeContext} from "../context";
import {AxiosResponse} from "axios";
import {CheckCircleIcon, WarningTwoIcon} from "@chakra-ui/icons";
import {
    Select,
    CreatableSelect,
    AsyncSelect,
    OptionBase,
    GroupBase
} from "chakra-react-select";
import {allChains} from "../MonitoringService";
import {simulateRelays} from "../NodeChecker";
import {Chain} from "../types/chain";
import {RelayTestResponse} from "../types/relay-test-response";
import {RelayResult} from "./RelayResult";

interface ChainOption extends OptionBase {
    label: string;
    value: string;
}

export const RelaySimulator = () => {
    const toast = useToast();
    const node = useContext(NodeContext);
    const {isOpen: testIsRunning, onOpen: startTest, onClose: stopTest} = useDisclosure();
    const [selectedChains, setSelectedChains] = useState((): ChainOption[] => []);
    const [nodeURL, setNodeURL] = useState(node.service_url);
    const emptyTestResponse = {} as Record<string, RelayTestResponse>
    const [relayTestResponse, setRelayTestResponse] = useState(emptyTestResponse);

    const runTest = async () => {
        startTest();

        const fail = (err: Error) => {
            toast({
                title: `Failed to run tests`,
                description: `${err}`,
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
            stopTest();
        }

        try {
            const chains: string[] = [];
            selectedChains.map((ch) => {
                chains.push(ch.value)
            });

            return simulateRelays(nodeURL, node.address, chains).then((result) => {
                console.log("Done", result);
                setRelayTestResponse(result);

                stopTest();
            }).catch((err) => {
                fail(err);
            });

        } catch(err) {
            fail(err as Error)
        }
    }


    const chainPickerData = (chains?: Chain[]) => {
        if(!chains?.length) {
            chains = allChains
        }
        const data: ChainOption[] = [];
        chains.map((ch) => {
            data.push({
                value: ch.id,
                label: ch.name + " (" + ch.id + ")"
            })
        });
        return data;
    }

    const response = (relayTestResponse as Record<string, RelayTestResponse>);

    return (
        <Box textAlign={"left"}>
            <Stack mt={4}>
                <FormControl mt={2}>
                    <FormLabel>Node URL</FormLabel>
                    <Box>
                    <Input type={"text"}
                           fontFamily={"monospace"}
                           defaultValue={node.service_url}
                           onBlur={(v) => setNodeURL(v.target.value)}
                    />
                    </Box>
                </FormControl>

                <FormControl>
                    <Box mt={4}>
                        <FormLabel>Chains</FormLabel>
                        <Select<ChainOption, true>
                            isMulti
                            name="chains"
                            options={chainPickerData()}
                            placeholder="Select the chains to test..."
                            closeMenuOnSelect={false}
                            defaultValue={chainPickerData(node.chains)}
                            onChange={(t) => setSelectedChains(t as ChainOption[])}
                        />
                    </Box>
                </FormControl>
                <FormControl>
                    <Box textAlign={"center"}>
                        <FormLabel>&nbsp;</FormLabel>
                        {testIsRunning ? (
                            <Spinner/>
                        ) : (
                            <Button
                                disabled={testIsRunning}
                                colorScheme={"messenger"}
                                onClick={runTest}
                            >Run Relay Tests</Button>
                        )}
                    </Box>
                </FormControl>
            </Stack>

            <RelayResult relayResponse={response}/>

        </Box>
    )
}
