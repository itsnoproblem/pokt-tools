import {useState} from "react";
import {Box, Button, FormControl, Heading, Input} from "@chakra-ui/react";
import * as React from "react";

export const Home = () => {
    const [nodeId, setNodeId] = useState("")

    return (
        <Box w={"100%"} h={"100vh"}>
            <Heading p={[10, 40]} pt={[40,40]} pb={[4,4]} align={"center"}>POKT Tools</Heading>
            <Box align="center" mb={8} fontSize={"lg"}>rewards explorer</Box>
            <form id="node-form" onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/node/${nodeId}/rewards`;
            }}>
                <FormControl align={"center"}>
                    <Input
                        id="node-id"
                        name="node_id"
                        type={"text"}
                        size="lg"
                        w={["100vw", "70%"]}
                        placeholder={"Node id"}
                        value={nodeId}
                        onChange={(e) => {setNodeId(e.target.value)}}
                    />
                    <Button
                        type={"submit"}
                        borderRadius="0"
                        size="lg"
                        mt={[8,0]}
                        _hover={{backgroundColor: "blue.200", color: "gray.50"}}
                    >Explore</Button>
                </FormControl>
            </form>
        </Box>
    )
}