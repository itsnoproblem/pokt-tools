package mysql

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/pkg/errors"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/pocket"
)

type transactionsRepo struct {
	db *sql.DB
}

func NewTransactionsRepo(db *sql.DB) transactionsRepo {
	return transactionsRepo{db: db}
}

func (r *transactionsRepo) InsertTransaction(ctx context.Context, tx pocket.Transaction) error {
	dbTx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return errors.Wrap(err, "InsertTransaction")
	}

	query := `
		INSERT INTO transactions 
		(
		    hash, 
		    height, 
		    type, 
		    fee, 
		    from_address, 
		    to_address, 
		    amount, 
		    memo
		) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`
	if _, err := dbTx.ExecContext(ctx, query,
		tx.Hash,
		tx.Height,
		tx.Type,
		tx.Fee,
		tx.FromAddress,
		tx.ToAddress,
		tx.Amount,
		tx.Memo,
	); err != nil {
		return errors.Wrap(err, "transactionsRepo.InsertTransaction")
	}

	switch tx.Type {
	case pocket.TxTypeClaim:
		err = insertTxClaim(ctx, dbTx, tx)
	case pocket.TxTypeProof:
		err = insertTxProof(ctx, dbTx, tx)
	case pocket.TxTypeStake:
		err = insertTxStake(ctx, dbTx, tx)
	}

	if err != nil {
		if rollbackErr := dbTx.Rollback(); rollbackErr != nil {
			return errors.Wrapf(err, "InsertTransaction: rollback failed (%s) for error", rollbackErr)
		}

		return errors.Wrap(err, "transactionsRepo.InsertTransaction")
	}

	if err = dbTx.Commit(); err != nil {
		return errors.Wrap(err, "transactionsRepo.InsertTransaction")
	}

	return nil
}

func insertTxClaim(ctx context.Context, dbTx *sql.Tx, tx pocket.Transaction) error {
	var err error

	query2 := `
			INSERT INTO tx_claim
			(
				hash,
				chain,
				app_public_key,
				session_height,
				total_proofs,
				evidence_type,
				expiration_height
			)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`
	if _, err = dbTx.ExecContext(ctx, query2,
		tx.Hash,
		tx.Claim.Chain,
		tx.Claim.AppPublicKey,
		tx.Claim.SessionHeight,
		tx.Claim.TotalProofs,
		tx.Claim.EvidenceType,
		tx.Claim.ExpirationHeight,
	); err != nil {
		return errors.Wrap(err, "insertTxClaim")
	}

	return nil
}

func insertTxProof(ctx context.Context, dbTx *sql.Tx, tx pocket.Transaction) error {
	var err error

	query2 := `
			INSERT INTO tx_proof
			(
				hash,
				app_pub_key,
			 	client_pub_key,
			 	servicer_pub_key,
			 	blockchain,
			 	request_hash,
			 	session_height
			)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`
	if _, err = dbTx.ExecContext(ctx, query2,
		tx.Hash,
		tx.Proof.AppPublicKey,
		tx.Proof.ClientPublicKey,
		tx.Proof.ServicerPublicKey,
		tx.Proof.Chain,
		tx.Proof.RequestHash,
		tx.Proof.SessionHeight,
	); err != nil {
		return errors.Wrap(err, "insertTxProof")
	}

	return nil
}

func insertTxStake(ctx context.Context, dbTx *sql.Tx, tx pocket.Transaction) error {
	var err error

	query2 := `
			INSERT INTO tx_stake
			(
				hash,
			 	amount,
			 	chains,
			 	pub_key_type,
			 	pub_key_value,
			 	service_url
			)
			VALUES (?, ?, ?, ?, ?, ?)
		`

	chains, err := json.Marshal(tx.Stake.Chains)
	if err != nil {
		return errors.Wrap(err, "insertTxStake")
	}

	if _, err = dbTx.ExecContext(ctx, query2,
		tx.Hash,
		tx.Stake.Amount,
		chains,
		tx.Stake.PublicKeyType,
		tx.Stake.PublicKey,
		tx.Stake.ServiceUrl,
	); err != nil {
		return errors.Wrap(err, "insertTxStake")
	}

	return nil
}

func (r *transactionsRepo) FetchTransactionsAtHeight(ctx context.Context, height int) ([]pocket.Transaction, error) {
	query := `
		SELECT 
		    hash, 
		    height, 
		    type, 
		    fee, 
		    from_address, 
		    to_address, 
		    amount, 
		    memo 
		FROM transactions
	`
	result, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, errors.Wrap(err, "transactionsRepo.FetchTransactionsAtHeight")
	}
	defer result.Close()

	transactions := make([]pocket.Transaction, 0)
	for result.Next() {
		tx := pocket.Transaction{}
		if err := result.Scan(
			&tx.Hash,
			&tx.Height,
			&tx.Type,
			&tx.Fee,
			&tx.FromAddress,
			&tx.ToAddress,
			&tx.Amount,
			&tx.Memo,
		); err != nil {
			return nil, errors.Wrap(err, "blocksRepo.FetchAllBlocks")
		}

		transactions = append(transactions, tx)
	}

	return transactions, nil
}

