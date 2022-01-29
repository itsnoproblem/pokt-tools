import {Badge, GridItem, Popover, PopoverBody, PopoverContent, PopoverTrigger, SimpleGrid} from "@chakra-ui/react";
import React, {useContext} from "react";
import {NodeContext} from "../../context";

export const ConnectedChainsBadge = () => {
    const node = useContext(NodeContext);

    return (
        <Popover trigger={"hover"}>
            <PopoverTrigger>
                <Badge p={1} pl={2} pr={2} borderRadius={15} variant='solid' colorScheme={'gray'}>
                    {node.chains.length} chains connected
                </Badge>
            </PopoverTrigger>
            <PopoverContent>
                <PopoverBody>
                    <SimpleGrid columns={2}>
                        <GridItem borderBottomWidth={1} color={"gray.50"}>ID</GridItem>
                        <GridItem borderBottomWidth={1} color={"gray.50"}>Name</GridItem>
                        {node.chains.map((ch, i) => (
                            <React.Fragment key={i}>
                                <GridItem>{ch.id}</GridItem>
                                <GridItem>{ch.name}</GridItem>
                            </React.Fragment>
                        ))}
                    </SimpleGrid>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    )
}