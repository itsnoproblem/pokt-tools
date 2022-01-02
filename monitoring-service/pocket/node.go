package pocket

import "time"

type Node struct {
	Address           string
	Balance           uint
	StakedBalance     string
	IsJailed          bool
	Chains            []Chain
	IsSynced          bool
	LatestBlockHeight uint
	LatestBlockTime   time.Time
}
