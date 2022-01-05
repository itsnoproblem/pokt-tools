# POKT Calculator Monitoring Service

This service queries the Pocket Network to retrieve data about nodes, transactions and blocks.
It uses a disk-based store ([Bitcask](https://git.mills.io/prologic/bitcask)) to cache a mapping of block heights to block times.  
The cached data included in `.pokt-calculator-db` contains block times up to the latest block at the time of writing.
The service will cache new blocks as they are encountered.  


To start the service
*(all flags are optional)*:
```bash
go run ./cmd/monitoringsrvweb -listen=127.0.0.1:7878 -dbPath=../.pokt-calculator-db -pocketURL=https://your-node.xyz:443/v1
```

With the monitoring-service running, you can optionally update the cache to the latest block using the Block Time Fetcher:

```bash
go run ./cmd/blocktimefetcher -rpcHost=127.0.0.1:7878
```