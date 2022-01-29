import {Box, HStack, IconButton, Kbd, Spacer, Spinner, Text, useBreakpointValue, useInterval} from "@chakra-ui/react";
import {NodeContext} from "../context";
import {ColorModeSwitcher} from "./ColorModeSwitcher";
import {MdBrightness1, MdRefresh} from "react-icons/all";
import * as React from "react";
import {useCallback, useContext, useEffect, useState} from "react";
import {CryptoNode} from '../types/crypto-node';
import {useParams} from "react-router-dom";
import {NodeChooser} from "./NodeChooser";

import {useLocalStorage} from "react-use";
import {getClaims, getHeight, getNode} from "../MonitoringService";
import {HamburgerMenu} from "./HamburgerMenu";
import {PendingRelaysBadge} from "./badges/PendingRelaysBadge";
import {MonthlyReward} from "../types/monthly-reward";

type AppHeaderProps = {
    address: string,
    onNodeLoaded: (n: CryptoNode) => void,
    rewards: MonthlyReward[],
    onRewardsLoaded: (m: MonthlyReward[]) => void,
    isRefreshing: boolean,
    setIsRefreshing: (is: boolean) => void,
}

export const AppHeader = (props: AppHeaderProps) => {
    const defaultSavedAddresses: Array<string> = [];
    const [savedAddresses] = useLocalStorage("savedAddresses", defaultSavedAddresses);
    const [currentAddress, setCurrentAddress] = useLocalStorage("currentAddress", "");
    const isMobile = useBreakpointValue([true, false]);
    const [currentHeight, setCurrentHeight] = useState(0);
    const [pendingRelays, setPendingRelays] = useState(0);
    const node = useContext(NodeContext);

    let {address} = useParams();
    if(address === '' || address === undefined) {
        if(currentAddress !== '') {
            address = currentAddress;
        } else if(savedAddresses !== undefined && savedAddresses.length > 0) {
            setCurrentAddress(savedAddresses[0]);
        }
    }

    const [hasLoaded, setHasLoaded] = useState(false);
    const statusColor = (node.isJailed || !node.exists) ? "#FF0000"   : "#2bd950";
    const status = (node.isJailed || !node.exists) ?
        (node.exists ? "Jailed" : "Invalid address") : "Not Jailed";

    const updateNodeData = useCallback(async () => {
        if(!node.address) {
            return;
        }

        props.setIsRefreshing(true);
        try {
            const n = await getNode(node.address);
            props.onNodeLoaded(n);
            const c = await getClaims(node.address);
            props.onRewardsLoaded(c);
        }
        catch (err) {
            console.error("updateNodeData", err);
        }
        props.setIsRefreshing(false);

    }, [node, props]);
    useInterval(updateNodeData, 900000);

    const updateBalance = useCallback(() => {
        if(!address) {
            return;
        }

        getNode(address).then((node) => {
            setCurrentAddress(node.address);
            props.onNodeLoaded(node);
        })
        .catch((err) => console.error(err))
        .finally(() => {
            setHasLoaded(true);
        });
    }, [props, address, setCurrentAddress]);

    useEffect(() => {
        if(!hasLoaded) {
            updateBalance();
        }

        getHeight().then((h) => setCurrentHeight(h));

        if(props.rewards[0]) {
            let pending = 0;
            props.rewards[0].transactions.map((t) => {
                if(!t.is_confirmed && t.expire_height > currentHeight) {
                    pending += t.num_proofs;
                }
                return t;
            })
            setPendingRelays(pending);
        }
    }, [pendingRelays, props, currentHeight, hasLoaded, updateBalance]);


    return (
        <HStack justifyContent={"space-between"} mt={[1,2]}>
            <HamburgerMenu/>
            {(!isMobile && node.address !== '') && (
                <HStack pl={2}>
                    {/*<ConnectedChainsBadge/>*/}
                    <Box>
                        <Text d="inline" fontSize="xs" fontWeight={600} textTransform={"uppercase"}>height:</Text>
                        <Kbd>{currentHeight}</Kbd>
                    </Box>
                    <IconButton
                        ml={4} mr={4}
                        aria-label={"Refresh"}
                        variant={"ghost"}
                        _focus={{boxShadow: 0}}
                        icon={props.isRefreshing ? (<Spinner size={"xs"}/>) : (<MdRefresh/>)}
                        onClick={updateNodeData}
                    />
                    <Box  color={"gray.400"} ml={8}><em>Updated: {node.lastChecked?.toLocaleString()}</em></Box>
                    <PendingRelaysBadge num={pendingRelays}/>
                </HStack>

            )}
            <Spacer/>
            <Box>
                <MdBrightness1
                    title={"Node status: " + status}
                    aria-label={"Node status: " + status}
                    fill={statusColor}
                />
            </Box>

            <NodeChooser address={address ?? ''}/>

            {!isMobile && (
                <HStack alignSelf={"flex-start"}>
                    {/* Color Mode */}
                    <ColorModeSwitcher
                        _focus={{boxShadow: "none"}}
                        alignSelf="flex-end"
                    />

                </HStack>
            )}
        </HStack>
    )
}