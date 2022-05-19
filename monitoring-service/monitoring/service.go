package monitoring

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	pocket2 "monitoring-service/provider/pocket"
	"sort"
	"strconv"
	"time"

	"monitoring-service/pocket"
)

type PocketProvider interface {
	NodeProvider(address string) (pocket2.Provider, error)
	SimulateRelay(servicerUrl, chainID string, payload json.RawMessage) (json.RawMessage, error)
	AccountTransactions(address string, page uint, perPage uint, sort string) ([]pocket.Transaction, error)
	Transaction(hash string) (pocket.Transaction, error)
	BlockTime(height uint) (time.Time, error)
	Node(address string) (pocket.Node, error)
	Balance(address string) (uint, error)
	Param(name string, height int64) (string, error)
	AllParams(height int64, forceRefresh bool) (pocket.AllParams, error)
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

func (s *Service) ParamsAtHeight(height int64, forceRefresh bool) (pocket.Params, error) {
	params := pocket.Params{}

	allParams, err := s.provider.AllParams(height, forceRefresh)
	if err != nil {
		return pocket.Params{}, fmt.Errorf("ParamsAtHeight: provider error: %s", err)
	}

	np := allParams.NodeParams
	multiplier, ok := np.Get("pos/RelaysToTokensMultiplier")
	if !ok {
		return pocket.Params{}, fmt.Errorf("ParamsAtHeight: node_params key not found at height %d 'pos/RelaysToTokensMultiplier'", height)
	}
	if params.RelaysToTokensMultiplier, err = strconv.ParseFloat(multiplier, 64); err != nil {
		return pocket.Params{}, errors.New("ParamsAtHeight: failed to parse node_params key 'pos/RelaysToTokensMultiplier'")
	}

	daoAlloc, ok := np.Get("pos/DAOAllocation")
	if !ok {
		return pocket.Params{}, errors.New("ParamsAtHeight: node_params key not found 'pos/DAOAllocation'")
	}
	da, err := strconv.ParseInt(daoAlloc, 10, 64)
	if err != nil {
		return pocket.Params{}, errors.New("ParamsAtHeight: failed to parse node_params key 'pos/DAOAllocation")
	}
	params.DaoAllocation = uint8(da)

	proposerCut, ok := np.Get("pos/ProposerPercentage")
	if !ok {
		return pocket.Params{}, errors.New("ParamsAtHeight: node_params key not found 'pos/ProposerPercentage'")
	}
	pp, err := strconv.ParseInt(proposerCut, 10, 64)
	if err != nil {
		return pocket.Params{}, errors.New("ParamsAtHeight: failed to parse node_params key 'pos/ProposerCut")
	}
	params.ProposerPercentage = uint8(pp)

	claimExpirationBlocks, ok := allParams.PocketParams.Get("pocketcore/ClaimExpiration")
	if !ok {
		return pocket.Params{}, errors.New("ParamsAtHeight: node_params key not found 'pocketcore/ClaimExpiration'")
	}
	claimExpires, err := strconv.ParseUint(claimExpirationBlocks, 10, 64)
	if err != nil {
		return pocket.Params{}, fmt.Errorf("ParamsAtHeight: failed to parse node_params ket 'pocketcore/ClaimExpiration': %s", err)
	}
	params.ClaimExpirationBlocks = uint(claimExpires)

	return params, nil
}

func (s *Service) AccountTransactions(address string, page uint, perPage uint, sort string) ([]pocket.Transaction, error) {
	txs, err := s.provider.AccountTransactions(address, page, perPage, sort)
	if err != nil {
		return nil, fmt.Errorf("AccountTransactions: %s", err)
	}

	transactions := make([]pocket.Transaction, len(txs))
	for i, tx := range txs {
		params, err := s.ParamsAtHeight(int64(tx.Height), false)
		if err != nil {
			return nil, fmt.Errorf("AccountTransactions: %s", err)
		}

		tx.Time, err = s.provider.BlockTime(tx.Height)
		tx.PoktPerRelay = params.PoktPerRelay()
		if err != nil {
			return nil, fmt.Errorf("AccountTransactions: %s", err)
		}

		tx.ExpireHeight = params.ClaimExpirationBlocks + tx.Height
		transactions[i] = tx
	}

	return transactions, nil
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

	nodeProvider, err := s.provider.NodeProvider(node.Address)
	if err != nil {
		log.Default().Printf("ERROR: %+v", err)
	} else {
		if node.LatestBlockHeight, err = nodeProvider.Height(); err != nil {
			log.Default().Printf("ERROR: %+v", err)
		} else {
			blockTimes, err := s.BlockTimes([]uint{node.LatestBlockHeight})
			if err != nil {
				log.Default().Printf("ERROR: %+v", err)
			} else {
				node.LatestBlockTime = blockTimes[node.LatestBlockHeight]
			}
		}
	}

	return node, nil
}

func (s *Service) SimulateRelay(servicerUrl, chainID string, payload map[string]interface{}) (json.RawMessage, error) {
	encodedPayload, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("SimulateRelay: %s", err)
	}

	resp, err := s.provider.SimulateRelay(servicerUrl, chainID, encodedPayload)
	if err != nil {
		return nil, fmt.Errorf("SimulateRelay: %s", err)
	}

	return resp, nil
}

