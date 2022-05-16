package block

import (
	"context"

	"github.com/pokt-foundation/pocket-go/provider"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/pocket"
	"github.com/pkg/errors"
)

type Service interface {
	Height(ctx context.Context) (int, error)
	Block(ctx context.Context, h int) (pocket.Block, error)
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

	return pocket.Block{
		Height:          h,
		Time:            b.Block.Header.Time,
		ProposerAddress: b.Block.Header.ProposerAddress,
	}, nil
}

func (s *service) Params(ctx context.Context, h int) (pocket.Param, error) {
	return pocket.Param{}, nil
}
