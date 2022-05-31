package db

import (
	"encoding/json"
	"fmt"
	"monitoring-service/pocket"

	"git.mills.io/prologic/bitcask"
)

type BlockRepo struct {
	db *bitcask.Bitcask
}

func NewBlockRepo(db *bitcask.Bitcask) BlockRepo {
	return BlockRepo{db: db}
}

func (r BlockRepo) Get(height uint) (p pocket.Block, exists bool, err error) {
	heightB, _ := json.Marshal(height)
	blockB, err := r.db.Get(heightB)
	if err != nil {
		return pocket.Block{}, false, fmt.Errorf("BlockRepo.Get [%d]: %s", height, err)
	}

	var block pocket.Block
	if err = json.Unmarshal(blockB, &block); err != nil {
		return pocket.Block{}, false, fmt.Errorf("BlockRepo,Get: failed to parse json for %d: %s", height, err)
	}

	return block, true, nil
}

func (r BlockRepo) Set(height uint, p pocket.Block) error {
	heightB, _ := json.Marshal(height)
	blockB, _ := json.Marshal(p)
	err := r.db.Put(heightB, blockB)
	if err != nil {
		return fmt.Errorf("BlockRepo.Set: %s", err)
	}

	return nil
}
