package inmem

import "time"

type blockTimes map[uint]time.Time

type BlockTimesRepo struct {
	store blockTimes
}

func NewBlockTimesRepo() BlockTimesRepo {
	return BlockTimesRepo{store: make(blockTimes)}
}

func (r *BlockTimesRepo) Get(height uint) (t time.Time, exists bool) {
	t, ok := r.store[height]
	if !ok {
		return time.Time{}, false
	}

	return t, true
}

func (r *BlockTimesRepo) Set(height uint, t time.Time) {
	r.store[height] = t
}
