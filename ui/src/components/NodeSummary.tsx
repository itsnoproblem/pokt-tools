import {
    Avatar,
    AvatarGroup,
    Box,
    Center,
    Editable,
    EditableInput,
    EditablePreview, IconButton,
    Kbd, Link, LinkBox,
    useClipboard
} from "@chakra-ui/react";
import {useContext} from "react";
import {NodeContext} from "../context";
import {CheckIcon, CopyIcon} from "@chakra-ui/icons";

export const NodeSummary = () => {
    const node = useContext(NodeContext);
    const {onCopy, hasCopied} = useClipboard(node.address)

    return node.address === '' ? (<></>) : (
        <Box margin={"auto"} align={"center"}>
            <Avatar/>
            <Editable mt={3} defaultValue='Nickname (coming soon)'>
                <EditablePreview />
                <EditableInput />
            </Editable>
            <Box mt={3}>
                <Link href={node.service_url}>{node.service_url}</Link>
            </Box>
            <Box mt={3}>
                <Kbd>{node.address}</Kbd>
                <IconButton _focus={{boxShadow: 0}} size={"xs"} aria-label={"copy node id"} icon={hasCopied ? (<CheckIcon/>) : (<CopyIcon/>)} onClick={onCopy}/>
            </Box>
        </Box>
    );
}