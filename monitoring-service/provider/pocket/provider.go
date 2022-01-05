package pocket

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"monitoring-service/pocket"
)

const (
	contentTypeJSON               = "application/json; charset=UTF-8"
	urlPathGetAccountTransactions = "/query/accounttxs"
	urlPathGetTransaction         = "/query/tx"
	urlPathGetBlock               = "/query/block"
	urlPathGetNode                = "/query/node"
	urlPathGetBalance             = "/query/balance"
	urlPathGetHeight              = "/query/height"
)

type blockTimesRepo interface {
	Get(height uint) (t time.Time, exists bool, err error)
	Set(height uint, t time.Time) error
}

type pocketProvider struct {
	client         *http.Client
	blockTimesRepo blockTimesRepo
	pocketRpcURL   string
}

func NewPocketProvider(c http.Client, pocketRpcURL string, repo blockTimesRepo) pocketProvider {
	return pocketProvider{
		client:         &c,
		blockTimesRepo: repo,
		pocketRpcURL:   pocketRpcURL,
	}
}

func (p pocketProvider) Height() (uint, error) {
	url := fmt.Sprintf("%s%s", p.pocketRpcURL, urlPathGetHeight)
	//var req interface{}
	var resp struct {
		Height float64 `json:"height"`
	}

	body, err := p.doRequest(url, nil)
	if err != nil {
		return 0, fmt.Errorf("pocketProvider.Height: %s", err)
	}

	if err := json.Unmarshal(body, &resp); err != nil {
		return 0, fmt.Errorf("pocketProvider.Height: %s", err)
	}

	return uint(resp.Height), nil
}

func (p pocketProvider) Node(address string) (pocket.Node, error) {
	var fail = func(err error) (pocket.Node, error) {
		return pocket.Node{}, fmt.Errorf("pocketProvider.Node: %s", err)
	}

	url := fmt.Sprintf("%s/%s", p.pocketRpcURL, urlPathGetNode)
	nodeRequest := queryNodeRequest{Address: address}
	var nodeResponse queryNodeResponse

	body, err := p.doRequest(url, nodeRequest)
	if err != nil {
		return fail(err)
	}

	err = json.Unmarshal(body, &nodeResponse)
	if err != nil {
		return fail(err)
	}

	chains := make([]pocket.Chain, len(nodeResponse.Chains))
	for i, chainID := range nodeResponse.Chains {
		ch, err := pocket.ChainFromID(chainID)
		if err != nil {
			fail(err)
		}

		chains[i] = ch
	}

	return pocket.Node{
		Address: nodeResponse.Address,
		//Balance:           "",
		StakedBalance: nodeResponse.StakedBalance,
		IsJailed:      nodeResponse.IsJailed,
		Chains:        chains,
		IsSynced:      false,
		//LatestBlockHeight: 0,
		//LatestBlockTime:   time.Time{},
	}, nil
}

func (p pocketProvider) Balance(address string) (uint, error) {
	var fail = func(err error) (uint, error) {
		return 0, fmt.Errorf("pocketProvider.Balance: %s", err)
	}

	url := fmt.Sprintf("%s/%s", p.pocketRpcURL, urlPathGetBalance)
	balRequest := balanceRequest{Address: address}
	var balResponse balanceResponse

	body, err := p.doRequest(url, balRequest)
	if err != nil {
		return fail(err)
	}

	err = json.Unmarshal(body, &balResponse)
	if err != nil {
		return fail(err)
	}

	return balResponse.Balance, nil
}

func (p pocketProvider) BlockTime(height uint) (time.Time, error) {
	var fail = func(err error) (time.Time, error) {
		return time.Time{}, fmt.Errorf("pocketProvider.BlockTime: %s", err)
	}

	cached, exists, err := p.blockTimesRepo.Get(height)
	if exists {
		return cached, nil
	}

	url := fmt.Sprintf("%s/%s", p.pocketRpcURL, urlPathGetBlock)
	blkRequest := blockRequest{Height: height}
	var blkResponse blockResponse

	body, err := p.doRequest(url, blkRequest)
	if err != nil {
		return fail(err)
	}

	err = json.Unmarshal(body, &blkResponse)
	if err != nil {
		return fail(err)
	}

	if err = p.blockTimesRepo.Set(height, blkResponse.Block.Header.Time); err != nil {
		return time.Time{}, fmt.Errorf("pocketProvider.BlockTime: %s", err)
	}

	return blkResponse.Block.Header.Time, nil
}

func (p pocketProvider) Transaction(hash string) (pocket.Transaction, error) {
	var fail = func(err error) (pocket.Transaction, error) {
		return pocket.Transaction{}, fmt.Errorf("pocketProvider.Transaction: %s", err)
	}

	url := fmt.Sprintf("%s/%s", p.pocketRpcURL, urlPathGetTransaction)
	txRequest := transactionRequest{Hash: hash}
	var txnResponse transactionResponse

	body, err := p.doRequest(url, txRequest)
	if err != nil {
		return fail(err)
	}

	err = json.Unmarshal(body, &txnResponse)
	if err != nil {
		return fail(err)
	}

	txn, err := txnResponse.Transaction()
	if err != nil {
		return fail(err)
	}

	return txn, nil
}

func (p pocketProvider) AccountTransactions(address string, page uint, perPage uint, sort string) ([]pocket.Transaction, error) {
	var fail = func(err error) ([]pocket.Transaction, error) {
		return nil, fmt.Errorf("pocketProvider.AccountTransactions: %s", err)
	}

	url := fmt.Sprintf("%s/%s", p.pocketRpcURL, urlPathGetAccountTransactions)
	txsRequest := accountTransactionsRequest{
		Address: address,
		Height:  0,
		Page:    page,
		PerPage: perPage,
		Sort:    sort,
	}
	var txsResponse accountTransactionsResponse

	body, err := p.doRequest(url, txsRequest)
	if err != nil {
		return fail(err)
	}

	err = json.Unmarshal(body, &txsResponse)
	if err != nil {
		return fail(err)
	}

	var transactions []pocket.Transaction
	for _, t := range txsResponse.Transactions {
		txn, err := t.Transaction()
		if err != nil {
			return fail(err)
		}

		transactions = append(transactions, txn)
	}

	return transactions, nil
}

func (p pocketProvider) doRequest(url string, reqObj interface{}) ([]byte, error) {
	var reqBody []byte
	var err error
	if reqObj != nil {
		reqBody, err = json.Marshal(reqObj)
		if err != nil {
			return nil, fmt.Errorf("doRequest: %s", err)
		}
	}
	req := bytes.NewBuffer(reqBody)

	clientReq, err := http.NewRequest(http.MethodPost, url, req)
	if err != nil {
		return nil, fmt.Errorf("doRequest: %s", err)
	}
	clientReq.Header.Set("Content-type", contentTypeJSON)

	resp, err := p.client.Do(clientReq)
	defer resp.Body.Close()
	if err != nil {
		return nil, fmt.Errorf("doRequest: %s", err)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("doRequest: %s", err)
	}

	return body, nil
}
