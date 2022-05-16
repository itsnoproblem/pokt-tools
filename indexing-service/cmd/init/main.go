package main

import (
	"context"
	"database/sql"
	"flag"
	"log"
	"sync"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/pokt-foundation/pocket-go/provider"

	"github.com/itsnoproblem/pokt-calculator/indexing-service/block"
	"github.com/itsnoproblem/pokt-calculator/indexing-service/mysql"
)

const (
	rpcURL = "https://node-000.ocean1.pokt.tools"
	//rpcURL           = "https://mainnet.gateway.pokt.network/v1/lb/61d4a60d431851003b628aa8"
	maxDBConnections = 50
	batchSize        = 25
)

var wg sync.WaitGroup

func main() {
	createSchema := flag.Bool("dropAndCreate", false, "set to true to create the blocks table (will drop if already exists)")
	flag.Parse()

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

	if *createSchema {
		if err = blocksRepo.DropSchemaIfExists(ctx); err != nil {
			log.Fatalf(">>> error - blocksRepo drop schema failed: %+v", err)
		}

		if err = blocksRepo.CreateSchema(ctx); err != nil {
			log.Fatalf(">>> error - blocksRepo createSchema failed: %+v", err)
		}
		log.Println("Created schema for blocksRepo")
	}

	pocketProvider := provider.NewProvider(rpcURL, nil)
	blockService := block.NewService(pocketProvider)
	blockService = block.ServiceWithCache(&blockService, &blocksRepo)

	height, err := blockService.Height(ctx)
	if err != nil {
		log.Fatalf("ERROR: %+v", err)
	}

	allBlocks, err := blockService.AllBlocks(ctx)
	if err != nil {
		log.Fatalf("ERROR: %+v", err)
	}
	log.Printf("Loaded %d cached blocks", len(allBlocks))

	for h := height; h > 0; h-- {
		wg.Add(batchSize)
		for i := 0; i < batchSize; i++ {
			go func(h int) {
				defer wg.Done()
				blk, exists := allBlocks[h]
				if exists {
					//log.Printf("Already have block %d - %s", h, blk.Time.String())
					return
				}

				//log.Printf("Syncing block height %d", h)
				blk, err := blockService.Block(context.Background(), h)
				if err != nil {
					log.Printf(">>> error: %+v", err)
					return
				}

				log.Printf("Saved block height %d time %s:", blk.Height, blk.Time.String())
			}(h)
			h = h - 1
		}
		wg.Wait()
	}

}
