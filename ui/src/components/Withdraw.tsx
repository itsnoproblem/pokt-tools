import {
    Box,
    Button, HStack,
    Img,
    Input,
    InputGroup,
    InputLeftAddon,
    InputRightAddon,
    InputRightElement,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    NumberInput,
    NumberInputField,
    Text,
    Textarea, useClipboard,
    useColorModeValue,
    useDisclosure,
    useToast
} from "@chakra-ui/react";
import React, {useContext, useRef, useState} from "react";
import {NodeContext} from "../context";
import {ArrowDownIcon, CheckCircleIcon, CopyIcon, ExternalLinkIcon, WarningIcon} from "@chakra-ui/icons";
import {ethers} from "ethers";
import {AiFillExclamationCircle, BiError} from "react-icons/all";

export const Withdraw = () => {
    const tipJarAddress = "0xd7b0EbE6a841f094358b8E9c53946235948d2368";
    const tPoktAddress = "478d17c58cce93a2d046083423d30accdb32d6a7";
    const ADDRESS_NOT_CHECKED = 0;
    const ADDRESS_VALID = 1;
    const ADDRESS_INVALID = -1;

    const polygon = new ethers.providers.JsonRpcBatchProvider("https://poly-mainnet.gateway.pokt.network/v1/lb/626602acaa777e00391b907f");

    const node = useContext(NodeContext);
    const [inputAmount, setInputAmount] = useState("0.00");
    const [outputAmount, setOutputAmount] = useState("0.00");
    const [outputAddress, setOutputAddress] = useState("");

    const inputBgColor = useColorModeValue("gray.50", "gray.700");
    const maxBalance = (node.balance / 1e6) - 1;
    const inputRef = useRef<HTMLInputElement>(null);
    const outputRef = useRef<HTMLInputElement>(null);
    const [outputAddressIsValid, setOutputAddressIsValid] = useState(ADDRESS_NOT_CHECKED);

    const {isOpen, onOpen, onClose} = useDisclosure();
    const toast = useToast();

    const setIn = (v: string) => {
        const outputNum = Number.parseFloat(v) * 1.0;
        const outputAmt = (outputNum > 0) ? (outputNum - 0.01) : 0;
        setInputAmount(v);
        setOutputAmount(outputAmt.toString());
    }

    const checkAddress = (addr: string) => {
        polygon.getBalance(addr).then((bal) => {
            console.log("Balance", bal);
            setOutputAddressIsValid(ADDRESS_VALID);
        }).catch((err) =>  {
            console.error(err);
            setOutputAddressIsValid(ADDRESS_INVALID);
        })
    }

    const doPreview = () => {
        const outputAmt = Number.parseFloat(outputAmount)
        let errors = false;

        if(outputAddress === "") {
            errors = true;
            toast({
                title: "Error",
                status: "error",
                description: "output address is invalid"
            });
        }

        if(outputAmt === 0) {
            errors = true;
            toast({
                title: "Error",
                status: "error",
                description: "output amount must be greater than 0"
            });
        }

        if(outputAddressIsValid !== ADDRESS_VALID) {
            errors = true;
            toast({
                title: "Error",
                status: "error",
                description: "not a valid polygon address"
            });
        }

        if(!errors) {
            onOpen();
        }

    }

    const sendCommand = `pocket accounts send-tx ${node.address} ${tPoktAddress} ${Number.parseFloat(inputAmount) * 1e6} mainnet 10000 '{"evmAddress":"${outputAddress}","chainId":137}'`;
    const {value: commandValue, onCopy, hasCopied} = useClipboard(sendCommand);

    return (
        <Box mt={2}>
            <Box textAlign="center" mb={4}>
                Swap POKT for tPOKT here using&nbsp;
                <Link
                    href="https://docs.thunderpokt.fi/welcome-to-tpokt-by-thunderfi/getting-started/introduction"
                    isExternal={true}
                    textDecoration={"underline"}
                    target="_blank"
                >
                    thunderpokt.fi
                </Link><ExternalLinkIcon mx='2px' /> on the Polygon network.
            </Box>

            <InputGroup>
                <InputLeftAddon>
                    <Box w={"32px"}><Img borderRadius={50} src={"/polygon.jpg"}/></Box>
                </InputLeftAddon>
                <Input
                    value={outputAddress}
                    placeholder={"Wallet address on Polygon"}
                    onChange={(v) => setOutputAddress(v.target.value)}
                    onBlur={() => checkAddress(outputAddress)}
                    data-lpignore="true"
                />
                {outputAddressIsValid !== ADDRESS_NOT_CHECKED && (
                    <InputRightElement>
                        {outputAddressIsValid === ADDRESS_VALID ? (
                            <CheckCircleIcon textColor={"green.400"}/>
                        ) : (
                            <WarningIcon color={"red.400"}/>
                        )}
                    </InputRightElement>
                )}
            </InputGroup>
            <Box mt={1} mb={4} fontSize={"xs"} textAlign={"right"}>
                <Link onClick={() => {
                    setOutputAddress(tipJarAddress);
                    checkAddress(tipJarAddress);
                }}>Send to pokt.tools tip-jar</Link>
            </Box>

            <InputGroup
                backgroundColor={inputBgColor}
                borderRadius={15}
                padding={8}
                borderWidth={1}
            >
                <InputLeftAddon pointerEvents='none' padding={1} bgColor={inputBgColor}>
                    <Box w={"32px"} p={1}><Img src="/pokt.png" /></Box>
                </InputLeftAddon>
                <NumberInput
                    ref={inputRef}
                    onChange={(str) => {
                        setIn(str);
                    }}
                    value={inputAmount}
                    min={0}
                    max={maxBalance}
                    precision={6}
                    // clampValueOnBlur={true}
                    backgroundColor={inputBgColor}
                    fontFamily={"Roboto Mono,monospace"}
                >
                    <NumberInputField
                        _focus={{boxShadow: "none"}}
                        data-lpignore="true"
                        outline={0}
                        borderWidth={0}
                        borderBottomWidth={1}
                        borderBottomStyle={"solid"}
                        fontSize={"2xl"}
                        fontFamily={"monospace"}
                        placeholder={"0.00"}
                    />
                    <InputRightElement mr={4} textColor={"gray.500"}>POKT</InputRightElement>
                </NumberInput>
                <InputRightAddon backgroundColor={inputBgColor} fontSize={"xs"}>
                    <Link onClick={() => {
                        setIn(maxBalance.toString());
                    }}>Max: {maxBalance}</Link>
                </InputRightAddon>
            </InputGroup>

            <Box textAlign={"center"} p={4}>
                <ArrowDownIcon/>
            </Box>

            <InputGroup
                backgroundColor={inputBgColor}
                borderRadius={15}
                padding={8}
                borderWidth={1}
            >
                <InputLeftAddon pointerEvents='none' padding={1} bgColor={inputBgColor}>
                    <Box w={"36px"} p={1}><Img src="/tpokt.png" /></Box>
                </InputLeftAddon>
                <NumberInput
                    ref={outputRef}
                    value={outputAmount}
                    backgroundColor={inputBgColor}
                    clampValueOnBlur={true}
                    precision={6}
                    fontFamily={"Roboto Mono,monospace"}
                >
                    <NumberInputField
                        _focus={{boxShadow: "none"}}
                        outline={0}
                        borderWidth={0}
                        borderBottomWidth={1}
                        borderBottomStyle={"solid"}
                        fontSize={"2xl"}
                        fontFamily={"monospace"}
                        placeholder={"0.00"}
                        disabled={true}
                    />
                    <InputRightElement mr={4} textColor={"gray.600"}>tPOKT</InputRightElement>
                </NumberInput>
                <InputRightAddon backgroundColor={inputBgColor} fontSize={"xs"}>
                    Fee: 0.01
                </InputRightAddon>
            </InputGroup>

            <Box textAlign={"center"} mt={4}>
                <Button colorScheme={"blue"} onClick={doPreview}>Preview</Button>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Withdrawal Summary</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box fontSize={"sm"} mb={4} lineHeight="2em">
                            You are sending <b>{inputAmount} POKT</b> to receive <b>{outputAmount} tPOKT</b><br/>
                            at polygon address <b>{outputAddress}</b>.
                        </Box>
                        <Box>
                            <HStack mb={2}>
                                <Box><Text fontSize={"sm"}>Run this command on your node:</Text></Box>
                                <Box>{
                                    hasCopied ?
                                    (<Box fontSize={"sm"}><CheckCircleIcon title={"Copied!"}/> Copied!</Box>) :
                                    (<Box fontSize={"sm"}><CopyIcon title="Copy" cursor={"pointer"} onClick={onCopy}/></Box>)
                                }</Box>
                            </HStack>
                            <Textarea fontSize="sm" rows={6} fontFamily={"monospace"} value={sendCommand}/>
                        </Box>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}