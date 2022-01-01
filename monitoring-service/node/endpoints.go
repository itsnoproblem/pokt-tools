package node

import (
	"context"
	"fmt"
	"time"

	"github.com/go-kit/kit/endpoint"
)

type Endpoints struct {
	Transaction         endpoint.Endpoint
	AccountTransactions endpoint.Endpoint
}

type transactionRequest struct {
	Hash string
}

type transactionResponse struct {
	Hash      string    `json:"hash"`
	Height    uint      `json:"height"`
	Time      time.Time `json:"time"`
	Type      string    `json:"type"`
	ChainID   string    `json:"chain_id"`
	NumProofs uint      `json:"num_proofs"`
}

func TransactionEndpoint(svc Service) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (response interface{}, err error) {
		fail := func(err error) (interface{}, error) {
			return nil, fmt.Errorf("TransactionEndpoint: %s", err)
		}

		req, ok := request.(transactionRequest)
		if !ok {
			err := fmt.Errorf("failed to parse request: %v", request)
			return fail(err)
		}

		txn, err := svc.Transaction(req.Hash)
		if err != nil {
			return fail(err)
		}

		return transactionResponse{
			Hash:      txn.Hash,
			Height:    txn.Height,
			Time:      txn.Time,
			Type:      txn.Type,
			ChainID:   txn.ChainID,
			NumProofs: txn.NumProofs,
		}, nil
	}
}

type accountTransactionsRequest struct {
	Address string
}

type accountTransactionsResponse []transactionResponse

func AccountTransactionsEndpoint(svc Service) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (response interface{}, err error) {
		fail := func(err error) (interface{}, error) {
			return nil, fmt.Errorf("AccountTransactionsEndpoint: %s", err)
		}

		req, ok := request.(accountTransactionsRequest)
		if !ok {
			err := fmt.Errorf("failed to parse request: %v", request)
			return fail(err)
		}

		txs, err := svc.AccountTransactions(req.Address)
		if err != nil {
			return fail(err)
		}

		return txs, nil
	}
}
