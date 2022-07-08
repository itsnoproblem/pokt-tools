package block

import (
	"context"
	"strconv"

	"github.com/pokt-foundation/pocket-go/provider"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/pocket"
	"github.com/pkg/errors"
)

type Service interface {
	Height(ctx context.Context) (int, error)
	Block(ctx context.Context, h int) (pocket.Block, error)
	AllBlocks(ctx context.Context) (map[int]pocket.Block, error)
}

type Provider interface {
	GetBlock(blockNumber int) (*provider.GetBlockOutput, error)
	GetBlockHeight() (int, error)
}

type service struct {
	provider Provider
}

func NewService(p Provider) Service {
	return &service{
		provider: p,
	}
}

func (s *service) Height(_ context.Context) (int, error) {
	h, err := s.provider.GetBlockHeight()
	if err != nil {
		return 0, errors.Wrap(err, "Height")
	}

	return h, nil
}

func (s *service) Block(_ context.Context, h int) (pocket.Block, error) {
	b, err := s.provider.GetBlock(h)
	if err != nil {
		return pocket.Block{}, errors.Wrap(err, "Block")
	}

	numTxs, err := strconv.Atoi(b.Block.Header.NumTxs)
	if err != nil {
		return pocket.Block{}, errors.Wrap(err, "Block")
	}

	return pocket.Block{
		Height:          h,
		Time:            b.Block.Header.Time,
		NumTxs:          numTxs,
		ProposerAddress: b.Block.Header.ProposerAddress,
	}, nil
}

func (s *service) Params(_ context.Context, h int) (pocket.ParamGroups, error) {
	return pocket.ParamGroups{}, nil
}

func (s *service) Param(ctx context.Context, h int) (pocket.Param, error) {
	return pocket.Param{}, nil
}

func (s *service) AllBlocks(ctx context.Context) (map[int]pocket.Block, error) {
	return nil, nil
}
