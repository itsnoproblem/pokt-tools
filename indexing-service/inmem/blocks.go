package inmem

import (
	"context"
	"errors"
	"fmt"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/block"
	"github.com/itsnoproblem/pokt-calculator/indexing-service/pocket"
)

type repo struct {
	blocks map[int]pocket.Block
}

func NewBlocksRepo() block.Repo {
	b := make(map[int]pocket.Block)
	return &repo{blocks: b}
}

func (r *repo) CreateSchema(ctx context.Context) error {
	return nil
}

func (r *repo) DropSchemaIfExists(ctx context.Context) error {
	return nil
}

func (r *repo) FetchAllBlocks(ctx context.Context) (map[int]pocket.Block, error) {
	return r.blocks, nil
}

func (r *repo) FetchBlock(ctx context.Context, height int) (pocket.Block, bool, error) {
	blk, exists := r.blocks[height]
	if !exists {
		return pocket.Block{}, false, nil
	}

	return blk, true, nil
}

func (r *repo) InsertBlock(ctx context.Context, blk pocket.Block) error {
	if _, exists := r.blocks[blk.Height]; exists {
		return errors.New(fmt.Sprintf("Block already exists for height %d", blk.Height))
	}

	r.blocks[blk.Height] = blk
	return nil
}
