import {NodeContext} from "../context";
import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import {logsAreEqual, PocketError} from "../types/error";
import {
    Box,
    Flex,
    FormControl,
    HStack,
    IconButton,
    Select,
    Skeleton,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Thead,
    Tr
} from "@chakra-ui/react";
import {ArrowLeftIcon, ArrowRightIcon} from "@chakra-ui/icons";

export const Errors = () => {
    const node = useContext(NodeContext)
    const defaultErrors: PocketError[] = [];
    const [errors, setErrors] = useState(defaultErrors);
    const [page, setPage] = useState(1);
    const [chain, setChain] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const resultsPerPage = 100;

    useEffect(() => {
        if(chain === '') {
            return;
        }

        setIsLoading(true);
        const offset = (page * resultsPerPage) - resultsPerPage;
        const rpcUrl = `https://metrics-api.portal.pokt.network:3000/error` +
            `?and=(nodepublickey.eq.${node.pubkey},blockchain.eq.${chain})` +
            `&limit=${resultsPerPage}` +
            `&offset=${offset}`;

        axios.get(rpcUrl)
            .then(async (response) => {
                if(response.status !== 200) {
                    throw new Error(`got status [${response.status}] from metrics-api`)
                }
                setErrors(response.data as PocketError[]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [node, chain, page]);

    const switchChains = (e: any) => {
        const ch = e.target.value;
        setPage(1);
        setChain(ch);
    }

    const SkeletonRows = () => {
        let rows = [];
        for(let i=0; i < resultsPerPage; i++) {
            rows.push(i)
        }
        return (
            <Stack>
                {rows.map((r, i) => (<Skeleton key={i} height={'53px'}/>))}
            </Stack>
        )
    }

    let logRepeats = 0;
    let doneRepeating = true;

    return (
        <Box>
            <Flex pt={10} pb={10} pl={40} pr={40}>
                <FormControl>
                    <Select onChange={switchChains} isFullWidth={false} minW={"150px"} placeholder={"Select a chain"}>
                        {node.chains.map((ch, i) => {
                            const selected = (chain === ch.id) ? "selected" : "";
                            return (<option key={i} value={ch.id} {...selected}>{ch.name}</option>)
                        })}
                    </Select>
                </FormControl>
            </Flex>
            <Flex pt={1} pb={1} pl={40} pr={40} w={"100%"} textAlign={"center"}>
                { chain && (
                    <HStack margin={"auto"} mb={4}>
                        <Box>
                            <IconButton disabled={(page <= 1)} aria-label={"back"} icon={(<ArrowLeftIcon/>)} onClick={() => { setPage(page - 1); }}/>
                        </Box>
                        <Box w={100} textAlign={"center"}>{page}</Box>
                        <Box>
                            <IconButton disabled={(errors.length < resultsPerPage)} aria-label={"next"} icon={(<ArrowRightIcon/>)} onClick={() => { setPage(page + 1); }}/>
                        </Box>
                    </HStack>
                )}
            </Flex>
            { isLoading && (<SkeletonRows/>) }
            {(errors.length === 0 && !isLoading) && (
                <Box textAlign={"center"} m={"auto"}>No results</Box>
            )}
            { (errors.length > 0  && !isLoading) && (
                <Table variant={"striped"} w={"100%"}>
                    <Thead>
                        <tr>
                            <Td w={"250px"}>Timestamp</Td>
                            <Td w={"100px"}>Chain</Td>
                            <Td w={"200px"}>Method</Td>
                            <Td w={"80px"}>Code</Td>
                            <Td w={"auto"}>Message</Td>
                        </tr>
                    </Thead>
                    <Tbody>
                    {errors.map((err, index) => {
                        let prevLog: PocketError;
                        if (index > 0) {
                            if(logRepeats > 0 && doneRepeating) {
                                logRepeats = 0;
                            }
                            prevLog = errors[index-1];
                            if(logsAreEqual(err, prevLog)) {
                                logRepeats++;
                                doneRepeating = false;
                            } else {
                                if(logRepeats > 0) {
                                    doneRepeating = true;
                                }
                            }

                            if(index === errors.length - 1) {
                                doneRepeating = true;
                            }
                        }
                        return (logRepeats > 0) ?
                            !doneRepeating ? (
                                <></>
                            ) : (
                                <Tr key={index}>
                                    <Td w={"250px"}>{(new Date(err.timestamp)).toLocaleString()}</Td>
                                    <Td w={"100px"}>{err.blockchain}</Td>
                                    <Td w="250px" maxW={"250px"} overflow={"hidden"} isTruncated={true}>{err.method}</Td>
                                    <Td w={"80px"}>{err.code ?? '-'}</Td>
                                    <Td w={"auto"}>{err.message} <Text color={"gray.500"}><em>(Repeats {logRepeats} times)</em></Text></Td>
                                </Tr>
                            )
                        : (
                            <Tr key={index}>
                                <Td w={"250px"}>{(new Date(err.timestamp)).toLocaleString()}</Td>
                                <Td w={"100px"}>{err.blockchain}</Td>
                                <Td w="250px" maxW={"250px"} overflow={"hidden"} isTruncated={true}>{err.method}</Td>
                                <Td w={"80px"}>{err.code ?? '-'}</Td>
                                <Td w={"auto"}>{err.message}</Td>
                            </Tr>
                        )
                    })}
                    </Tbody>
                </Table>
            )}
        </Box>
    )
}
