package pocket

import (
	"fmt"
	"strconv"

	"github.com/itsnoproblem/pokthud/monitoring-service/transaction"
)

type accountTransactionsRequest struct {
	Address string `json:"address"`
	Height  uint   `json:"height"`
	Page    uint   `json:"page"`
	PerPage uint   `json:"per_page"`
	Sort    string `json:"sort"`
}

type accountTransactionsResponse struct {
	Transactions []transactionResponse `json:"txs"`
}

type transactionRequest struct {
	Hash string `json:"hash"`
}

type transactionResponse struct {
	Hash   string        `json:"hash"`
	Height float64       `json:"height"`
	StdTx  stdTxResponse `json:"stdTx"`
}

func (t *transactionResponse) Transaction() (transaction.Transaction, error) {
	var numProofs uint64
	var err error

	if t.StdTx.Message.Value.TotalProofs == "" {
		numProofs = 0
	} else {
		numProofs, err = strconv.ParseUint(t.StdTx.Message.Value.TotalProofs, 10, 32)
		if err != nil {
			return transaction.Transaction{}, fmt.Errorf("transactionResponse.Transaction: %s", err)
		}
	}

	return transaction.Transaction{
		Hash:      t.Hash,
		Height:    uint(t.Height),
		Type:      t.StdTx.Message.Type,
		ChainID:   t.StdTx.Message.Value.Header.Chain,
		NumProofs: uint(numProofs),
	}, nil
}

type stdTxResponse struct {
	Fee     []feeResponse `json:"fee"`
	Message msgResponse   `json:"msg"`
}

type feeResponse struct {
	Amount       string `json:"amount"`
	Denomination string `json:"denom"`
}

type msgResponse struct {
	Type  string           `json:"type"`
	Value msgValueResponse `json:"value"`
}

type msgValueResponse struct {
	FromAddress string            `json:"from_address"`
	Header      msgHeaderResponse `json:"header"`
	TotalProofs string            `json:"total_proofs"`
}

type msgHeaderResponse struct {
	AppPubKey     string `json:"app_public_key"`
	Chain         string `json:"chain"`
	SessionHeight string `json:"session_height"`
}
