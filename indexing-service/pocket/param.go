package pocket

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
	Height       int
	AppParams    ParamsByName
	AuthParams   ParamsByName
	GovParams    ParamsByName
	NodeParams   ParamsByName
	PocketParams ParamsByName
}
