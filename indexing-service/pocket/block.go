package pocket

import "time"

type Block struct {
	ID              string
	Height          int
	Time            time.Time
	ProposerAddress string
	NumTxs          int
}
