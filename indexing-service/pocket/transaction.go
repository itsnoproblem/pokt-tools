package pocket

import "encoding/json"

const (
	TransactionTypeProof = "proof"
	TransactionTypeClaim = "claim"
)

type Transaction struct {
	Height  int
	Type    string
	Fee     int
	Hash    string
	Message json.RawMessage
}
