import {Button, HStack, IconButton, Text} from "@chakra-ui/react";
import {AiFillStar, AiOutlineStar} from "react-icons/all";
import * as React from "react";
import {NodeContext} from "../node-context";
import {useContext} from "react";
import {useLocalStorage} from "react-use";

export const NodeChooser = () => {
    const node = useContext(NodeContext);
    let addressIsSaved = false;
    const defaultSavedAddresses: Array<string> = [];
    const [savedAddresses, setSavedAddresses] = useLocalStorage("savedAddresses", defaultSavedAddresses);
    addressIsSaved = savedAddresses?.includes(node.address) ?? false;

    return (
        <HStack spacing={0}>
            <Button alignSelf="flex-end" colorScheme={"gray"} marginLeft={0} borderRadius={25} borderRightRadius={0} marginRight={0} _focus={{boxShadow: "none"}}>
                {node.address.substring(0,4)}...{node.address.substring(node.address.length-4, node.address.length)}
            </Button>
            <IconButton
                _focus={{boxShadow: "none"}}
                aria-label={"Bookmark this address"}
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
            <Button alignSelf="flex-end" colorScheme={"blue"}  borderRadius={25} borderLeftRadius={0} marginStart={0} marginInlineStart={0} ml={0} _focus={{boxShadow: "none"}}>
                {Number(node.balance/1000000).toFixed(2)}&nbsp;
                <Text d={"inline"} fontSize={"xs"}> POKT</Text>
            </Button>
        </HStack>
    )
}