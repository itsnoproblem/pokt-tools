package mysql

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/pkg/errors"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/pocket"
)

type nodesRepo struct {
	db *sql.DB
}

func NewNodesRepo(db *sql.DB) nodesRepo {
	return nodesRepo{db: db}
}

func (r *nodesRepo) FetchNodes(ctx context.Context) ([]pocket.Node, error) {
	query := `
		SELECT 
			height,
			address,
			public_key,
			is_jailed,
			status,
			chains,
			service_url,
			tokens,
			unstaking_time,
			output_address
		FROM nodes
	`
	result, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, errors.Wrap(err, "FetchNodes")
	}
	defer result.Close()

	nodes := make([]pocket.Node, 0)
	for result.Next() {
		node := pocket.Node{}
		if err = result.Scan(
			&node.Height,
			&node.Address,
			&node.PublicKey,
			&node.Jailed,
			&node.Status,
			&node.Chains,
			&node.ServiceUrl,
			&node.Tokens,
			&node.UnstakingTime,
			&node.OutputAddress,
		); err != nil {
			return nil, errors.Wrap(err, "FetchNodes")
		}
		nodes = append(nodes, node)
	}

	return nodes, nil
}

func (r *nodesRepo) UpsertNode(ctx context.Context, node pocket.Node) error {
	query := `
		INSERT INTO nodes
		(
			height,
			address,
			public_key,
			is_jailed,
			status,
			chains,
			service_url,
			tokens,
			unstaking_time,
			output_address
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE  
			height = ?,
			public_key = ?,
			is_jailed = ?,
			status = ?,
			chains = ?,
			service_url = ?,
			tokens = ?,
			unstaking_time = ?,
			output_address = ?
	`

	chains, err := json.Marshal(node.Chains)
	if err != nil {
		return errors.Wrap(err, "UpsertNode")
	}

	if _, err = r.db.ExecContext(ctx, query,
		// insert
		node.Height,
		node.Address,
		node.PublicKey,
		node.Jailed,
		node.Status,
		chains,
		node.ServiceUrl,
		node.Tokens,
		node.UnstakingTime.Format("2006-01-02 15:04:05"),
		node.OutputAddress,
		// update
		node.Height,
		node.PublicKey,
		node.Jailed,
		node.Status,
		chains,
		node.ServiceUrl,
		node.Tokens,
		node.UnstakingTime.Format("2006-01-02 15:04:05"),
		node.OutputAddress,
	); err != nil {
		return errors.Wrap(err, "UpsertNode")
	}

	return nil
}

func (r *nodesRepo) CreateSchema(ctx context.Context) error {
	query := `
		CREATE TABLE nodes (
		  address char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
		  height int(11) unsigned NOT NULL,
		  public_key char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
		  is_jailed tinyint(1) NOT NULL,
		  status tinyint(3) NOT NULL,
		  chains json NOT NULL,
		  service_url varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
		  tokens bigint(20) unsigned NOT NULL,
		  unstaking_time datetime NOT NULL,
		  output_address char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
		  PRIMARY KEY (address,height),
		  KEY public_key (public_key),
		  KEY is_jailed (is_jailed)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`
	if _, err := r.db.ExecContext(ctx, query); err != nil {
		return errors.Wrap(err, "CreateSchema: nodes")
	}

	return nil
}

func (r *nodesRepo) DropSchemaIfExists(ctx context.Context) error {
	query := `
		DROP TABLE IF EXISTS nodes
	`
	if _, err := r.db.ExecContext(ctx, query); err != nil {
		return errors.Wrapf(err, "DropSchemaIfExists: nodes")
	}

	return nil
}
