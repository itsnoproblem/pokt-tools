package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/go-kit/kit/transport/http/jsonrpc"
)

const (
	blockTimesURLPattern = "http://%s/block-times"
	heightURLPattern     = "http://%s/height"
	batchSize            = 25
)

type blockTimesRequest struct {
	Heights []uint `json:"heights"`
}

type heightResponseWrapper struct {
	Data heightResponse `json:"data"`
}

type heightResponse struct {
	Height float64 `json:"height"`
}

func main() {
	rpcHost := flag.String("host", "localhost:7878", "RPC host:port")
	flag.Parse()

	client := http.Client{}
	fmt.Println("Start...")

	var heightResp heightResponseWrapper
	url := fmt.Sprintf(heightURLPattern, *rpcHost)
	res, err := client.Get(url)
	if err != nil {
		panic(err)
	}

	respB, err := ioutil.ReadAll(res.Body)
	if err != nil {
		panic(err)
	}

	if err := json.Unmarshal(respB, &heightResp); err != nil {
		panic(err)
	}
	maxHeight := int(heightResp.Data.Height)

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

		url := fmt.Sprintf(blockTimesURLPattern, *rpcHost)
		res, err := client.Post(url, jsonrpc.ContentType, bytes.NewBuffer(jsonData))
		if err != nil {
			panic(err)
		}

		if res.StatusCode != http.StatusOK {
			panic(fmt.Sprintf("Got bad response %d: %s", res.StatusCode, res.Status))
		}

		i = i + batchSize - 1
	}
}
