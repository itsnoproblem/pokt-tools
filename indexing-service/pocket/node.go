package pocket

import "time"

type Node struct {
	Address       string
	Height        uint
	PublicKey     string
	Jailed        bool
	Status        int
	Chains        []string
	ServiceUrl    string
	Tokens        uint64
	UnstakingTime time.Time
	OutputAddress string
}
