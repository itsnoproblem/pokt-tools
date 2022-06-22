package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/param"

	"github.com/go-redis/redis"
	_ "github.com/go-sql-driver/mysql"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/block"
	"github.com/itsnoproblem/pokt-calculator/indexing-service/mysql"
	"github.com/pokt-foundation/pocket-go/provider"
)

const (
	rpcURL                 = "http://backend.pokt.tools:8888"
	maxDBConnections       = 20
	numBlockFetcherThreads = 5
	numParamFetcherThreads = 5
)

func main() {

	redisClient := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})

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
	paramRepo := mysql.NewParamsRepo(db)

	pocketProvider := provider.NewProvider(rpcURL, nil)
	pocketProvider.UpdateRequestConfig(3, 30*time.Second)

	paramService := param.NewService(pocketProvider)
	paramService = param.ServiceWithCache(&paramService, &paramRepo)

	blockService := block.NewService(pocketProvider)
	blockService = block.ServiceWithCache(&blockService, &blocksRepo)

	var wgBlockFetcher sync.WaitGroup
	var wgParamsFetcher sync.WaitGroup

	for i := 1; i <= numBlockFetcherThreads; i++ {
		wgBlockFetcher.Add(1)

		go func(thread int) {
			defer wgBlockFetcher.Done()
			log.Printf("Starting blockfetcher thread %d...", thread)
			blockFetcher(redisClient, blockService)
		}(i)
	}

	for i := 1; i <= numParamFetcherThreads; i++ {
		wgParamsFetcher.Add(1)

		go func(thread int) {
			defer wgParamsFetcher.Done()
			log.Printf("Starting paramfetcher thread %d...", thread)
			paramsFetcher(redisClient, paramService)
		}(i)
	}

	wgBlockFetcher.Wait()
	wgParamsFetcher.Wait()
}

func blockFetcher(redisClient *redis.Client, blockService block.Service) {
	for {
		ctx := context.Background()
		result, err := redisClient.BLPop(0*time.Second, "blocksToProcess").Result()
		if err != nil {
			log.Fatalf(err.Error())
		}

		var height int64

		err = json.NewDecoder(strings.NewReader(string(result[1]))).Decode(&height)
		if err != nil {
			log.Fatalf(err.Error())
		}

		blk, err := blockService.Block(ctx, int(height))
		if err != nil {
			log.Fatalf("ERROR: %s", err.Error())
		}
		log.Println("Block #" + strconv.Itoa(blk.Height) + " processed successfully.")

	}
}

func paramsFetcher(redisClient *redis.Client, paramService param.Service) {
	for {
		ctx := context.Background()
		var height int64

		result, err := redisClient.BLPop(0*time.Second, "paramsToProcess").Result()
		if err != nil {
			log.Fatalf(err.Error())
		}

		err = json.NewDecoder(strings.NewReader(string(result[1]))).Decode(&height)
		if err != nil {
			log.Fatalf(err.Error())
		}

		params, err := paramService.Params(ctx, int(height))
		if err != nil {
			log.Fatalf("ERROR: %s", err.Error())
		}
		log.Println("Params at block #" + strconv.Itoa(params.Height) + " processed successfully.")

	}
}
