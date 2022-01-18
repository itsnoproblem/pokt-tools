import {NodeContext} from "../node-context";
import {useContext} from "react";

export const Errors = () => {
    const node = useContext(NodeContext)
    return (
        <h1>Errors for {node.address}</h1>
    )
}