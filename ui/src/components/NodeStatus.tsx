import {
    Box,
    Button,
    HStack,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Spacer,
    Text,
    useBreakpointValue
} from "@chakra-ui/react";
import {MdBrightness1} from "react-icons/all";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {CryptoNode, NodeProps} from "../types/crypto-node";
import {useParams} from "react-router-dom";

declare const window: any;

export const NodeStatus = (props: NodeProps) => {
    const metricsId = 'rewards';
    const errorsId = 'errors';
    let activePath = '';
    const {address} = useParams();
    console.log("--- NoseStatus " + address)

    const pathElements = window.location.pathname.split('/');
    switch(pathElements[pathElements.length-1]) {
        case metricsId:
            activePath = metricsId;
            break;
        case errorsId:
            activePath = errorsId;
            break;
    }

    const [rpcEndpoint, setRpcEndpoint] = useState("");
    const [hasLoaded, setHasLoaded] = useState(false);

    const updateBalance = useCallback(() => {
        if(rpcEndpoint === "" || address === "") {
            console.log(`ABORT addr: ${address} rpc: ${rpcEndpoint}`)
            return;
        }

        console.log(`Usinf addr: ${address} rpc: ${rpcEndpoint}`)
        axios.get(rpcEndpoint)
            .then(async (result) => {
                console.log("Node status result", result);

                const node: CryptoNode = {
                    exists: result.data.data.address !== "",
                    address: result.data.data.address,
                    balance: result.data.data.balance,
                    chains: result.data.data.chains,
                    isJailed: result.data.data.is_jailed,
                    stakedBalance: result.data.data.staked_balance,
                }
                node.lastChecked = new Date();
                props.onNodeLoaded(node);
                console.log("node loaded", node);

                console.log(rpcEndpoint, node);
                setHasLoaded(true);
            })
            .catch((err) => {
                console.error(err);
                // node.exists = false;
                // props.onNodeLoaded(node);
                setHasLoaded(true);
            });
    }, [props, address, rpcEndpoint]);

    useEffect(() => {
        if(!hasLoaded) {
            const rpcUrl = `${window._env_.RPC_URL}/node/${address}`
            setRpcEndpoint(rpcUrl);
            updateBalance();
        }
    }, [address, hasLoaded, props, updateBalance])

    console.log("activePath", activePath)

    const statusColor = (props.node.isJailed || !props.node.exists) ? "#FF0000"   : "#2bd950";
    const status = (props.node.isJailed || !props.node.exists) ?
        (props.node.exists ? "Jailed" : "Invalid address") : "Not Jailed";
    const formattedDate = `${props.node.lastChecked?.toLocaleString()}`;
    const isMobile = useBreakpointValue({base: false, sm: true})

    return (
        <>
            {isMobile && (
                <>
                    <Button
                        variant={activePath === metricsId ? "outline" : "ghost"}
                        title={"Metrics"}
                        onClick={() => window.location.href=`/node/${props.node.address}/rewards`}
                    >
                        Metrics
                    </Button>
                    <Button
                        variant={activePath === errorsId ? "outline" : "ghost"}
                        title={"Errors"}
                        onClick={() => window.location.href=`/node/${props.node.address}/errors`}
                    >
                        Errors
                    </Button>
                </>
            )}
            <Spacer/>
            {isMobile && (<Box><em>Updated: {formattedDate}</em></Box>)}
            <Box>
                <Popover placement={"bottom"} strategy={"fixed"}>
                    <PopoverTrigger>
                        <MdBrightness1
                            title={"Node status: " + status}
                            aria-label={"Node status: " + status}
                            fill={statusColor}
                        />
                    </PopoverTrigger>
                    <PopoverContent>
                        <PopoverBody>{"Node status: " + status}</PopoverBody>
                    </PopoverContent>
                </Popover>
            </Box>

            <HStack spacing={0}>
                <Button alignSelf="flex-end" colorScheme={"gray"} marginLeft={0} borderRadius={25} borderRightRadius={0} marginRight={0} _focus={{boxShadow: "none"}}>
                    {props.node.address.substring(0,6)}...{props.node.address.substring(props.node.address.length-4, props.node.address.length)}
                </Button>
                <Button alignSelf="flex-end" colorScheme={"blue"}  borderRadius={25} borderLeftRadius={0} marginStart={0} marginInlineStart={0} ml={0} _focus={{boxShadow: "none"}}>
                    {Number(props.node.balance/1000000).toFixed(2)}&nbsp;
                    <Text d={"inline"} fontSize={"xs"}> POKT</Text>
                </Button>
            </HStack>
        </>
    )
}