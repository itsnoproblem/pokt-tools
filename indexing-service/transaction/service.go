package transaction

import (
	"context"
	"encoding/json"

	"github.com/pkg/errors"

	"github.com/pokt-foundation/pocket-go/provider"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/pocket"
)

type Service interface {
	BlockTransactions(ctx context.Context, height int) ([]pocket.Transaction, error)
}

type Provider interface {
	GetBlockTransactions(options *provider.GetBlockTransactionsOptions) (*provider.GetBlockTransactionsOutput, error)
}

type service struct {
	provider Provider
}

func NewService(p Provider) Service {
	return &service{
		provider: p,
	}
}

func (s *service) BlockTransactions(ctx context.Context, height int) ([]pocket.Transaction, error) {
	var (
		perPage int = 10000
		page    int = 1
	)

	opts := provider.GetBlockTransactionsOptions{
		Height:  height,
		PerPage: perPage,
		Page:    page,
	}

	blockTransactions := make([]pocket.Transaction, 0)
	keepGoing := true

	for i := 0; keepGoing; i++ {
		opts.Page = opts.Page + i
		response, err := s.provider.GetBlockTransactions(&opts)
		if err != nil {
			return nil, errors.Wrap(err, "BlockTransactions")
		}

		transactions := make([]pocket.Transaction, len(response.Txs))

		for i, tx := range response.Txs {
			msg, err := json.Marshal(tx.StdTx.Msg)
			if err != nil {
				return nil, errors.Wrap(err, "BlockTransactions")
			}

			transactions[i] = pocket.Transaction{
				Height:  tx.Height,
				Type:    tx.TxResult.MessageType,
				Hash:    tx.Hash,
				Message: msg,
			}
		}

		blockTransactions = append(blockTransactions, transactions...)

		if len(blockTransactions) >= response.TotalTxs {
			keepGoing = false
		}
	}

	return blockTransactions, nil
}
