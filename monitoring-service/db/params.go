package db

import (
	"encoding/json"
	"fmt"
	"monitoring-service/pocket"
	"time"

	"git.mills.io/prologic/bitcask"
)

type ParamsRepo struct {
	db *bitcask.Bitcask
}

func NewParamsRepo(db *bitcask.Bitcask) ParamsRepo {
	return ParamsRepo{db: db}
}

func (r ParamsRepo) Get(name string, height int64) (p pocket.Params, exists bool, err error) {
	keyB := r.key(name, height)
	paramsB, err := r.db.Get(keyB)
	if err != nil {
		return pocket.Params{}, false, fmt.Errorf("ParamsRepo.Get [%s, %d]: %s", name, height, err)
	}

	var params pocket.Params
	if err = json.Unmarshal(paramsB, &params); err != nil {
		return pocket.Params{}, false, fmt.Errorf("ParamsRepo.Get: failed to parse json for %s, %d: %s", name, height, err)
	}

	return params, true, nil
}

func (r ParamsRepo) Set(name string, height int64, p pocket.Params) error {
	keyB := r.key(name, height)
	paramsB, _ := json.Marshal(p)
	err := r.db.PutWithTTL(keyB, paramsB, time.Hour*3)
	if err != nil {
		return fmt.Errorf("ParamsRepo.Set [%s, %d]: %s", name, height, err)
	}

	return nil
}

func (r ParamsRepo) GetAll(height int64) (params pocket.AllParams, exists bool, err error) {
	keyB := r.key("pocketAllParams", height)
	paramsB, err := r.db.Get(keyB)
	if err != nil {
		return pocket.AllParams{}, false, fmt.Errorf("ParamsRepo.GetAll: %s", err)
	}

	if err = json.Unmarshal(paramsB, &params); err != nil {
		return pocket.AllParams{}, false, fmt.Errorf("ParamsRepo.GetAll: %s", err)
	}

	if err = params.Validate(); err != nil {
		return pocket.AllParams{}, false, fmt.Errorf("ParamsRepo.Getall: %s", err)
	}

	return params, true, nil
}

func (r ParamsRepo) DelAll(height int64) error {
	keyB := r.key("pocketAllParams", height)
	if err := r.db.Delete(keyB); err != nil {
		return fmt.Errorf("DelAll: %s", err)
	}

	return nil
}

func (r ParamsRepo) SetAll(height int64, params pocket.AllParams) error {
	keyB := r.key("pocketAllParams", height)
	paramsB, _ := json.Marshal(params)
	err := r.db.PutWithTTL(keyB, paramsB, time.Hour*3)
	if err != nil {
		return fmt.Errorf("ParamsRepo.SetAll [%d]: %s", height, err)
	}

	return nil
}

func (r ParamsRepo) key(name string, height int64) []byte {
	key := fmt.Sprintf("%d%s", height, name)
	keyB, _ := json.Marshal(key)
	return keyB
}
