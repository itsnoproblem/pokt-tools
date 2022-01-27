import {
    Box,
    Button,
    HStack, IconButton,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Spacer,
    Text,
    useBreakpointValue
} from "@chakra-ui/react";
import {AiFillStar, AiOutlineStar, MdBrightness1} from "react-icons/all";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {CryptoNode, NodeProps} from "../types/crypto-node";
import {useParams} from "react-router-dom";
import {StarIcon} from "@chakra-ui/icons";
import {useLocalStorage} from "react-use";
import {NodeChooser} from "./NodeChooser";



export const NodeStatus = (props: NodeProps) => {




    return (
        <>


        </>
    )
}