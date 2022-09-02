package node

import (
	"context"
	"fmt"
	"strconv"

	"github.com/pkg/errors"

	"github.com/pokt-foundation/pocket-go/provider"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/pocket"
)

type Service interface {
	NodesAtHeight(ctx context.Context, height int) ([]pocket.Node, error)
}

type Provider interface {
	GetNodes(options *provider.GetNodesOptions) (*provider.GetNodesOutput, error)
}

type service struct {
	provider Provider
}

func NewService(p Provider) Service {
	return &service{
		provider: p,
	}
}

func (s *service) NodesAtHeight(ctx context.Context, height int) ([]pocket.Node, error) {
	var (
		perPage int = 10000
		page    int = 0
	)

	opts := provider.GetNodesOptions{
		Height:  height,
		Page:    page,
		PerPage: perPage,
	}

	nodes := make([]pocket.Node, 0)
	keepGoing := true

	for i := 0; keepGoing; i++ {
		opts.Page = opts.Page + 1
		resp, err := s.provider.GetNodes(&opts)
		if err != nil {
			return nil, errors.Wrap(err, "NodesAtHeight")
		}

		fmt.Printf("[%d] Page %d of %d: got %d nodes\n", i, opts.Page, resp.TotalPages, len(resp.Result))
		if opts.Page == resp.TotalPages || len(resp.Result) < perPage {
			keepGoing = false
		}

		for _, node := range resp.Result {
			tokens, err := strconv.Atoi(node.Tokens)
			if err != nil {
				return nil, errors.Wrap(err, "NodesAtHeight")
			}

			n := pocket.Node{
				Address:       node.Address,
				Height:        uint(height),
				PublicKey:     node.PublicKey,
				Jailed:        node.Jailed,
				Status:        node.Status,
				Chains:        node.Chains,
				ServiceUrl:    node.ServiceURL,
				Tokens:        uint64(tokens),
				UnstakingTime: node.UnstakingTime,
				OutputAddress: node.OutputAddress,
			}
			nodes = append(nodes, n)
		}
	}

	return nodes, nil
}
