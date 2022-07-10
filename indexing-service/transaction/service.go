package transaction

import (
	"context"
	"encoding/json"
	"strconv"

	"github.com/pkg/errors"

	"github.com/pokt-foundation/pocket-go/provider"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/pocket"
)

type Service interface {
	BlockTransactions(ctx context.Context, height int) ([]pocket.Transaction, error)
}

type Provider interface {
	GetBlockTransactions(options *provider.GetBlockTransactionsOptions) (*provider.GetBlockTransactionsOutput, error)
}

type service struct {
	provider Provider
}

func NewService(p Provider) Service {
	return &service{
		provider: p,
	}
}

func (s *service) BlockTransactions(ctx context.Context, height int) ([]pocket.Transaction, error) {
	var (
		perPage int = 10000
		page    int = 1
	)

	opts := provider.GetBlockTransactionsOptions{
		Height:  height,
		PerPage: perPage,
		Page:    page,
	}

	blockTransactions := make([]pocket.Transaction, 0)
	keepGoing := true

	for i := 0; keepGoing; i++ {
		opts.Page = opts.Page + i
		response, err := s.provider.GetBlockTransactions(&opts)
		if err != nil {
			return nil, errors.Wrap(err, "BlockTransactions")
		}

		transactions := make([]pocket.Transaction, len(response.Txs))

		for i, tx := range response.Txs {
			msg, err := json.Marshal(tx.StdTx.Msg)
			if err != nil {
				return nil, errors.Wrap(err, "BlockTransactions")
			}

			var fee uint
			fees := tx.StdTx.Fee
			if len(fees) > 0 {
				f, err := strconv.Atoi(fees[0].Amount)
				if err != nil {
					return nil, errors.Wrap(err, "BlockTransactions: decoding fee")
				}

				fee = uint(f)
			}

			transactions[i] = pocket.Transaction{
				Hash:        tx.Hash,
				Height:      uint(tx.Height),
				Type:        tx.TxResult.MessageType,
				Fee:         fee,
				FromAddress: tx.TxResult.Signer,
				Memo:        tx.StdTx.Memo,
				//ToAddress:   "",
				//Amount: 0,
				//Claim: pocket.TxClaim{},
				//Proof: pocket.TxProof{},
				//Stake: pocket.TxStake{},
			}

			switch tx.TxResult.MessageType {
			case pocket.TxTypeClaim:
				transactions[i].Claim, err = decodeClaimMessage(msg)
				if err != nil {
					return nil, errors.Wrap(err, "BlockTransactions")
				}

			case pocket.TxTypeProof:
				transactions[i].Proof, err = decodeProofMessage(msg)
				if err != nil {
					return nil, errors.Wrap(err, "BlockTransactions")
				}

			case pocket.TxTypeStake:
				transactions[i].Stake, err = decodeStakeMessage(msg)
				if err != nil {
					return nil, errors.Wrap(err, "BlockTransactions")
				}

			case pocket.TxTypeSend:
				sendMsg, err := decodeSendMessage(msg)
				if err != nil {
					return nil, errors.Wrap(err, "BlockTransactions")
				}

				amt, err := strconv.Atoi(sendMsg.Value.Amount)
				if err != nil {
					return nil, errors.Wrap(err, "BlockTransactions: amount")
				}

				transactions[i].ToAddress = sendMsg.Value.ToAddress
				transactions[i].Amount = uint64(amt)
			}
		}

		blockTransactions = append(blockTransactions, transactions...)

		if len(blockTransactions) >= response.TotalTxs {
			keepGoing = false
		}
	}

	return blockTransactions, nil
}

type msgSend struct {
	Type  string `json:"type"`
	Value struct {
		Amount      string `json:"amount"`
		FromAddress string `json:"from_address"`
		ToAddress   string `json:"to_address"`
	} `json:"value"`
}

func decodeSendMessage(msg json.RawMessage) (msgSend, error) {
	var decoded msgSend
	if err := json.Unmarshal(msg, &decoded); err != nil {
		return msgSend{}, errors.Wrap(err, "decodeSendMessage")
	}

	return decoded, nil
}

type msgClaim struct {
	Type  string `json:"type"`
	Value struct {
		EvidenceType     string `json:"evidence_type"`
		ExpirationHeight string `json:"expiration_height"`
		FromAddress      string `json:"from_address"`
		Header           struct {
			AppPublicKey  string `json:"app_public_key"`
			Chain         string `json:"chain"`
			SessionHeight string `json:"session_height"`
		} `json:"header"`
		MerkleRoot struct {
			MerkleHash string `json:"merkleHash"`
			Range      struct {
				Lower string `json:"lower"`
				Upper string `json:"upper"`
			} `json:"range"`
		} `json:"merkle_root"`
		TotalProofs string `json:"total_proofs"`
	} `json:"value"`
}

