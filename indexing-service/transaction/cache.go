package transaction

import (
	"context"

	"github.com/pkg/errors"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/pocket"
)

type Repo interface {
	CreateSchema(ctx context.Context) error
	DropSchemaIfExists(ctx context.Context) error
	FetchTransactionsAtHeight(ctx context.Context, height int) ([]pocket.Transaction, error)
	InsertTransaction(ctx context.Context, tx pocket.Transaction) error
}

type BlockService interface {
	Block(ctx context.Context, h int) (pocket.Block, error)
}

func ServiceWithCache(s *Service, bs BlockService, r Repo) Service {
	return &cachingService{
		transactionService: *s,
		blockService:       bs,
		repo:               r,
	}
}

type cachingService struct {
	transactionService Service
	blockService       BlockService
	repo               Repo
}

func (s *cachingService) BlockTransactions(ctx context.Context, height int) ([]pocket.Transaction, error) {
	blk, err := s.blockService.Block(ctx, height)
	if err != nil {
		return nil, errors.Wrap(err, "cachingService.BlockTransactions")
	}

	existingTxs, err := s.repo.FetchTransactionsAtHeight(ctx, height)
	if err != nil {
		return nil, errors.Wrap(err, "cachingService.BlockTransactions")
	}

	if len(existingTxs) == blk.NumTxs {
		return existingTxs, nil
	}

	txs, err := s.transactionService.BlockTransactions(ctx, height)
	if err != nil {
		return nil, errors.Wrap(err, "cachingService.BlockTransactions")
	}

	for _, tx := range txs {
		err := s.repo.InsertTransaction(ctx, tx)
		if err != nil {
			return nil, errors.Wrap(err, "cachingService.BlockTransactions")
		}
	}

	return txs, nil
}
