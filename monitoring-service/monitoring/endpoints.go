package monitoring

import (
	"context"
	"fmt"
	"time"

	"github.com/go-kit/kit/endpoint"
)

type Endpoints struct {
	Node                endpoint.Endpoint
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
	Page    uint
	PerPage uint
	Sort    string
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

		txs, err := svc.AccountTransactions(req.Address, req.Page, req.PerPage, req.Sort)
		if err != nil {
			return fail(err)
		}

		txsResponse := make(accountTransactionsResponse, len(txs))
		for i, tx := range txs {
			txsResponse[i] = transactionResponse{
				Hash:      tx.Hash,
				Height:    tx.Height,
				Time:      tx.Time,
				Type:      tx.Type,
				ChainID:   tx.ChainID,
				NumProofs: tx.NumProofs,
			}
		}

		return txsResponse, nil
	}
}

type nodeRequest struct {
	Address string `json:"address"`
}

type nodeResponse struct {
	Address           string          `json:"address"`
	Balance           uint            `json:"balance"`
	StakedBalance     string          `json:"staked_balance"`
	IsJailed          bool            `json:"is_jailed"`
	Chains            []chainResponse `json:"chains"`
	IsSynced          bool            `json:"is_synced"`
	LatestBlockHeight uint            `json:"latest_block_height"`
	LatestBlockTime   time.Time       `json:"latest_block_time"`
}

type chainResponse struct {
	Name string `json:"name"`
	ID   string `json:"id"`
}

func NodeEndpoint(svc Service) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (response interface{}, err error) {
		fail := func(err error) (interface{}, error) {
			return nil, fmt.Errorf("NodeEndpoint: %s", err)
		}

		req, ok := request.(nodeRequest)
		if !ok {
			err := fmt.Errorf("failed to parse request: %v", request)
			return fail(err)
		}

		node, err := svc.Node(req.Address)
		if err != nil {
			return fail(err)
		}

		chains := make([]chainResponse, len(node.Chains))
		for i, c := range node.Chains {
			chains[i] = chainResponse{
				Name: c.Name,
				ID:   c.ID,
			}
		}

		return nodeResponse{
			Address:           node.Address,
			Balance:           node.Balance,
			StakedBalance:     node.StakedBalance,
			IsJailed:          node.IsJailed,
			Chains:            chains,
			IsSynced:          node.IsSynced,
			LatestBlockHeight: node.LatestBlockHeight,
			LatestBlockTime:   node.LatestBlockTime,
		}, nil
	}
}
