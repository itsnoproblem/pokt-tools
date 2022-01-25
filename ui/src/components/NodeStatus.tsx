import {
    Box,
    Button,
    HStack, IconButton,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Spacer,
    Text,
    useBreakpointValue
} from "@chakra-ui/react";
import {AiFillStar, AiOutlineStar, MdBrightness1} from "react-icons/all";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {CryptoNode, NodeProps} from "../types/crypto-node";
import {useParams} from "react-router-dom";
import {StarIcon} from "@chakra-ui/icons";
import {useLocalStorage} from "react-use";
import {NodeChooser} from "./NodeChooser";

declare const window: any;

export const NodeStatus = (props: NodeProps) => {
    const metricsId = 'rewards';
    const errorsId = 'errors';
    let activePath = '';
    const {address} = useParams();

    const [rpcEndpoint, setRpcEndpoint] = useState("");
    const [hasLoaded, setHasLoaded] = useState(false);
    const statusColor = (props.node.isJailed || !props.node.exists) ? "#FF0000"   : "#2bd950";
    const status = (props.node.isJailed || !props.node.exists) ?
        (props.node.exists ? "Jailed" : "Invalid address") : "Not Jailed";
    const isMobile = useBreakpointValue({base: false, sm: true});

    const pathElements = window.location.pathname.split('/');
    switch(pathElements[pathElements.length-1]) {
        case metricsId:
            activePath = metricsId;
            break;
        case errorsId:
            activePath = errorsId;
            break;
    }

    const updateBalance = useCallback(() => {
        if(rpcEndpoint === "" || address === "") {
            console.error(`ABORT addr: ${address} rpc: ${rpcEndpoint}`)
            return;
        }

        axios.get(rpcEndpoint)
            .then(async (result) => {
                // console.log("Node status result", result);
                const node: CryptoNode = {
                    exists: result.data.data.address !== "",
                    address: result.data.data.address,
                    balance: result.data.data.balance,
                    chains: result.data.data.chains,
                    isJailed: result.data.data.is_jailed,
                    pubkey: result.data.data.pubkey,
                    stakedBalance: result.data.data.staked_balance,
                }
                node.lastChecked = new Date();
                props.onNodeLoaded(node);
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
            const rpcUrl = `${window._env_.RPC_URL}/node/${address}`;
            setRpcEndpoint(rpcUrl);
            updateBalance();
        }
    }, [address, hasLoaded, props, updateBalance]);



    return (
        <>
            {isMobile && (
                <>
                    <Button
                        variant={activePath === metricsId ? "outline" : "ghost"}
                        title={"Rewards"}
                        onClick={() => window.location.href=`/node/${props.node.address}/rewards`}
                    >
                        Rewards
                    </Button>
                    <Button
                        variant={activePath === errorsId ? "outline" : "ghost"}
                        title={"Logs"}
                        onClick={() => window.location.href=`/node/${props.node.address}/errors`}
                    >
                        Logs
                    </Button>
                </>
            )}
            <Spacer/>
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

            <NodeChooser/>
        </>
    )
}