package pocket

import "fmt"

type Chain struct {
	ID           string
	Name         string
	PortalPrefix string
	IsMonetized  bool
}

func ChainFromID(id string) (Chain, error) {
	chain, ok := allChains[id]
	if !ok {
		return Chain{}, fmt.Errorf("ChainFromID: unknown chain %s", id)
	}

	return chain, nil
}

var allChains = map[string]Chain{
	"0029": {
		ID:           "0029",
		Name:         "Algorand",
		PortalPrefix: "algorand-mainnet",
		IsMonetized:  true,
	},
	"000D": {
		ID:           "000D",
		Name:         "Algorand Archival",
		PortalPrefix: "algorand-archival",
		IsMonetized:  false,
	},
	"0045": {
		ID:           "0045",
		Name:         "Algorand Testnet",
		PortalPrefix: "algorand-testnet",
		IsMonetized:  false,
	},
	"0A45": {
		ID:           "0A45",
		Name:         "Algorand TestNet Archival",
		PortalPrefix: "algorand-testnet-archival",
		IsMonetized:  false,
	},
	"0030": {
		ID:           "0030",
		Name:         "Arweave",
		PortalPrefix: "arweave-mainnet",
		IsMonetized:  false,
	},
	"0003": {
		ID:           "0003",
		Name:         "Avalanche",
		PortalPrefix: "avax-mainnet",
		IsMonetized:  true,
	},
	"00A3": {
		ID:           "00A3",
		Name:         "Avalanche Archival",
		PortalPrefix: "avax-archival",
		IsMonetized:  true,
	},
	"000E": {
		ID:           "000E",
		Name:         "Avalanche Fuji",
		PortalPrefix: "avax-fuji",
		IsMonetized:  false,
	},
	"0004": {
		ID:           "0004",
		Name:         "Binance Smart Chain",
		PortalPrefix: "bsc-mainnet",
		IsMonetized:  true,
	},
	"0010": {
		ID:           "0010",
		Name:         "Binance Smart Chain Archival",
		PortalPrefix: "bsc-archival",
		IsMonetized:  true,
	},
	"0011": {
		ID:           "0011",
		Name:         "Binance Smart Chain Testnet",
		PortalPrefix: "bsc-testnet",
		IsMonetized:  false,
	},
	"0012": {
		ID:           "0012",
		Name:         "Binance Smart Chain Testnet Archival",
		PortalPrefix: "bsc-testnet-archival",
		IsMonetized:  false,
	},
	"0002": {
		ID:           "0002",
		Name:         "Bitcoin",
		PortalPrefix: "btc-mainnet",
		IsMonetized:  false,
	},
	"0048": {
		ID:           "0048",
		Name:         "Boba",
		PortalPrefix: "boba-mainnet",
		IsMonetized:  true,
	},
	"03DF": {
		ID:           "03DF",
		Name:         "DFKchain Subnet",
		PortalPrefix: "dfk-mainnet",
		IsMonetized:  true,
	},
	"0021": {
		ID:           "0021",
		Name:         "ETH",
		PortalPrefix: "eth-mainnet",
		IsMonetized:  true,
	},
	"0022": {
		ID:           "0022",
		Name:         "Ethereum Archival",
		PortalPrefix: "eth-archival",
		IsMonetized:  true,
	},
	"0028": {
		ID:           "0028",
		Name:         "Ethereum Archival Trace",
		PortalPrefix: "eth-archival-trace",
		IsMonetized:  true,
	},
	"0026": {
		ID:           "0026",
		Name:         "Ethereum Goerli",
		PortalPrefix: "eth-goerli",
		IsMonetized:  true,
	},
	"0024": {
		ID:           "0024",
		Name:         "Ethereum Kovan",
		PortalPrefix: "poa-kovan",
		IsMonetized:  true,
	},
	"0025": {
		ID:           "0025",
		Name:         "Ethereum Rinkeby",
		PortalPrefix: "eth-rinkeby",
		IsMonetized:  true,
	},
	"0023": {
		ID:           "0023",
		Name:         "Ethereum Ropsten",
		PortalPrefix: "eth-ropsten",
		IsMonetized:  true,
	},
	"0046": {
		ID:           "0046",
		Name:         "Evmos",
		PortalPrefix: "evmos-mainnet",
		IsMonetized:  false,
	},
	"0049":{
		ID:           "0049",
		Name:         "Fantom",
		PortalPrefix: "fantom-mainnet",
		IsMonetized:  true,
	},
	"0005": {
		ID:           "0005",
		Name:         "FUSE",
		PortalPrefix: "fuse-mainnet",
		IsMonetized:  true,
	},
	"000A": {
		ID:           "000A",
		Name:         "FUSE Archival",
		PortalPrefix: "fuse-archival",
		IsMonetized:  true,
	},
	"0027": {
		ID:           "0027",
		Name:         "Gnosis Chain",
		PortalPrefix: "gnosischain-mainnet",
		IsMonetized:  true,
	},
	"000C": {
		ID:           "000C",
		Name:         "Gnosis Chain Archival",
		PortalPrefix: "gnosischain-archival",
		IsMonetized:  true,
	},
	"0040": {
		ID:           "0040",
		Name:         "Harmony Shard 0",
		PortalPrefix: "harmony-0",
		IsMonetized:  true,
	},
	"0A40": {
		ID:           "0A40",
		Name:         "Harmony Shard 0 Archival",
		PortalPrefix: "harmony-0-archival",
		IsMonetized:  false,
	},
	"0041": {
		ID:           "0041",
		Name:         "Harmony Shard 1",
		PortalPrefix: "harmony-1",
		IsMonetized:  false,
	},
	"0A41": {
		ID:           "0A41",
		Name:         "Harmony Shard 1 Archival",
		PortalPrefix: "harmony-1-archival",
		IsMonetized:  false,
	},
	"0042": {
		ID:           "0042",
		Name:         "Harmony Shard 2",
		PortalPrefix: "harmony-2",
		IsMonetized:  false,
	},
	"0A42": {
		ID:           "0A42",
		Name:         "Harmony Shard 2 Archival",
		PortalPrefix: "harmony-2-archival",
		IsMonetized:  false,
	},
	"0043": {
		ID:           "0043",
		Name:         "Harmony Shard 3",
		PortalPrefix: "harmony-3",
		IsMonetized:  false,
	},
	"0A43": {
		ID:           "0A43",
		Name:         "Harmony Shard 3 Archival",
		PortalPrefix: "harmony-3-archival",
		IsMonetized:  false,
	},
	"0044": {
		ID:           "0044",
		Name:         "IoTeX",
		PortalPrefix: "iotex-mainnet",
		IsMonetized:  true,
	},
	"0047": {
		ID:           "0047",
		Name:         "OKExChain",
		PortalPrefix: "oec-mainnet",
		IsMonetized:  true,
	},
	"0001": {
		ID:           "0001",
		Name:         "Pocket Network",
		PortalPrefix: "mainnet",
		IsMonetized:  true,
	},
	"0009": {
		ID:           "0009",
		Name:         "Polygon",
		PortalPrefix: "poly-mainnet",
		IsMonetized:  true,
	},
	"000B": {
		ID:           "000B",
		Name:         "Polygon Archival",
		PortalPrefix: "poly-archival",
		IsMonetized:  true,
	},
	"000F": {
		ID:           "000F",
		Name:         "Polygon Mumbai",
		PortalPrefix: "poly-mumbai",
		IsMonetized:  false,
	},
	"00AF": {
		ID:           "00AF",
		Name:         "Polygon Mumbai Archival",
		PortalPrefix: "poly-mumbai-archival",
		IsMonetized:  false,
	},
	"0006": {
		ID:           "0006",
		Name:         "Solana",
		PortalPrefix: "sol-mainnet",
		IsMonetized:  true,
	},
	"0031": {
		ID:           "0031",
		Name:         "Solana Testnet",
		PortalPrefix: "sol-testnet",
		IsMonetized:  false,
	},
}