func (s *Service) RewardsByMonth(address string) (map[string]pocket.MonthlyReward, error) {
	claims, proofs, err := s.AccountClaimsAndProofs(address)
	if err != nil {
		return nil, fmt.Errorf("RewardsByMonth: %s", err)
	}

	months := make(map[string]pocket.MonthlyReward)
	for sessionKey, tx := range claims {
		tx.IsConfirmed = false
		proof, proofExists := proofs[sessionKey]
		if proofExists && proof.ResultCode == 0 {
			tx.IsConfirmed = true
		}

		monthKey := fmt.Sprintf("%d-%d", tx.Time.Year(), tx.Time.Month())
		if _, exists := months[monthKey]; !exists {
			months[monthKey] = pocket.MonthlyReward{
				Year:        uint(tx.Time.Year()),
				Month:       uint(tx.Time.Month()),
				TotalProofs: 0,
				DaysOfWeek:  make(map[int]*pocket.DayOfWeek, 7),
			}
			months[monthKey].DaysOfWeek[0] = &pocket.DayOfWeek{Name: "Sunday", Proofs: 0}
			months[monthKey].DaysOfWeek[1] = &pocket.DayOfWeek{Name: "Monday", Proofs: 0}
			months[monthKey].DaysOfWeek[2] = &pocket.DayOfWeek{Name: "Tuesday", Proofs: 0}
			months[monthKey].DaysOfWeek[3] = &pocket.DayOfWeek{Name: "Wednesday", Proofs: 0}
			months[monthKey].DaysOfWeek[4] = &pocket.DayOfWeek{Name: "Thursday", Proofs: 0}
			months[monthKey].DaysOfWeek[5] = &pocket.DayOfWeek{Name: "Friday", Proofs: 0}
			months[monthKey].DaysOfWeek[6] = &pocket.DayOfWeek{Name: "Saturday", Proofs: 0}
		}
		month := months[monthKey]
		if tx.IsConfirmed {
			month.TotalProofs = month.TotalProofs + tx.NumRelays
		}

		month.Transactions = append(month.Transactions, tx)
		months[monthKey] = month
	}

	for monthKey, mo := range months {
		sort.Slice(months[monthKey].Transactions, func(i, j int) bool {
			return mo.Transactions[i].Time.Before(mo.Transactions[j].Time)
		})

		var numTxs = float64(0)
		var totalSecs = float64(0)
		var prevTx, emptyYx = pocket.Transaction{}, pocket.Transaction{}
		for _, tx := range months[monthKey].Transactions {
			if prevTx != emptyYx {
				totalSecs += tx.Time.Sub(prevTx.Time).Seconds()
				numTxs++
			}
			prevTx = tx

			dayOfWeek := int(tx.Time.Weekday())
			months[monthKey].DaysOfWeek[dayOfWeek].Proofs += tx.NumRelays
		}
		mo.AvgSecsBetweenRewards = totalSecs / numTxs
		if math.IsNaN(mo.AvgSecsBetweenRewards) {
			mo.AvgSecsBetweenRewards = 0
		}

		mo.TotalSecsBetweenRewards = totalSecs
		months[monthKey] = mo

	}

	return months, nil
}

func sessionKey(tx pocket.Transaction) string {
	return fmt.Sprintf("%d%s%s", tx.SessionHeight, tx.AppPubkey, tx.ChainID)
}
