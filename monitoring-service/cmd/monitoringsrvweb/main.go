package main

import (
	"flag"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"git.mills.io/prologic/bitcask"

	"github.com/go-kit/kit/log"
	"github.com/oklog/oklog/pkg/group"

	"monitoring-service/api"
	"monitoring-service/db"
	"monitoring-service/monitoring"
	"monitoring-service/provider/pocket"
)

const (
	defaultPort = "7878"
	defaultHost = "localhost"
	defaultPocketURL = "https://mainnet.gateway.pokt.network/v1/lb/61d4a60d431851003b628aa8/v1"
)

func main() {
	logger := log.NewLogfmtLogger(log.NewSyncWriter(os.Stderr))
	logger = log.With(logger, "ts", log.DefaultTimestampUTC)

	defaultDBPath, err := os.Getwd()
	if err != nil {
		logger.Log("ERROR: failed to get working directory")
		panic(err)
	}

	httpAddr := flag.String("listen", defaultHost+":"+defaultPort, "HTTP listen address")
	dbPath := flag.String("dbPath", defaultDBPath + "/.pokt-calculator-db", "Path to DB data")
	pocketRpcURL := flag.String("pocketURL", defaultPocketURL, "Pocket network RPC URL")
	flag.Parse()

	router := api.NewRouter(logger)

	logger.Log("transport", "HTTP", "MySQL Connect", "Success")

	// accounts
	httpClient := http.Client{}

	// db
	logger.Log("bitcask DB", *dbPath)
	bitcaskDB, err := bitcask.Open(*dbPath)
	if err != nil {
		logger.Log("ERROR opening database")
		panic(err)
	}
	defer func(bitcaskDB *bitcask.Bitcask) {
		err := bitcaskDB.Close()
		if err != nil {
			logger.Log("ERROR closing database")
		}
	}(bitcaskDB)
	blockTimesRepo := db.NewBlockTimesRepo(bitcaskDB)
	pocketProvider := pocket.NewPocketProvider(httpClient, *pocketRpcURL, blockTimesRepo)
	nodeSvc := monitoring.NewService(pocketProvider)
	//accountsSvc = accounts.NewLoggingService(logger, accountsSvc)
	nodeTransport := monitoring.NewTransport(nodeSvc)
	router.AddRoutes(nodeTransport.Routes)
	//createAccountFixtures(accountsSvc, logger)

	var g group.Group
	{
		// The HTTP listener mounts the Go kit HTTP handler we created.
		httpListener, err := net.Listen("tcp", *httpAddr)
		if err != nil {
			logger.Log("transport", "HTTP", "during", "Listen", "err", err)
			os.Exit(1)
		}
		g.Add(func() error {
			logger.Log("transport", "HTTP", "addr", *httpAddr)
			return http.Serve(httpListener, router.Mux)
		}, func(error) {
			httpListener.Close()
		})
	}
	{
		// This function just sits and waits for ctrl-C.
		cancelInterrupt := make(chan struct{})
		g.Add(func() error {
			c := make(chan os.Signal, 1)
			signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)
			select {
			case sig := <-c:
				return fmt.Errorf("received signal %s", sig)
			case <-cancelInterrupt:
				return nil
			}
		}, func(error) {
			close(cancelInterrupt)
		})
	}
	logger.Log("exit", g.Run())

}

func envString(env, fallback string) string {
	e := os.Getenv(env)
	if e == "" {
		return fallback
	}
	return e
}
