package pocket

import "fmt"

type Params struct {
	RelaysToTokensMultiplier float64
	DaoAllocation            uint8
	ProposerPercentage       uint8
	ClaimExpirationBlocks    uint
}

type AllParams struct {
	AppParams    ParamGroup `json:"app_params"`
	AuthParams   ParamGroup `json:"auth_params"`
	GovParams    ParamGroup `json:"gov_params"`
	NodeParams   ParamGroup `json:"node_params"`
	PocketParams ParamGroup `json:"pocket_params"`
}

func (a AllParams) Validate() error {
	if a.AppParams == nil {
		return fmt.Errorf("app_params is null")
	}

	if a.AuthParams == nil {
		return fmt.Errorf("auth_params is null")
	}

	if a.GovParams == nil {
		return fmt.Errorf("gov_params is null")
	}

	if a.NodeParams == nil {
		return fmt.Errorf("node_params is null")
	}

	if a.PocketParams == nil {
		return fmt.Errorf("pocket_params is null")
	}

	return nil
}

type ParamGroup []Param

func (a ParamGroup) Get(k string) (string, bool) {
	for _, p := range a {
		if p.Key == k {
			return p.Value, true
		}
	}
	return "", false
}

type Param struct {
	Key   string `json:"param_key"`
	Value string `json:"param_value"`
}

func (p Params) PoktPerRelay() float64 {
	return (p.RelaysToTokensMultiplier / 1000000) * (float64(100-p.DaoAllocation-p.ProposerPercentage) / 100)
}
