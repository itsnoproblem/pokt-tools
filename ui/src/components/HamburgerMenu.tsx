import {
    Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel,
    Box,
    Button,
    Code,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    HStack,
    IconButton,
    Spacer,
    useDisclosure
} from "@chakra-ui/react";
import {HamburgerIcon} from "@chakra-ui/icons";
import * as React from "react";
import {useContext} from "react";
import {NodeContext} from "../context";
import {BiCoin, BsHouseDoor, CgFileDocument, FaGithub, FaScroll} from "react-icons/all";
import {NodeSummary} from "./NodeSummary";
import {NodeDiagnostics} from "./NodeDiagnostics";

export const HamburgerMenu = () => {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const node = useContext(NodeContext)
    const pathIdRewards = 'rewards';
    const pathIdErrors = 'errors';
    let activePath = '';

    const pathElements = window.location.pathname.split('/');
    switch(pathElements[pathElements.length-1]) {
        case pathIdRewards:
            activePath = pathIdRewards;
            break;
        case pathIdErrors:
            activePath = pathIdErrors;
            break;
    }

    return (
        <>
            <IconButton onClick={onOpen} variant={"ghost"} aria-label={"Menu"} icon={(<HamburgerIcon/>)}/>
            <Drawer onClose={onClose} isOpen={isOpen} size={"lg"} placement={"left"}>
                <DrawerOverlay/>
                <DrawerContent>
                    <DrawerCloseButton p={3} mt={3} mr={1}/>
                    <DrawerHeader>
                        <HStack>
                            <Button
                                leftIcon={(<BsHouseDoor/>)}
                                variant={activePath === '/' ? "outline" : "ghost"}
                                title={"Home"}
                                onClick={() => window.location.href='/'}
                            >
                                Home
                            </Button>
                            {(node.address !== '') && (
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
                            <Spacer></Spacer>
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