package node

import (
	"fmt"
	"time"

	"github.com/itsnoproblem/pokthud/monitoring-service/transaction"
)

type PocketProvider interface {
	AccountTransactions(address string, page uint, perPage uint, sort string) ([]transaction.Transaction, error)
	Transaction(hash string) (transaction.Transaction, error)
	BlockTime(height uint) (time.Time, error)
}

func NewService(provider PocketProvider) Service {
	return Service{
		provider: provider,
	}
}

type Service struct {
	provider PocketProvider
}

func (s *Service) Transaction(hash string) (transaction.Transaction, error) {
	txn, err := s.provider.Transaction(hash)
	if err != nil {
		return transaction.Transaction{}, fmt.Errorf("Transaction: %s", err)
	}

	txn.Time, err = s.provider.BlockTime(txn.Height)
	if err != nil {
		return transaction.Transaction{}, fmt.Errorf("Transaction: %s", err)
	}

	return txn, nil
}

func (s *Service) AccountTransactions(address string) ([]transaction.Transaction, error) {
	txs, err := s.provider.AccountTransactions(address, 1, 10, "desc")
	if err != nil {
		return nil, fmt.Errorf("AccountTransactions: %s", err)
	}

	transactions := make([]transaction.Transaction, len(txs))
	for i, tx := range txs {
		tx.Time, err = s.provider.BlockTime(tx.Height)
		if err != nil {
			return nil, fmt.Errorf("AccountTransactions: %s", err)
		}

		transactions[i] = tx
	}

	return transactions, nil
}
