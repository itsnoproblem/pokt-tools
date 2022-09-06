package pocket

import "fmt"

type Params struct {
	RelaysToTokensMultiplier             float64
	ServicerStakeWeightMultiplier        float64
	ServicerStakeFloorMultiplier         float64
	ServicerStakeFloorMultiplierExponent float64
	ServicerStakeWeightCeiling           float64
	DaoAllocation                        uint8
	ProposerPercentage                   uint8
	ClaimExpirationBlocks                uint
}

type AllParams struct {
	AppParams    ParamGroup `json:"app_params"`
	AuthParams   ParamGroup `json:"auth_params"`
	GovParams    ParamGroup `json:"gov_params"`
	NodeParams   ParamGroup `json:"node_params"`
	PocketParams ParamGroup `json:"pocket_params"`
}

func (a AllParams) Validate() error {
	if a.AppParams == nil || len(a.AppParams) == 0 {
		return fmt.Errorf("app_params is empty")
	}

	if a.AuthParams == nil || len(a.AuthParams) == 0 {
		return fmt.Errorf("auth_params is empty")
	}

	if a.GovParams == nil || len(a.GovParams) == 0 {
		return fmt.Errorf("gov_params is empty")
	}

	if a.NodeParams == nil || len(a.NodeParams) == 0 {
		return fmt.Errorf("node_params is empty")
	}

	if a.PocketParams == nil || len(a.PocketParams) == 0 {
		return fmt.Errorf("pocket_params is empty")
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

func (p Params) LegacyPoktPerRelay() float64 {
	return (p.RelaysToTokensMultiplier / 1000000) * (float64(100-p.DaoAllocation-p.ProposerPercentage) / 100)
}
