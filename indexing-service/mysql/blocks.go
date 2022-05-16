package mysql

import (
	"context"
	"database/sql"
	"strings"

	"github.com/pkg/errors"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/pocket"
)

type repo struct {
	db *sql.DB
}

func NewBlocksRepo(db *sql.DB) repo {
	return repo{db: db}
}

func (r *repo) CreateSchema(ctx context.Context) error {
	query := `
	CREATE TABLE blocks (
		height int(11) unsigned NOT NULL,
		time datetime NOT NULL,
		proposer_address varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
		PRIMARY KEY (height),
		INDEX  idx_time (time)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`
	if _, err := r.db.ExecContext(ctx, query); err != nil {
		return errors.Wrap(err, "BlocksRepo: CreateSchema failed")
	}

	return nil
}

func (r *repo) DropSchemaIfExists(ctx context.Context) error {
	query := `DROP TABLE IF EXISTS blocks`
	if _, err := r.db.ExecContext(ctx, query); err != nil {
		return errors.Wrapf(err, "blocksRepo.DropSchema")
	}

	return nil
}

func (r *repo) InsertBlock(ctx context.Context, blk pocket.Block) error {
	query := `INSERT INTO blocks (height, time, proposer_address) VALUES (?, ?, ?)`
	if _, err := r.db.ExecContext(ctx, query, blk.Height, blk.Time, blk.ProposerAddress); err != nil {
		return errors.Wrap(err, "blocksRepo.InsertBlock")
	}

	return nil
}

func (r *repo) InsertBlocks(ctx context.Context, blks []pocket.Block) error {
	query := `INSERT INTO blocks(height, time, proposer_address) VALUES `
	params := make([]string, len(blks))
	values := make([]interface{}, 0)
	for i, blk := range blks {
		params[i] = "(?, ?, ?)"
		values = append(values, blk.Height, blk.Time, blk.ProposerAddress)
	}
	query += strings.Join(params, ",")

	if _, err := r.db.QueryContext(ctx, query, values); err != nil {
		return errors.Wrap(err, "InsertBlock")
	}

	return nil
}

func (r *repo) FetchBlocks(ctx context.Context, heights []int) (map[int]pocket.Block, error) {
	params := make([]string, len(heights))
	for i := 0; i < len(heights); i++ {
		params[i] = "?"
	}
	query := `SELECT height, time, proposer_address FROM blocks WHERE height IN (` + strings.Join(params, ",") + ")"
	res, err := r.db.QueryContext(ctx, query, heights)
	if err != nil {
		return nil, errors.Wrap(err, "FetchBlocks")
	}

	blocks := make(map[int]pocket.Block)
	for res.Next() {
		blk := pocket.Block{}
		if err := res.Scan(&blk.Height, &blk.Time, &blk.ProposerAddress); err != nil {
			return nil, errors.Wrap(err, "FetchBlocks")
		}
		blocks[blk.Height] = blk
	}

	return blocks, nil
}

func (r *repo) FetchAllBlocks(ctx context.Context) (map[int]pocket.Block, error) {
	query := `SELECT height, time, proposer_address FROM blocks`
	result, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, errors.Wrap(err, "blocksRepo.FetchAllBlocks")
	}
	defer result.Close()

	blocks := make(map[int]pocket.Block)
	for result.Next() {
		blk := pocket.Block{}
		if err := result.Scan(&blk.Height, &blk.Time, &blk.ProposerAddress); err != nil {
			return nil, errors.Wrap(err, "blocksRepo.FetchAllBlocks")
		}

		blocks[blk.Height] = blk
	}

	return blocks, nil
}

func (r *repo) FetchBlock(ctx context.Context, height int) (pocket.Block, bool, error) {
	query := `SELECT height, time, proposer_address FROM blocks WHERE height = ? LIMIT 1`
	result, err := r.db.QueryContext(ctx, query, height)
	if err != nil {
		return pocket.Block{}, false, errors.Wrap(err, "FetchBlock")
	}
	defer result.Close()

	if !result.Next() {
		return pocket.Block{}, false, nil
	}

	blk := pocket.Block{}
	if err = result.Scan(&blk.Height, &blk.Time, &blk.ProposerAddress); err != nil {
		return pocket.Block{}, false, errors.Wrap(err, "FetchBlock")
	}

	return blk, true, nil
}
