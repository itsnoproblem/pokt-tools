package block

import (
	"context"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/pocket"
	"github.com/pkg/errors"
)

type Repo interface {
	CreateSchema(ctx context.Context) error
	DropSchemaIfExists(ctx context.Context) error
	FetchAllBlocks(ctx context.Context) (map[int]pocket.Block, error)
	FetchBlock(ctx context.Context, height int) (pocket.Block, bool, error)
	InsertBlock(ctx context.Context, blk pocket.Block) error
}

func ServiceWithCache(s *Service, r Repo) Service {
	return &cachingService{
		blockService: *s,
		repo:         r,
	}
}

type cachingService struct {
	blockService Service
	repo         Repo
}

func (s *cachingService) Height(ctx context.Context) (int, error) {
	h, err := s.blockService.Height(ctx)
	if err != nil {
		return 0, errors.Wrap(err, "cachingService.Height")
	}

	return h, nil
}

func (s *cachingService) Block(ctx context.Context, h int) (pocket.Block, error) {
	blk, exists, err := s.repo.FetchBlock(ctx, h)
	if err != nil {
		return pocket.Block{}, errors.Wrap(err, "cachingService.Block")
	}
	if exists {
		return blk, nil
	}

	blk, err = s.blockService.Block(ctx, h)
	if err != nil {
		return pocket.Block{}, errors.Wrap(err, "cachingService.Block")
	}

	if err = s.insertBlock(ctx, blk); err != nil {
		return pocket.Block{}, errors.Wrap(err, "cachingService.Block")
	}

	return blk, nil
}

func (s *cachingService) insertBlock(ctx context.Context, blk pocket.Block) error {
	if err := s.repo.InsertBlock(ctx, blk); err != nil {
		return errors.Wrap(err, "insertBlock")
	}

	return nil
}
