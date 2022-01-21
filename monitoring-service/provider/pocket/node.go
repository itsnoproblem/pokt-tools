package pocket

type queryNodeRequest struct {
	Address string `json:"address"`
}

type queryNodeResponse struct {
	Address       string   `json:"address"`
	Pubkey        string   `json:"public_key"`
	Chains        []string `json:"chains"`
	IsJailed      bool     `json:"jailed"`
	ServiceURL    string   `json:"service_url"`
	StakedBalance string   `json:"tokens"`
}

type chainResponse struct {
	Name string `json:"name"`
	ID   string `json:"id"`
}

type balanceRequest struct {
	Address string `json:"address"`
}

type balanceResponse struct {
	Balance uint `json:"balance"`
}
