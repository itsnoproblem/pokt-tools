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

func (s *Service) BlockTimes(heights []uint) (map[uint]time.Time, error) {
	times := make(map[uint]time.Time, len(heights))
	for _, id := range heights {
		var err error
		if times[id], err = s.provider.BlockTime(id); err != nil {
			return nil, fmt.Errorf("BlockTimes: %s", err)
		}
	}

	return times, nil
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

func (s *Service) AllAccountTransactions(address string) ([]pocket.Transaction, error) {
	var allTransactions []pocket.Transaction
	numPerPage := 100
	sortDirection := "desc"
	goAgain := true

	for i := 1; goAgain; i++ {
		txs, err := s.AccountTransactions(address, uint(i), uint(numPerPage), sortDirection)
		if err != nil {
			return nil, fmt.Errorf("AllAccountTransactions: %s", err)
		}

		if len(txs) < numPerPage {
			goAgain = false
		}

		for _, tx := range txs {
			if tx.Type == "pocketcore/claim" {
				allTransactions = append(allTransactions, tx)
			}
		}
	}

	return allTransactions, nil

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

func (s *Service) RewardsByMonth(address string) (map[string]pocket.MonthlyReward, error) {
	txs, err := s.AllAccountTransactions(address)
	if err != nil {
		return nil, fmt.Errorf("RewardsByMonth: %s", err)
	}

	months := make(map[string]pocket.MonthlyReward, len(txs))
	for _, tx := range txs {
		key := fmt.Sprintf("%d-%d", tx.Time.Year(), tx.Time.Month())
		if _, exists := months[key]; !exists {
			months[key] = pocket.MonthlyReward{
				Year:        uint(tx.Time.Year()),
				Month:       uint(tx.Time.Month()),
				TotalProofs: 0,
			}
		}
		month := months[key]
		month.TotalProofs = month.TotalProofs + tx.NumProofs
		month.Transactions = append(month.Transactions, tx)
		months[key] = month
	}

	return months, nil
}
