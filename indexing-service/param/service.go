package param

import (
	"context"
	"fmt"

	"github.com/pkg/errors"

	"github.com/pokt-foundation/pocket-go/provider"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/pocket"
)

type Service interface {
	Params(ctx context.Context, h int) (pocket.ParamGroups, error)
	AllParams(ctx context.Context) (map[int]pocket.ParamGroups, error)
}

type Provider interface {
	GetAllParams(options *provider.GetAllParamsOptions) (*provider.AllParams, error)
}

type service struct {
	provider Provider
}

func NewService(p Provider) Service {
	return &service{
		provider: p,
	}
}

func (s *service) Params(ctx context.Context, h int) (pocket.ParamGroups, error) {
	opts := provider.GetAllParamsOptions{
		Height: h,
	}
	params, err := s.provider.GetAllParams(&opts)
	if err != nil {
		return pocket.ParamGroups{}, errors.Wrap(err, "Params")
	}
	if params == nil {
		return pocket.ParamGroups{}, fmt.Errorf("params not found at height %d", h)
	}

	return pocket.ParamGroups{
		Height:       h,
		AppParams:    paramGroupFromProviderGroup(params.AppParams),
		AuthParams:   paramGroupFromProviderGroup(params.AuthParams),
		GovParams:    paramGroupFromProviderGroup(params.GovParams),
		NodeParams:   paramGroupFromProviderGroup(params.NodeParams),
		PocketParams: paramGroupFromProviderGroup(params.PocketParams),
	}, nil
}

func (s *service) AllParams(ctx context.Context) (map[int]pocket.ParamGroups, error) {
	return nil, errors.New("NOT IMPLEMENTED")
}

func paramGroupFromProviderGroup(group provider.ParamGroup) pocket.ParamsByName {
	resp := make(pocket.ParamsByName)

	for _, param := range group {
		resp[param.Key] = pocket.Param{
			Key:   param.Key,
			Value: param.Value,
		}
	}

	return resp
}
