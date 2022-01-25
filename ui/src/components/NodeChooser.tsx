import {
    Box,
    Button,
    ButtonGroup,
    FormControl,
    FormLabel,
    HStack,
    IconButton,
    Input, Link, LinkBox,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverFooter,
    PopoverHeader,
    PopoverTrigger,
    Portal,
    Stack,
    Text,
    useDisclosure,
    VStack
} from "@chakra-ui/react";
import {AiFillStar, AiOutlineStar, BiBookBookmark, FaBookmark, FaRegBookmark} from "react-icons/all";
import * as React from "react";
import {NodeContext} from "../node-context";
import {MutableRefObject, SyntheticEvent, useContext, useState} from "react";
import {useLocalStorage} from "react-use";
import ReactFocusLock from "react-focus-lock";

export const NodeChooser = () => {
    const node = useContext(NodeContext);
    let addressIsSaved = false;
    const defaultSavedAddresses: Array<string> = [];
    const [savedAddresses, setSavedAddresses] = useLocalStorage("savedAddresses", defaultSavedAddresses);
    addressIsSaved = savedAddresses?.includes(node.address) ?? false;
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [input, setInput] = useState('');



    return (
        <HStack spacing={0}>
            <VStack>
                <Popover>
                    <PopoverTrigger>
                        <Button
                            alignSelf="flex-end"
                            colorScheme={"gray"}
                            marginLeft={0}
                            borderRadius={25}
                            borderRightRadius={0}
                            marginRight={0}
                            _focus={{boxShadow: "none"}}
                            onMouseOver={onOpen}
                            onMouseOut={onClose}
                        >
                            {node.address.substring(0,4)}...{node.address.substring(node.address.length-4, node.address.length)}
                        </Button>
                    </PopoverTrigger>
                    <Portal>
                        <PopoverContent>
                            <PopoverHeader>Select a servicer node</PopoverHeader>
                            <PopoverCloseButton />
                            <PopoverBody>
                                <VStack align={"left"}>
                                {savedAddresses?.filter((val) => !(val === node.address)).map((addr) => (
                                    <Link d="flex" href={`/node/${addr}/rewards`} colorScheme='blue'>
                                        <Box pt={1} pr={2}><FaBookmark/></Box>
                                        <Box>
                                            {addr.substring(0,12)}...{addr.substring(addr.length-4, addr.length)}
                                        </Box>
                                    </Link>
                                ))}
                                </VStack>
                            </PopoverBody>
                            <PopoverFooter>
                                <form onSubmit={(e: SyntheticEvent) => {
                                    e.preventDefault();
                                    document.location = `/node/${(e.target as any).elements.address.value}/rewards`;
                                    console.log("form", e)
                                }}>
                                    <HStack>
                                        <Input type={"text"} placeholder={"servicer id (address)"} id={"address"} name={"address"} w={"100%"}/>
                                        <Button type={"submit"}>go</Button>
                                    </HStack>
                                </form>
                            </PopoverFooter>
                        </PopoverContent>
                    </Portal>
                </Popover>

            </VStack>
            <IconButton
                alignSelf={"flex-start"}
                _focus={{ boxShadow: "none" }}
                aria-label={ "Bookmark this address" }
                title={addressIsSaved ? 'remove bookmark' : 'add bookmark'}
                icon={addressIsSaved ? (<AiFillStar/>) : (<AiOutlineStar/>)}
                onClick={() => {
                    if(!node.address || !savedAddresses) {
                        console.log(`No address ${node.address} or saved addresses `, savedAddresses)
                        return;
                    }
                    if(addressIsSaved) {
                        const index = savedAddresses.indexOf(node.address);
                        if(index > -1) {
                            savedAddresses.splice(index, 1);
                            setSavedAddresses(savedAddresses);
                        }
                    } else {
                        savedAddresses?.push(node.address);
                        setSavedAddresses(savedAddresses);
                    }
                }}
            />
            <Button
                alignSelf="flex-start"
                colorScheme={"blue"}
                borderRadius={25}
                borderLeftRadius={0}
                marginStart={0}
                marginInlineStart={0}
                ml={0}
                _focus={{boxShadow: "none"}}
            >
                {Number(node.balance/1000000).toFixed(2)}&nbsp;
                <Text d={"inline"} fontSize={"xs"}> POKT</Text>
            </Button>
        </HStack>
    )
}