package pocket

import (
	"fmt"
	"time"
)

const TypeClaim = "pocketcore/claim"
const TypeProof = "pocketcore/proof"

type Transaction struct {
	Hash          string
	Height        uint
	Time          time.Time
	Type          string
	ChainID       string
	NumRelays     uint
	PoktPerRelay  float64
	SessionHeight uint
	ExpireHeight  uint
	AppPubkey     string
	ResultCode    int64
	IsConfirmed   bool
}

func (t Transaction) Chain() (Chain, error) {
	chain, err := ChainFromID(t.ChainID)
	if err != nil {
		return Chain{}, fmt.Errorf("Transaction.Chain: %s", err)
	}

	return chain, nil
}

func (tx Transaction) PoktAmount() float64 {
	return tx.PoktPerRelay * float64(tx.NumRelays)
}
