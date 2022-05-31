package inmem

import (
	"monitoring-service/pocket"
)

type block map[uint]pocket.Block

type BlockRepo struct {
	store block
}

func NewBlockRepo() BlockRepo {
	return BlockRepo{store: make(block)}
}

func (r *BlockRepo) Get(height uint) (p pocket.Block, exists bool) {
	p, ok := r.store[height]
	if !ok {
		return pocket.Block{}, false
	}

	return p, true
}

func (r *BlockRepo) Set(height uint, p pocket.Block) {
	r.store[height] = p
}
