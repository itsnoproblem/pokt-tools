import {Box, HStack, IconButton} from "@chakra-ui/react";
import {HomeButton} from "./HomeButton";
import {NodeStatus} from "./NodeStatus";
import {ColorModeSwitcher} from "./ColorModeSwitcher";
import {FaGithub} from "react-icons/all";
import * as React from "react";
import {NodeProps} from '../types/crypto-node';
import {useParams} from "react-router-dom";

export const AppHeader = (props: NodeProps) => {

    const params = useParams();
    console.log(`--AppHeader`, params);

    return (
        <HStack justifyContent={"space-between"}>
            {/* Home Link */}
            {window.location.pathname === "/" ? ( <Box/> ) : ( <HomeButton alignSelf="flex-start"/> )}
            {/* Node Status Bar */}
            {window.location.pathname === "/" ? ( <Box/> ) : (
                <NodeStatus address={params.address} node={props.node} onNodeLoaded={props.onNodeLoaded}/>
            )}
            <HStack>
                {/* Color Mode */}
                <ColorModeSwitcher
                    _focus={{boxShadow: "none"}}
                    alignSelf="flex-end"
                />
                 {/* Source code link */}
                <IconButton
                    aria-label={"Source code"}
                    icon={(<FaGithub/>)}
                    onClick={() => { window.location.href="https://github.com/itsnoproblem/pokt-calculator"} }
                    _focus={{boxShadow: "none"}}
                    alignSelf="flex-end"
                    size="md"
                    fontSize="lg"
                    variant="ghost"
                    color="current"
                    marginLeft="2"
                />
            </HStack>
        </HStack>
    )
}