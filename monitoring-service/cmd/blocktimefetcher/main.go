package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-kit/kit/transport/http/jsonrpc"
)

const (
	rpcUrl    = "http://localhost:7878/block-times"
	maxHeight = 46962
	batchSize = 25
)

func main() {
	client := http.Client{}
	fmt.Println("Start...")

	type blockTimesRequest struct {
		Heights []uint `json:"heights"`
	}

	for i := 1; i <= maxHeight; i++ {

		thisBatchSize := batchSize
		numLeft := maxHeight - i
		if numLeft < batchSize {
			thisBatchSize = numLeft
		}

		fmt.Printf("This batch size: %d\n", thisBatchSize)

		var req blockTimesRequest
		req.Heights = make([]uint, thisBatchSize)
		for j := 0; j < thisBatchSize; j++ {
			req.Heights[j] = uint(i + j)
		}

		fmt.Printf("fetching blocks %v\n", req)
		jsonData, err := json.Marshal(req)
		if err != nil {
			panic(err)
		}

		res, err := client.Post(rpcUrl, jsonrpc.ContentType, bytes.NewBuffer(jsonData))
		if err != nil {
			panic(err)
		}

		if res.StatusCode != http.StatusOK {
			panic(fmt.Sprintf("Got bad response %d: %s", res.StatusCode, res.Status))
		}

		i = i + batchSize - 1
	}
}
