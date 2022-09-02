package node

import (
	"context"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/pocket"
)

type Repo interface {
	CreateSchema(ctx context.Context) error
	DropSchemaIfExists(ctx context.Context) error
	FetchNodes(ctx context.Context) ([]pocket.Node, error)
	UpsertNode(ctx context.Context, node pocket.Node) error
}

func ServiceWithCache(s *Service, r Repo) Service {
	return &cachingService{
		nodeService: *s,
		repo:        r,
	}
}

type cachingService struct {
	nodeService Service
	repo        Repo
}

func (s *cachingService) NodesAtHeight(ctx context.Context, height int) ([]pocket.Node, error) {
	nodes, err := s.nodeService.NodesAtHeight(ctx, height)
	if err != nil {
		return nil, err
	}

	for _, node := range nodes {
		if err := s.repo.UpsertNode(ctx, node); err != nil {
			return nil, err
		}
	}

	return nodes, nil
}
