package pocket

const (
	TxTypeSend        = "send"
	TxTypeClaim       = "claim"
	TxTypeProof       = "proof"
	TxTypeStake       = "stake_validator"
	TxTypeUnstake     = "begin_unstake_validator"
	TxTypeUnjail      = "unjail_validator"
	TxTypeDaoTransfer = "dao_transfer"
)

type Transaction struct {
	Hash        string
	Height      uint
	Type        string
	Fee         uint
	FromAddress string
	ToAddress   string
	Amount      uint64
	Memo        string
	Claim       TxClaim
	Proof       TxProof
	Stake       TxStake
}

type TxClaim struct {
	Chain            string
	AppPublicKey     string
	SessionHeight    uint
	TotalProofs      uint
	EvidenceType     int8
	ExpirationHeight uint
}

type TxProof struct {
	AppPublicKey      string
	ClientPublicKey   string
	ServicerPublicKey string
	Chain             string
	RequestHash       string
	SessionHeight     uint
}

type TxStake struct {
	Amount        uint64
	Chains        []string
	PublicKeyType string
	PublicKey     string
	ServiceUrl    string
}
