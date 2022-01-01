package transaction

import "time"

type Transaction struct {
	Hash      string
	Height    uint
	Time      time.Time
	Type      string
	ChainID   string
	NumProofs uint
}
