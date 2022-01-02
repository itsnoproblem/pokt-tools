package pocket

import (
	"fmt"
)

type Chain struct {
	ID   string
	Name string
}

var allChains = map[string]string{
	"0003": "Avalanche",
	"00A3": "Avalanche Archival",
	"0004": "Binance Smart Chain",
	"0010": "Binance Smart Chain Archival",
	"0021": "Ethereum",
	"0022": "Ethereum Archival",
	"0028": "Ethereum Archival Trace",
	"0026": "Ethereum Goerli",
	"0024": "Ethereum Kovan",
	"0025": "Ethereum Rinkeby",
	"0023": "Ethereum Ropsten",
	"0005": "FUSE",
	"000A": "FUSE Archival",
	"0040": "Harmony Shard 0",
	"0044": "IoTeX",
	"0001": "Pocket Network",
	"0009": "Polygon",
	"000B": "Polygon Archival",
	"000F": "Polygon Mumbai",
	"0006": "Solana",
	"0027": "xDAI",
	"000C": "xDAI Archival",
}

func ChainFromID(id string) (Chain, error) {
	name, ok := allChains[id]
	if !ok {
		return Chain{}, fmt.Errorf("ChainFromID: unknown chain %s", id)
	}

	return Chain{
		ID:   id,
		Name: name,
	}, nil
}
