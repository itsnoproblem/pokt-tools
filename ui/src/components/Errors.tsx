import {NodeContext} from "../node-context";
import {useContext, useEffect, useState} from "react";
import axios from "axios";
import {PocketError} from "../types/error";
import {
    Box,
    Grid,
    SimpleGrid,
    Text,
    Table,
    Tbody,
    Td,
    Thead,
    Tr,
    FormControl,
    Select,
    Spacer,
    Flex
} from "@chakra-ui/react";

export const Errors = () => {
    const node = useContext(NodeContext)
    const defaultErrors: PocketError[] = [];
    const [errors, setErrors] = useState(defaultErrors);
    const resultsPerPage = 25;
    const [page, setPage] = useState(1);
    const [chain, setChain] = useState('');
    const offset = (page * resultsPerPage) - resultsPerPage;

    useEffect(() => {
        getErrors();
    },[node, chain]);

    const getErrors = () => {
        if(chain === '') {
            return;
        }

        console.log(`Get chain ${chain}`);
        const rpcUrl = `https://metrics-api.portal.pokt.network:3000/error?and=(nodepublickey.eq.${node.pubkey},blockchain.eq.${chain})&limit=${resultsPerPage}&offset=${offset}`;
        console.log(rpcUrl);

        axios.get(rpcUrl)
            .then(async (response) => {
                if(response.status !== 200) {
                    throw new Error(`got status [${response.status}] from metrics-api`)
                }
                setErrors(response.data as PocketError[]);
                console.log(`Fetched ${response.data.length} errors`)
            });
    }

    const switchChains = (e: any) => {
        const ch = e.target.value;
        console.log("switch chains", ch)
        setChain(ch);
    }


    return (
        <Box>
            <Flex pt={10} pb={10} pl={40} pr={40}>
                <FormControl>
                    <Select onChange={switchChains} isFullWidth={false} placeholder={"Select a chain"}>
                        {node.chains.map((ch) => {
                            const selected = (chain === ch.id) ? "selected" : "";
                            return (<option value={ch.id} {...selected}>{ch.name}</option>)
                        })}
                    </Select>
                </FormControl>
            </Flex>
            <Table variant={"striped"} w={"100%"}>
                <Thead>
                    <Td>Timestamp</Td>
                    <Td>Chain</Td>
                    <Td>Method</Td>
                    <Td>Code</Td>
                    <Td>Message</Td>
                </Thead>
                <Tbody>
                {errors.map((err, index) => {
                    return (
                        <Tr>
                            <Td>{(new Date(err.timestamp)).toLocaleString()}</Td>
                            <Td>{err.blockchain}</Td>
                            <Td><Text isTruncated={true}>{err.method}</Text></Td>
                            <Td>{err.code ?? '-'}</Td>
                            <Td>{err.message}</Td>
                        </Tr>
                    )
                })}
                </Tbody>
            </Table>
        </Box>
    )
}