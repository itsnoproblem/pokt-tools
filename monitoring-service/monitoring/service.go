package monitoring

import (
	"fmt"
	"sort"
	"time"

	"monitoring-service/pocket"
)

type PocketProvider interface {
	AccountTransactions(address string, page uint, perPage uint, sort string) ([]pocket.Transaction, error)
	Transaction(hash string) (pocket.Transaction, error)
	BlockTime(height uint) (time.Time, error)
	Node(address string) (pocket.Node, error)
	Balance(address string) (uint, error)
	Height() (uint, error)
}

func NewService(provider PocketProvider) Service {
	return Service{
		provider: provider,
	}
}

type Service struct {
	provider PocketProvider
}

func (s *Service) Height() (uint, error) {
	height, err := s.provider.Height()
	if err != nil {
		return 0, fmt.Errorf("Height: %s", err)
	}

	return height, nil
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

func sessionKey(tx pocket.Transaction) string {
	return fmt.Sprintf("%d%s%s", tx.SessionHeight, tx.AppPubkey, tx.ChainID)
}

func (s *Service) AccountClaimsAndProofs(address string) (claims, proofs map[string]pocket.Transaction, err error) {
	page := 1
	numPerPage := 100
	sortDirection := "desc"
	goAgain := true

	claims, proofs = make(map[string]pocket.Transaction), make(map[string]pocket.Transaction)

	for goAgain {
		txs, err := s.AccountTransactions(address, uint(page), uint(numPerPage), sortDirection)
		if err != nil {
			return nil, nil, fmt.Errorf("AccountClaimsAndProofs: %s", err)
		}

		if len(txs) < numPerPage {
			goAgain = false
		}

		for _, tx := range txs {
			sessionKey := sessionKey(tx)
			switch tx.Type {
			case pocket.TypeClaim:
				claims[sessionKey] = tx
				break
			case pocket.TypeProof:
				proofs[sessionKey] = tx
				break
			}
		}
		page++
	}

	return claims, proofs, nil

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
	claims, proofs, err := s.AccountClaimsAndProofs(address)
	if err != nil {
		return nil, fmt.Errorf("RewardsByMonth: %s", err)
	}

	months := make(map[string]pocket.MonthlyReward)
	for sessionKey, tx := range claims {
		tx.IsConfirmed = false
		_, proofExists := proofs[sessionKey]
		if proofExists {
			tx.IsConfirmed = true
		}

		monthKey := fmt.Sprintf("%d-%d", tx.Time.Year(), tx.Time.Month())
		if _, exists := months[monthKey]; !exists {
			months[monthKey] = pocket.MonthlyReward{
				Year:        uint(tx.Time.Year()),
				Month:       uint(tx.Time.Month()),
				TotalProofs: 0,
			}
		}
		month := months[monthKey]
		if tx.IsConfirmed {
			month.TotalProofs = month.TotalProofs + tx.NumProofs
		}

		month.Transactions = append(month.Transactions, tx)
		months[monthKey] = month
	}

	for monthKey, mo := range months {
		sort.Slice(months[monthKey].Transactions, func(i, j int) bool {
			return mo.Transactions[i].Time.Before(mo.Transactions[j].Time)
		})
	}

	return months, nil
}
