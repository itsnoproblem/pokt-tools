package pocket

type paramRequest struct {
	Key    string `json:"key"`
	Height int64  `json:"height"`
}

type paramResponse struct {
	Key   string `json:"param_key"`
	Value string `json:"param_value"`
}