func decodeClaimMessage(msg json.RawMessage) (pocket.TxClaim, error) {
	var claimMsg msgClaim
	if err := json.Unmarshal(msg, &claimMsg); err != nil {
		return pocket.TxClaim{}, errors.Wrap(err, "decodeClaimMessage")
	}

	sessionHeight, err := strconv.Atoi(claimMsg.Value.Header.SessionHeight)
	if err != nil {
		return pocket.TxClaim{}, errors.Wrap(err, "decodeClaimMessage: sessionHeight")
	}

	totalProofs, err := strconv.Atoi(claimMsg.Value.TotalProofs)
	if err != nil {
		return pocket.TxClaim{}, errors.Wrap(err, "decodeClaimMessage: totalProofs")
	}

	evidenceType, err := strconv.Atoi(claimMsg.Value.EvidenceType)
	if err != nil {
		return pocket.TxClaim{}, errors.Wrap(err, "decodeClaimMessage: evidenceType")
	}

	expirationHeight, err := strconv.Atoi(claimMsg.Value.ExpirationHeight)
	if err != nil {
		return pocket.TxClaim{}, errors.Wrap(err, "decodeClaimMessage: expirationHeight")
	}

	return pocket.TxClaim{
		Chain:            claimMsg.Value.Header.Chain,
		AppPublicKey:     claimMsg.Value.Header.AppPublicKey,
		SessionHeight:    uint(sessionHeight),
		TotalProofs:      uint(totalProofs),
		EvidenceType:     int8(evidenceType),
		ExpirationHeight: uint(expirationHeight),
	}, nil
}

type msgProof struct {
	Type  string `json:"type"`
	Value struct {
		EvidenceType string `json:"evidence_type"`
		Leaf         struct {
			Type  string `json:"type"`
			Value struct {
				Aat struct {
					AppPubKey    string `json:"app_pub_key"`
					ClientPubKey string `json:"client_pub_key"`
					Signature    string `json:"signature"`
					Version      string `json:"version"`
				} `json:"aat"`
				Blockchain         string `json:"blockchain"`
				Entropy            string `json:"entropy"`
				RequestHash        string `json:"request_hash"`
				ServicerPubKey     string `json:"servicer_pub_key"`
				SessionBlockHeight string `json:"session_block_height"`
				Signature          string `json:"signature"`
			} `json:"value"`
		} `json:"leaf"`
	} `json:"value"`
}

func decodeProofMessage(msg json.RawMessage) (pocket.TxProof, error) {
	var proofMsg msgProof
	if err := json.Unmarshal(msg, &proofMsg); err != nil {
		return pocket.TxProof{}, errors.Wrap(err, "decodeProofMessage")
	}

	sessionHeight, err := strconv.Atoi(proofMsg.Value.Leaf.Value.SessionBlockHeight)
	if err != nil {
		return pocket.TxProof{}, errors.Wrap(err, "decodeProofMessage")
	}

	return pocket.TxProof{
		AppPublicKey:      proofMsg.Value.Leaf.Value.Aat.AppPubKey,
		ClientPublicKey:   proofMsg.Value.Leaf.Value.Aat.ClientPubKey,
		ServicerPublicKey: proofMsg.Value.Leaf.Value.ServicerPubKey,
		Chain:             proofMsg.Value.Leaf.Value.Blockchain,
		RequestHash:       proofMsg.Value.Leaf.Value.RequestHash,
		SessionHeight:     uint(sessionHeight),
	}, nil
}

type msgStake struct {
	Type  string `json:"type"`
	Value struct {
		Chains    []string `json:"chains"`
		PublicKey struct {
			Type  string `json:"type"`
			Value string `json:"value"`
		} `json:"public_key"`
		ServiceUrl string `json:"service_url"`
		Value      string `json:"value"`
	} `json:"value"`
}

func decodeStakeMessage(msg json.RawMessage) (pocket.TxStake, error) {
	var stakeMsg msgStake
	if err := json.Unmarshal(msg, &stakeMsg); err != nil {
		return pocket.TxStake{}, errors.Wrap(err, "decodeStakeMessage")
	}

	amount, err := strconv.Atoi(stakeMsg.Value.Value)
	if err != nil {
		return pocket.TxStake{}, errors.Wrap(err, "decodeStakeMessage")
	}

	return pocket.TxStake{
		Amount:        uint64(amount),
		Chains:        stakeMsg.Value.Chains,
		PublicKeyType: stakeMsg.Value.PublicKey.Type,
		PublicKey:     stakeMsg.Value.PublicKey.Value,
		ServiceUrl:    stakeMsg.Value.ServiceUrl,
	}, nil
}
