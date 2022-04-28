package pocket

import (
	"time"
)

type Block struct {
	Proposer string
	Time     time.Time
}
