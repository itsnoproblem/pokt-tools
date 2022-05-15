package pocket

import "time"

type Block struct {
	Height          int
	Time            time.Time
	ProposerAddress string
}
