package pocket

import "time"

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
	IsConfirmed   bool
}

func (tx Transaction) PoktAmount() float64 {
	return tx.PoktPerRelay * float64(tx.NumRelays)
}