func (r *transactionsRepo) CreateSchema(ctx context.Context) error {
	if err := r.createTransactionsSchema(ctx); err != nil {
		return err
	}

	if err := r.createTxClaimSchema(ctx); err != nil {
		return err
	}

	if err := r.createTxProofSchema(ctx); err != nil {
		return err
	}

	if err := r.createTxStakeSchema(ctx); err != nil {
		return err
	}

	return nil
}

func (r *transactionsRepo) DropSchemaIfExists(ctx context.Context) error {
	if err := r.dropTxClaimSchemaIfExists(ctx); err != nil {
		return err
	}

	if err := r.dropTxProofSchemaIfExists(ctx); err != nil {
		return err
	}

	if err := r.dropTxStakeSchemaIfExists(ctx); err != nil {
		return err
	}

	if err := r.dropTransactionsSchemaIfExists(ctx); err != nil {
		return err
	}

	return nil
}

func (r *transactionsRepo) createTransactionsSchema(ctx context.Context) error {
	query := `
		CREATE TABLE transactions (
		  hash char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
		  height int(11) unsigned NOT NULL,
		  type varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
		  fee int(11) unsigned NOT NULL,
		  from_address char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
		  to_address char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
		  amount bigint(20) unsigned NOT NULL,
		  memo varchar(4096) COLLATE utf8mb4_unicode_ci NOT NULL,
		  PRIMARY KEY (hash),
		  KEY idx_height (height),
		  KEY idx_type (type),
		  KEY idx_from_address (from_address),
		  KEY idx_to_address (to_address)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`
	if _, err := r.db.ExecContext(ctx, query); err != nil {
		return errors.Wrap(err, "transactionsRepo.createTransactionsSchema")
	}

	return nil
}

func (r *transactionsRepo) createTxClaimSchema(ctx context.Context) error {
	query := `
		CREATE TABLE tx_claim (
		  hash char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
		  chain char(4) COLLATE utf8mb4_unicode_ci NOT NULL,
		  app_public_key char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
		  session_height int(11) NOT NULL,
		  total_proofs int(11) NOT NULL,
		  evidence_type tinyint(128) NOT NULL,
		  expiration_height int(11) NOT NULL,
		  PRIMARY KEY (hash),
		  KEY idx_chain (chain)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`
	if _, err := r.db.ExecContext(ctx, query); err != nil {
		return errors.Wrap(err, "transactionsRepo.createTxClaimSchema")
	}

	return nil
}

func (r *transactionsRepo) createTxProofSchema(ctx context.Context) error {
	query := `
		CREATE TABLE tx_proof (
		  hash char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
		  app_pub_key char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
		  client_pub_key char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
		  servicer_pub_key char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
		  blockchain char(4) COLLATE utf8mb4_unicode_ci NOT NULL,
		  request_hash char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
		  session_height int(11) NOT NULL,
		  PRIMARY KEY (hash),
		  KEY idx_blockchain (blockchain),
		  KEY idx_app_pub_key (app_pub_key),
		  KEY idx_session_height (session_height),
		  KEY idx_servicer_pub_key (servicer_pub_key)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`
	if _, err := r.db.ExecContext(ctx, query); err != nil {
		return errors.Wrap(err, "transactionsRepo.createTxProofSchema")
	}

	return nil
}

func (r *transactionsRepo) createTxStakeSchema(ctx context.Context) error {
	query := `
		CREATE TABLE tx_stake (
		  hash char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
		  amount bigint(20) unsigned NOT NULL,
		  chains json DEFAULT NULL,
		  pub_key_type varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
		  pub_key_value char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
		  service_url varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
		  PRIMARY KEY (hash),
		  KEY idx_pub_key_value (pub_key_value)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`
	if _, err := r.db.ExecContext(ctx, query); err != nil {
		return errors.Wrap(err, "transactionsRepo.createTxStakeSchema")
	}

	return nil
}

func (r *transactionsRepo) dropTransactionsSchemaIfExists(ctx context.Context) error {
	query := `
		DROP TABLE IF EXISTS transactions
	`
	if _, err := r.db.ExecContext(ctx, query); err != nil {
		return errors.Wrapf(err, "transactionsRepo.DropSchemaIfExists")
	}

	return nil
}

func (r *transactionsRepo) dropTxProofSchemaIfExists(ctx context.Context) error {
	query := `
		DROP TABLE IF EXISTS tx_proof
	`
	if _, err := r.db.ExecContext(ctx, query); err != nil {
		return errors.Wrapf(err, "transactionsRepo.dropTxProofSchemaIfExists")
	}

	return nil
}

func (r *transactionsRepo) dropTxClaimSchemaIfExists(ctx context.Context) error {
	query := `
		DROP TABLE IF EXISTS tx_claim
	`
	if _, err := r.db.ExecContext(ctx, query); err != nil {
		return errors.Wrapf(err, "transactionsRepo.dropTxClaimSchemaIfExists")
	}

	return nil
}

func (r *transactionsRepo) dropTxStakeSchemaIfExists(ctx context.Context) error {
	query := `
		DROP TABLE IF EXISTS tx_stake
	`
	if _, err := r.db.ExecContext(ctx, query); err != nil {
		return errors.Wrapf(err, "transactionsRepo.dropTxStakeSchemaIfExists")
	}

	return nil
}
