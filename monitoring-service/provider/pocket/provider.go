package pocket

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/itsnoproblem/pokthud/monitoring-service/inmem"

	"github.com/itsnoproblem/pokthud/monitoring-service/transaction"
)

const (
	contentTypeJSON               = "application/json; charset=UTF-8"
	pocketEndpoint                = "https://node-000.pokt.gaagl.com/v1"
	urlPathGetAccountTransactions = "/query/accounttxs"
	urlPathGetTransaction         = "/query/tx"
	urlPathGetBlock               = "/query/block"
)

type pocketProvider struct {
	client         *http.Client
	blockTimesRepo *inmem.BlockTimesRepo
}

func NewPocketProvider(c http.Client, blockTimesRepo inmem.BlockTimesRepo) pocketProvider {
	return pocketProvider{
		client:         &c,
		blockTimesRepo: &blockTimesRepo,
	}
}

func (p pocketProvider) BlockTime(height uint) (time.Time, error) {
	var fail = func(err error) (time.Time, error) {
		return time.Time{}, fmt.Errorf("pocketProvider.BlockTime: %s", err)
	}

	cached, exists := p.blockTimesRepo.Get(height)
	if exists {
		return cached, nil
	}

	url := fmt.Sprintf("%s/%s", pocketEndpoint, urlPathGetBlock)
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

	p.blockTimesRepo.Set(height, blkResponse.Block.Header.Time)
	return blkResponse.Block.Header.Time, nil
}

func (p pocketProvider) Transaction(hash string) (transaction.Transaction, error) {
	var fail = func(err error) (transaction.Transaction, error) {
		return transaction.Transaction{}, fmt.Errorf("pocketProvider.Transaction: %s", err)
	}

	url := fmt.Sprintf("%s/%s", pocketEndpoint, urlPathGetTransaction)
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

func (p pocketProvider) AccountTransactions(address string, page uint, perPage uint, sort string) ([]transaction.Transaction, error) {
	var fail = func(err error) ([]transaction.Transaction, error) {
		return nil, fmt.Errorf("pocketProvider.AccountTransactions: %s", err)
	}

	if page < 1 {
		page = 1
	}

	if perPage < 1 {
		perPage = 50
	}

	switch sort {
	case "asc":
	case "desc":
		break
	default:
		sort = "asc"
	}

	url := fmt.Sprintf("%s/%s", pocketEndpoint, urlPathGetAccountTransactions)
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

	var transactions []transaction.Transaction
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
	reqBody, err := json.Marshal(reqObj)
	if err != nil {
		return nil, fmt.Errorf("doRequest: %s", err)
	}

	clientReq, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(reqBody))
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
