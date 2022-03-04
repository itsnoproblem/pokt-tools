package pocket

type Params struct {
	RelaysToTokensMultiplier float64
	DaoAllocation            uint8
	ProposerPercentage       uint8
}

type AllParams struct {
	AppParams    ParamGroup `json:"app_params"`
	AuthParams   ParamGroup `json:"auth_params"`
	GovParams    ParamGroup `json:"gov_params"`
	NodeParams   ParamGroup `json:"node_params"`
	PocketParams ParamGroup `json:"pocket_params"`
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
