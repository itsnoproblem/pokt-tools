import {BiArrowBack} from "react-icons/all";
import {IconButton, IconButtonProps} from "@chakra-ui/react";
import * as React from "react";

type HomeButtonProps = Omit<IconButtonProps, "aria-label">

export const HomeButton: React.FC<HomeButtonProps> = (props) => {
    return (
        <IconButton
            size="md"
            fontSize="lg"
            variant="ghost"
            color="current"
            icon={(<BiArrowBack/>)}
            alignSelf="flex-start"
            aria-label="Dashboard"
            onClick={() => {
                window.location.href="/";
            }}
            {...props}
        />
    )
}