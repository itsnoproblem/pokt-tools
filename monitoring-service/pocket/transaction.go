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
	NumProofs     uint
	SessionHeight uint
	ExpireHeight  uint
	AppPubkey     string
	IsConfirmed   bool
}
