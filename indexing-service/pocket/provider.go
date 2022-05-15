package pocket

import (
	"math/big"
	"time"

	"github.com/pokt-foundation/pocket-go/provider"
)

type Provider interface {
	GetBlock(blockNumber int) (*provider.GetBlockOutput, error)
	GetBlockHeight() (int, error)
	UpdateRequestConfig(retries int, timeout time.Duration)
	ResetRequestConfigToDefault()
	GetBalance(address string, options *provider.GetBalanceOptions) (*big.Int, error)
	GetAccountTransactions(address string, options *provider.GetAccountTransactionsOptions) (*provider.GetAccountTransactionsOutput, error)
	GetBlockTransactions(blockHeight int, options *provider.GetBlockTransactionsOptions) (*provider.GetBlockTransactionsOutput, error)
	GetType(address string, options *provider.GetTypeOptions) (provider.AddressType, error)
}
