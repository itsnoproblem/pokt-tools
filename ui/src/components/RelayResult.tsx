import {
    Box,
    Button, Collapse,
    Grid,
    GridItem,
    HStack,
    SimpleGrid, Slide, SlideFade,
    Textarea,
    useColorModeValue,
    useDisclosure,
    VStack
} from "@chakra-ui/react";
import {RelayResponse, RelayTestResponse} from "../types/relay-test-response";
import React, {useEffect} from "react";
import {CheckCircleIcon, ChevronDownIcon, ChevronLeftIcon, WarningTwoIcon} from "@chakra-ui/icons";
import ReactJson from "react-json-view";

interface RelayResultProps {
    relayResponse: Record<string, RelayTestResponse>
}

interface SingleResultProps {
    relayTestResponse: RelayTestResponse
}

export const RelayResult = (props: RelayResultProps) => {
    return (
        <Grid templateColumns={"repeat(5,1fr)"} mt={30} spacing={1}>
            {Object.entries(props.relayResponse).map(([ch, v], i) => {
                return (
                    <SingleResult key={ch} relayTestResponse={v}/>
                )
            })}
        </Grid>
    )
}

const SingleResult = (props: SingleResultProps) => {
    const jsonTheme = useColorModeValue("rjv-default", "hopscotch");
    const {isOpen, onToggle, onClose} = useDisclosure({defaultIsOpen: false});
    const jsonStyleProps = {width: "100%", padding: "8px"};

    return (
        <React.Fragment key={props.relayTestResponse.chain_id}>
            <GridItem colSpan={2}>({props.relayTestResponse.chain_id}) {props.relayTestResponse.chain_name}</GridItem>
            <GridItem>{props.relayTestResponse.duration_ms}ms</GridItem>
            <GridItem>{props.relayTestResponse.status_code}</GridItem>
            <GridItem textAlign={"right"}>
                {props.relayTestResponse.status_code === 200 ?
                    (<CheckCircleIcon color={"green.300"}/>) :
                    (<WarningTwoIcon color={"red.400"}/>)
                }
                {isOpen ? (
                    <ChevronDownIcon
                        title={"details"}
                        aria-label={"details"}
                        _hover={{cursor: "pointer"}}
                        ml={5}
                        onClick={onToggle}
                    />
                ) : (
                    <ChevronLeftIcon
                        title={"details"}
                        aria-label={"details"}
                        _hover={{cursor: "pointer"}}
                        ml={5}
                        onClick={onToggle}
                    />
                )}
            </GridItem>
            <GridItem colSpan={5} p={3} lineHeight={1}>
                <Collapse in={isOpen} animateOpacity={true}>
                    <ReactJson
                        src={props.relayTestResponse.relay_request}
                        displayDataTypes={false}
                        displayObjectSize={false}
                        enableClipboard={false}
                        theme={jsonTheme}
                        name={"request"}
                        style={jsonStyleProps}
                    />
                    <ReactJson
                        src={props.relayTestResponse.relay_response}
                        displayDataTypes={false}
                        displayObjectSize={false}
                        enableClipboard={false}
                        theme={jsonTheme}
                        name={"response"}
                        style={jsonStyleProps}
                    />
                </Collapse>
            </GridItem>
        </React.Fragment>
    )
}
