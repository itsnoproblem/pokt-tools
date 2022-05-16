package pocket

const (
	ParamGroupAppParams    = "app_params"
	ParamGroupAuthParams   = "auth_params"
	ParamGroupGovParams    = "gov_params"
	ParamGroupNodeParams   = "node_params"
	ParamGroupPocketParams = "pocket_params"
)

type Param struct {
	Group string
	Key   string
	Value string
}

type ParamsByName map[string]Param

func (p ParamsByName) Get(name string) (Param, bool) {
	param, exists := p[name]
	return param, exists
}

type ParamGroups struct {
	AppParams    ParamsByName
	AuthParams   ParamsByName
	GovParams    ParamsByName
	NodeParams   ParamsByName
	PocketParams ParamsByName
}
