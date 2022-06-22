package param

import (
	"context"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/pocket"
	"github.com/pkg/errors"
)

type Repo interface {
	CreateSchema(ctx context.Context) error
	DropSchemaIfExists(ctx context.Context) error
	FetchAllParams(ctx context.Context) (map[int]pocket.ParamGroups, error)
	FetchParams(ctx context.Context, height int) (pg pocket.ParamGroups, exists bool, err error)
	InsertParams(ctx context.Context, params pocket.ParamGroups) error
}

func ServiceWithCache(s *Service, r Repo) Service {
	return &cachingParamService{
		paramService: *s,
		repo:         r,
	}
}

type cachingParamService struct {
	paramService Service
	repo         Repo
}

func (s *cachingParamService) AllParams(ctx context.Context) (map[int]pocket.ParamGroups, error) {
	params, err := s.repo.FetchAllParams(ctx)
	if err != nil {
		return nil, err
	}

	return params, nil
}

func (s *cachingParamService) Params(ctx context.Context, h int) (pocket.ParamGroups, error) {
	params, exists, err := s.repo.FetchParams(ctx, h)
	if err != nil {
		return pocket.ParamGroups{}, err
	}

	if exists {
		return params, nil
	}

	params, err = s.paramService.Params(ctx, h)
	if err != nil {
		return pocket.ParamGroups{}, err
	}

	if err = s.insertParams(ctx, params); err != nil {
		return pocket.ParamGroups{}, err
	}

	return params, nil
}

func (s *cachingParamService) insertParams(ctx context.Context, params pocket.ParamGroups) error {
	if err := s.repo.InsertParams(ctx, params); err != nil {
		return errors.Wrap(err, "insertParams")
	}

	return nil
}
