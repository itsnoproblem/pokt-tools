package main

import (
	"context"
	"database/sql"
	"flag"
	"log"
	"sync"
	"time"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/param"

	"github.com/go-redis/redis"

	_ "github.com/go-sql-driver/mysql"
	"github.com/pokt-foundation/pocket-go/provider"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/block"
	"github.com/itsnoproblem/pokt-calculator/indexing-service/mysql"
)

const (
	//rpcURL = "https://mainnet.gateway.pokt.network/v1/lb/61d4a60d431851003b628aa8"
	rpcURL           = "http://backend.pokt.tools:8888"
	maxDBConnections = 20
	batchSize        = 8
)

var wg sync.WaitGroup

func main() {
	createSchema := flag.Bool("resetSchema", false, "set to true to create the DB schema (will drop if already exists)")
	flag.Parse()

	redisClient := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})

	ctx := context.Background()
	db, err := sql.Open("mysql", "root@tcp(127.0.0.1:3306)/pokt_tools?parseTime=true")
	if err != nil {
		log.Fatalf(">>> error - failed to open DB: %+v\n", err)
	}
	defer db.Close()

	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(maxDBConnections)
	db.SetMaxIdleConns(maxDBConnections)

	if err = db.Ping(); err != nil {
		log.Fatalf(">>> error - ping failed: %+v", err)
	}
	log.Println("DB Ping Success")

	blocksRepo := mysql.NewBlocksRepo(db)
	paramsRepo := mysql.NewParamsRepo(db)
	transactionsRepo := mysql.NewTransactionsRepo(db)

	if *createSchema {
		log.Println("***** Resetting Schema *****")

		if _, err = redisClient.FlushDB().Result(); err != nil {
			log.Fatalf(">>> error - failed to flush redis DB")
		}

		if err = blocksRepo.DropSchemaIfExists(ctx); err != nil {
			log.Fatalf(">>> error - blocksRepo drop schema failed: %+v", err)
		}

		if err = paramsRepo.DropSchemaIfExists(ctx); err != nil {
			log.Fatalf(">>> error - paramsRepo drop schema failed: %+v", err)
		}

		if err = transactionsRepo.DropSchemaIfExists(ctx); err != nil {
			log.Fatalf(">>> error - transactionsRepo drop schema failed: %+v", err)
		}

		if err = blocksRepo.CreateSchema(ctx); err != nil {
			log.Fatalf(">>> error - blocksRepo createSchema failed: %+v", err)
		}
		log.Println("Created schema for blocksRepo")

		if err = paramsRepo.CreateSchema(ctx); err != nil {
			log.Fatalf(">>> error - paramsRepo createSchema failed: %+v", err)
		}
		log.Println("Created schema for paramsRepo")

		if err = transactionsRepo.CreateSchema(ctx); err != nil {
			log.Fatalf(">>> error - transactionsRepo createSchema failed: %+v", err)
		}
		log.Println("Created schema for transactionsRepo")
	}

	pocketProvider := provider.NewProvider(rpcURL, nil)
	pocketProvider.UpdateRequestConfig(3, 30*time.Second)

	blockService := block.NewService(pocketProvider)
	blockService = block.ServiceWithCache(&blockService, &blocksRepo)

	paramService := param.NewService(pocketProvider)
	paramService = param.ServiceWithCache(&paramService, &paramsRepo)

	height, err := blockService.Height(ctx)
	if err != nil {
		log.Fatalf("ERROR: %+v", err)
	}

	allBlocks, err := blockService.AllBlocks(ctx)
	if err != nil {
		log.Fatalf("ERROR: %+v", err)
	}
	log.Printf("Loaded %d cached blocks", len(allBlocks))

	allParams, err := paramService.AllParams(ctx)
	if err != nil {
		log.Fatalf("ERROR: %+v", err)
	}
	log.Printf("Loaded %d cached params", len(allParams))

	for h := height; h > 0; h-- {

		_, blockExists := allBlocks[h]
		_, paramsExist := allParams[h]

		if !blockExists {
			err = redisClient.RPush("blocksToProcess", h).Err()
			if err != nil {
				log.Fatalf(err.Error() + "\r\n")
			} else {
				log.Printf("Block height %d queued for processing\r\n", h)
			}
		}

		if !paramsExist {
			err = redisClient.RPush("paramsToProcess", h).Err()
			if err != nil {
				log.Fatalf(err.Error() + "\r\n")
			} else {
				log.Printf("Params height %d queued for processing\r\n", h)
			}
		}

		//blockTransactions, err :=
	}

}
