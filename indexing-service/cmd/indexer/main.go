package main

import (
	"fmt"

	"github.com/pokt-foundation/pocket-go/provider"
)

const rpcURL = "https://node-000.ocean1.pokt.tools"

func main() {
	pocketProvieer := provider.NewProvider(rpcURL, nil)

	height, err := pocketProvieer.GetBlockHeight()
	if err != nil {
		fmt.Println("ERROR", err)
	}

	blk, err := pocketProvieer.GetBlock(height)

	fmt.Println("Height", height, blk)

}
