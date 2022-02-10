import {
    Box,
    Button,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    HStack,
    IconButton,
    Spacer, useBreakpointValue,
    useDisclosure
} from "@chakra-ui/react";
import {HamburgerIcon} from "@chakra-ui/icons";
import * as React from "react";
import {useContext} from "react";
import {NodeContext} from "../context";
import {BiCoin, BsHouseDoor, CgFileDocument, FaGithub} from "react-icons/all";
import {NodeSummary} from "./NodeSummary";
import {NodeDiagnostics} from "./NodeDiagnostics";
import {getActivePath, pathIdErrors, pathIdRewards} from "../App";
import {ColorModeSwitcher} from "./ColorModeSwitcher";
import {EVENT_HAMBURGER_CLOSE, EVENT_HAMBURGER_OPEN, trackGoal} from "../events";

export const HamburgerMenu = () => {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const node = useContext(NodeContext)
    const activePath = getActivePath();
    const isMobile = useBreakpointValue([true, false]);

    const openDrawer = () => {
        onOpen();
        trackGoal(EVENT_HAMBURGER_OPEN);
    }

    const closeDrawer = () => {
        onClose();
        trackGoal(EVENT_HAMBURGER_CLOSE);
    }

    return (
        <>
            <IconButton
                icon={(<HamburgerIcon/>)}
                aria-label={"Menu"}
                variant={"ghost"}
                onClick={openDrawer}
            />
            <Drawer
                onClose={closeDrawer}
                isOpen={isOpen}
                size={"lg"}
                placement={"left"}
            >
                <DrawerOverlay/>
                <DrawerContent>
                    <DrawerCloseButton p={3} mt={3} mr={1}/>
                    <DrawerHeader>
                        <HStack>
                            {isMobile && (
                                <IconButton
                                    aria-label={'Home'}
                                    icon={(<BsHouseDoor/>)}
                                    variant={activePath === '/' ? "outline" : "ghost"}
                                    title={"Home"}
                                    onClick={() => window.location.href='/'}
                                />
                            )}
                            {!isMobile && (
                                <Button
                                    leftIcon={(<BsHouseDoor/>)}
                                    variant={activePath === '/' ? "outline" : "ghost"}
                                    title={"Home"}
                                    onClick={() => window.location.href='/'}
                                >
                                    Home
                                </Button>
                            )}
                            {(node.address !== '' && isMobile) && (
                                <>
                                    <IconButton
                                        aria-label={'Rewards'}
                                        icon={(<BiCoin/>)}
                                        variant={activePath === pathIdRewards ? "outline" : "ghost"}
                                        title={"Rewards"}
                                        onClick={() => window.location.href=`/node/${node.address}/rewards`}
                                    />
                                    <IconButton
                                        aria-label={'Logs'}
                                        icon={(<CgFileDocument/>)}
                                        variant={activePath === pathIdErrors ? "outline" : "ghost"}
                                        title={"Logs"}
                                        onClick={() => window.location.href=`/node/${node.address}/errors`}
                                    />
                                </>
                            )}
                            {(node.address !== '' && !isMobile) && (
                                <>
                                    <Button
                                        leftIcon={(<BiCoin/>)}
                                        variant={activePath === pathIdRewards ? "outline" : "ghost"}
                                        title={"Rewards"}
                                        onClick={() => window.location.href=`/node/${node.address}/rewards`}
                                    >
                                        Rewards
                                    </Button>
                                    <Button
                                        leftIcon={(<CgFileDocument/>)}
                                        variant={activePath === pathIdErrors ? "outline" : "ghost"}
                                        title={"Logs"}
                                        onClick={() => window.location.href=`/node/${node.address}/errors`}
                                    >
                                        Logs
                                    </Button>
                                </>
                            )}
                            <Spacer/>
                            <ColorModeSwitcher
                                _focus={{boxShadow: "none"}}
                                alignSelf="flex-end"
                            />

                            {/* Source code link */}
                            <IconButton
                                aria-label={"View on GitHub"}
                                title={"View on GitHub"}
                                icon={(<FaGithub/>)}
                                onClick={() => { window.location.href="https://github.com/itsnoproblem/pokt-calculator"} }
                                _focus={{boxShadow: "none"}}
                                alignSelf="flex-end"
                                size="md"
                                fontSize="lg"
                                variant="ghost"
                                color="current"
                                marginLeft={2}
                            />
                            <Box w={10}></Box>
                        </HStack>
                    </DrawerHeader>
                    <DrawerBody>
                        <NodeSummary/>
                        <NodeDiagnostics/>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}