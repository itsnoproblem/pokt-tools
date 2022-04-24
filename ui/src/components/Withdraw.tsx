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
import {ArrowDownIcon, CheckCircleIcon, CopyIcon, ExternalLinkIcon} from "@chakra-ui/icons";

export const Withdraw = () => {
    const tipJarAddress = "0xd7b0EbE6a841f094358b8E9c53946235948d2368";
    const tPoktAddress = "478d17c58cce93a2d046083423d30accdb32d6a7";

    const node = useContext(NodeContext);
    const [inputAmount, setInputAmount] = useState("0.00");
    const [outputAmount, setOutputAmount] = useState("0.00");
    const [outputAddress, setOutputAddress] = useState("");

    const inputBgColor = useColorModeValue("gray.50", "gray.700");
    const maxBalance = (node.balance / 1e6) - 1;
    const inputRef = useRef<HTMLInputElement>(null);
    const outputRef = useRef<HTMLInputElement>(null);

    const {isOpen, onOpen, onClose} = useDisclosure();
    const toast = useToast();

    const setIn = (v: string) => {
        const outputNum = Number.parseFloat(v) * 1.0;
        const outputAmt = (outputNum > 0) ? (outputNum - 0.01) : 0;
        setInputAmount(v);
        setOutputAmount(outputAmt.toString());
    }

    const doPreview = () => {
        const outputAmt = Number.parseFloat(outputAmount)
        let errors = false;

        if(outputAddress == "") {
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

        if(!errors) {
            onOpen();
        }

    }

    const sendCommand = `pocket accounts send-tx ${node.address} ${tPoktAddress} ${Number.parseFloat(inputAmount) * 1e6} mainnet 10000 '{"evmAddress":"${outputAddress}","chainId":137}'`;
    const {value: commandValue, onCopy, hasCopied} = useClipboard(sendCommand);

    return (
        <Box mt={2}>
            <Box mt={2} mb={2}>
                Swap POKT for tPOKT here using&nbsp;
                <Link
                    href="https://thunderpokt.fi/"
                    isExternal={true}
                    textDecoration={"underline"}
                    target="_blank"
                >
                    thunderpokt.fi
                </Link><ExternalLinkIcon mx='2px' /> on Polygon network.
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
            <Box mt={4} mb={2} fontSize={"xs"}>
                Withdrawal address on Polygon
            </Box>
            <InputGroup>
                <InputLeftAddon>
                    <Box w={"32px"}><Img borderRadius={50} src={"/polygon.jpg"}/></Box>
                </InputLeftAddon>
                <Input
                    value={outputAddress}
                    placeholder={tipJarAddress}
                    onChange={(v) => setOutputAddress(v.target.value)}
                />
            </InputGroup>
            <Box mt={2} fontSize={"xs"} textAlign={"right"}>
                <Link onClick={() => setOutputAddress(tipJarAddress)}>Send to pokt.tools tip-jar</Link>
            </Box>
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