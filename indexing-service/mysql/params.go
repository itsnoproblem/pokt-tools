package mysql

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/pkg/errors"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/pocket"
)

type paramsRepo struct {
	db *sql.DB
}

func NewParamsRepo(db *sql.DB) paramsRepo {
	return paramsRepo{db: db}
}

func (r *paramsRepo) CreateSchema(ctx context.Context) error {
	query := `
	CREATE TABLE params (
		height int(11) unsigned NOT NULL,
		app_params JSON NOT NULL,
		auth_params JSON NOT NULL,
		goc_params JSON NOT NULL,
		node_params JSON NOT NULL,
		pocket_params JSON NOT NULL,
		PRIMARY KEY (height)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`
	if _, err := r.db.ExecContext(ctx, query); err != nil {
		return errors.Wrap(err, "paramsRepo.CreateSchema")
	}

	return nil
}

func (r *paramsRepo) DropSchemaIfExists(ctx context.Context) error {
	query := `DROP TABLE IF EXISTS params`
	if _, err := r.db.ExecContext(ctx, query); err != nil {
		return errors.Wrapf(err, "paramsRepo.DropSchema")
	}

	return nil
}

func (r *paramsRepo) InsertParams(ctx context.Context, params pocket.ParamGroups) error {
	query := `INSERT INTO params (height, app_params, auth_params, gov_params, node_params, pocket_params) 
			VALUES (?, ?, ?, ?, ?, ?)`

	var (
		appParams, authParams, govParams, nodeParams, pocketParams []byte
		err                                                        error
	)

	appParams, err = json.Marshal(params.AppParams)
	if err != nil {
		return errors.Wrap(err, "paramsRepo.InsertParams: appParams")
	}

	authParams, err = json.Marshal(params.AuthParams)
	if err != nil {
		return errors.Wrap(err, "paramsRepo.InsertParams: authParams")
	}

	govParams, err = json.Marshal(params.GovParams)
	if err != nil {
		return errors.Wrap(err, "paramsRepo.InsertParams: govParams")
	}

	nodeParams, err = json.Marshal(params.NodeParams)
	if err != nil {
		return errors.Wrap(err, "paramsRepo.InsertParams: nodeParams")
	}

	pocketParams, err = json.Marshal(params.PocketParams)
	if err != nil {
		return errors.Wrap(err, "paramsRepo.InsertParams: pocketParams")
	}

	if _, err := r.db.ExecContext(ctx, query, params.Height, appParams, authParams, govParams, nodeParams, pocketParams); err != nil {
		return errors.Wrap(err, "blocksRepo.InsertBlock")
	}

	return nil
}

func (r *paramsRepo) FetchParams(ctx context.Context, height int) (pg pocket.ParamGroups, exists bool, err error) {
	query := `SELECT height, app_params, auth_params, gov_params, node_params, pocket_params 
			  FROM params
			  WHERE height = ?`
	result, err := r.db.QueryContext(ctx, query, height)
	if err != nil {
		return pocket.ParamGroups{}, false, errors.Wrap(err, "paramsRepo.FetchParams")
	}
	defer result.Close()

	if !result.Next() {
		return pocket.ParamGroups{}, false, nil
	}

	pg, exists, parseErr := paramsFromResult(result)
	if parseErr != nil {
		return pocket.ParamGroups{}, false, errors.Wrap(err, "paramsRepo.FetchParams")
	}

	return pg, exists, nil
}

func (r *paramsRepo) FetchAllParams(ctx context.Context) (map[int]pocket.ParamGroups, error) {
	query := `SELECT height, app_params, auth_params, gov_params, node_params, pocket_params FROM params`
	result, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, errors.Wrap(err, "paramsRepo.FetchAllParams")
	}
	defer result.Close()

	params := make(map[int]pocket.ParamGroups)
	for result.Next() {
		param, _, err := paramsFromResult(result)
		if err != nil {
			return nil, errors.Wrap(err, "paramsRepo.FetchAllParams")
		}

		params[param.Height] = param
	}

	return params, nil
}

func paramsFromResult(rows *sql.Rows) (pg pocket.ParamGroups, exists bool, err error) {
	var (
		appParams, authParams, govParams, nodeParams, pocketParams []byte
		params                                                     pocket.ParamGroups
	)

	if err := rows.Scan(&params.Height, &appParams, &authParams, &govParams, &nodeParams, &pocketParams); err != nil {
		return pocket.ParamGroups{}, false, errors.Wrap(err, "paramsFromResult")
	}

	if err = json.Unmarshal(appParams, &params.AppParams); err != nil {
		return pocket.ParamGroups{}, false, errors.Wrap(err, "paramsFromResult: appParams")
	}

	if err = json.Unmarshal(authParams, &params.AuthParams); err != nil {
		return pocket.ParamGroups{}, false, errors.Wrap(err, "paramsFromResult: authParams")
	}

	if err = json.Unmarshal(govParams, &params.GovParams); err != nil {
		return pocket.ParamGroups{}, false, errors.Wrap(err, "paramsFromResult: govParams")
	}

	if err = json.Unmarshal(nodeParams, &params.NodeParams); err != nil {
		return pocket.ParamGroups{}, false, errors.Wrap(err, "paramsFromResult: nodeParams")
	}

	if err = json.Unmarshal(pocketParams, &params.PocketParams); err != nil {
		return pocket.ParamGroups{}, false, errors.Wrap(err, "paramsFromResult: pocketParams")
	}

	return params, true, nil
}
