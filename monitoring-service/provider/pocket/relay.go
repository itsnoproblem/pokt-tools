package pocket

type relayRequest struct {
	RelayNetworkID string              `json:"relay_network_id"`
	Payload        relayRequestPayload `json:"payload"`
}

type relayRequestPayload struct {
	Data    string            `json:"data"`
	Method  string            `json:"method"`
	Path    string            `json:"path"`
	Headers map[string]string `json:"headers"`
}
