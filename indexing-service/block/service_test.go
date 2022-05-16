package block_test

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/pokt-foundation/pocket-go/provider"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/block"
	"github.com/itsnoproblem/pokt-calculator/indexing-service/inmem"
	"github.com/itsnoproblem/pokt-calculator/indexing-service/mocks"
)

func TestGetHeight(t *testing.T) {
	useHeight := 10
	prv := mocks.NewProvider(t)
	prv.On("GetBlockHeight").Return(useHeight, nil)

	ctx, svc := setupTests(t, prv)
	h, err := svc.Height(ctx)
	if err != nil {
		t.Fatalf("error retrieving height: %s", err)
	}

	if h < 1 {
		t.Fatalf("height %d was less than 1", h)
	}
}

func TestGetBlock(t *testing.T) {
	useHeight := 10
	fakeBlock := mockBlock(useHeight)

	prv := mocks.NewProvider(t)
	prv.On("GetBlockHeight").Return(useHeight, nil)
	prv.On("GetBlock", 10).Return(fakeBlock, nil)

	ctx, svc := setupTests(t, prv)
	h, err := svc.Height(ctx)
	if err != nil {
		t.Fatalf("error retrieving height: %s", err)
	}

	blk, err := svc.Block(ctx, h)
	if err != nil {
		t.Fatalf("error retrieving block: %s", err)
	}

	if blk.Height != h {
		t.Fatalf("block height %d does not match requested height %d", blk.Height, h)
	}
}

func setupTests(t *testing.T, prv *mocks.Provider) (context.Context, block.Service) {
	ctx := context.Background()
	return ctx, block.NewService(prv, inmem.NewBlocksRepo())
}

func mockBlock(h int) *provider.GetBlockOutput {
	blk := provider.GetBlockOutput{}
	blk.Block.Header.Time = time.Now()
	blk.Block.Header.Height = fmt.Sprintf("%d", h)
	return &blk
}
