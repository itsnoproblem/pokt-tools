import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Spinner,
    Stat,
    StatGroup,
    StatHelpText,
    StatLabel,
    StatNumber,
    useToast
} from "@chakra-ui/react";
import {pingTest} from "../NodeChecker";
import {NodeContext} from "../context";
import React, {useContext, useEffect, useState} from "react";
import {PingTestResponse} from "../types/ping-test-response";

export const PingTester = () => {
    const node = useContext(NodeContext);
    const toast = useToast()
    const [nodeURL, setNodeURL] = useState(node.service_url);
    const [isRunning, setIsRunning] = useState(false);
    const [testResult, setTestResult] = useState<PingTestResponse|null>();
    const [resultColor, setResultColor] = useState<string>();

    const runTest = async () => {
        setTestResult(null);
        setIsRunning(true);

        pingTest(nodeURL, 10)
            .then((response) => {
                setTestResult(response);
                console.log("runTest", response);
            })
            .catch((err) => {
                toast({
                    title: `Failed to run test`,
                    description: `${err}`,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                })
            })
            .finally(() => {
                setIsRunning(false)
            });
    }

    useEffect(() => {
        if(!testResult) return;

        const percentOk = testResult.num_ok / testResult.num_sent;
        let color = "green.400";
        if(percentOk < 1) {
            color = "orange.400";
        }
        if(percentOk < .8) {
            color = "red.400"
        }
        setResultColor(color);
    }, [testResult])

    return (
        <Box>
            <FormControl mt={2}>
                <FormLabel>Service URL</FormLabel>
                <Box>
                    <Input type={"text"}
                           fontFamily={"monospace"}
                           defaultValue={node.service_url}
                           onBlur={(v) => setNodeURL(v.target.value)}
                    />
                </Box>
            </FormControl>
            <FormControl>
                <Button
                    disabled={isRunning}
                    onClick={runTest}
                    colorScheme={"messenger"}
                    mt={4}
                >{isRunning ? (<><Spinner/></>) : (<>Run Ping Test</>)}</Button>
            </FormControl>

            {testResult && (

                <StatGroup mt={8}>
                    <Stat textAlign={"center"} textColor={resultColor}>
                        <StatLabel>Result</StatLabel>
                        <StatNumber>{testResult.num_ok}/{testResult.num_sent}</StatNumber>
                        <StatHelpText>Successful</StatHelpText>
                    </Stat>
                    <Stat textAlign={"center"}>
                        <StatLabel>Min</StatLabel>
                        <StatNumber>{testResult.min_time_ms.toFixed(2)}</StatNumber>
                        <StatHelpText>ms</StatHelpText>
                    </Stat>
                    <Stat textAlign={"center"}>
                        <StatLabel>Median</StatLabel>
                        <StatNumber>{testResult.median_time_ms.toFixed(2)}</StatNumber>
                        <StatHelpText>ms</StatHelpText>
                    </Stat>
                    <Stat textAlign={"center"}>
                        <StatLabel>Average</StatLabel>
                        <StatNumber>{testResult.avg_time_ms.toFixed(2)}</StatNumber>
                        <StatHelpText>ms</StatHelpText>
                    </Stat>
                    <Stat textAlign={"center"}>
                        <StatLabel>Max</StatLabel>
                        <StatNumber>{testResult.max_time_ms.toFixed(2)}</StatNumber>
                        <StatHelpText>ms</StatHelpText>
                    </Stat>
                </StatGroup>

            )}
        </Box>
    )
}
