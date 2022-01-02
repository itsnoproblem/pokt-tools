package monitoring

import (
	"fmt"
	"time"

	"github.com/itsnoproblem/pokthud/monitoring-service/pocket"
)

type PocketProvider interface {
	AccountTransactions(address string, page uint, perPage uint, sort string) ([]pocket.Transaction, error)
	Transaction(hash string) (pocket.Transaction, error)
	BlockTime(height uint) (time.Time, error)
	Node(address string) (pocket.Node, error)
	Balance(address string) (uint, error)
}

func NewService(provider PocketProvider) Service {
	return Service{
		provider: provider,
	}
}

type Service struct {
	provider PocketProvider
}

func (s *Service) Transaction(hash string) (pocket.Transaction, error) {
	txn, err := s.provider.Transaction(hash)
	if err != nil {
		return pocket.Transaction{}, fmt.Errorf("Transaction: %s", err)
	}

	txn.Time, err = s.provider.BlockTime(txn.Height)
	if err != nil {
		return pocket.Transaction{}, fmt.Errorf("Transaction: %s", err)
	}

	return txn, nil
}

func (s *Service) AccountTransactions(address string, page uint, perPage uint, sort string) ([]pocket.Transaction, error) {
	txs, err := s.provider.AccountTransactions(address, page, perPage, sort)
	if err != nil {
		return nil, fmt.Errorf("AccountTransactions: %s", err)
	}

	transactions := make([]pocket.Transaction, len(txs))
	for i, tx := range txs {
		tx.Time, err = s.provider.BlockTime(tx.Height)
		if err != nil {
			return nil, fmt.Errorf("AccountTransactions: %s", err)
		}

		transactions[i] = tx
	}

	return transactions, nil
}

func (s *Service) Node(address string) (pocket.Node, error) {
	node, err := s.provider.Node(address)
	if err != nil {
		return pocket.Node{}, fmt.Errorf("Node: %s", err)
	}

	node.Balance, err = s.provider.Balance(address)
	if err != nil {
		return pocket.Node{}, fmt.Errorf("Node: %s", err)
	}

	return node, nil
}
