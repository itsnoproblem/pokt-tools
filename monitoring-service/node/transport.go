package node

import (
	"context"
	"errors"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/itsnoproblem/pokthud/api"
)

const (
	transactionEndpointPath         = "/transactions/{hash}"
	accountTransactionsEndpointPath = "/accounts/{address}/transactions"
)

type transport struct {
	Service Service
	Routes  []api.Route
}

func NewTransport(svc Service) transport {
	return transport{
		Service: svc,
		Routes: []api.Route{
			{
				Method:   http.MethodGet,
				Path:     transactionEndpointPath,
				Endpoint: TransactionEndpoint(svc),
				Decoder:  decodeTransactionRequest,
				Encoder:  api.EncodeResponse,
			},
			{
				Method:   http.MethodGet,
				Path:     accountTransactionsEndpointPath,
				Endpoint: AccountTransactionsEndpoint(svc),
				Decoder:  decodeAccountTransactionsRequest,
				Encoder:  api.EncodeResponse,
			},
		},
	}
}

func decodeTransactionRequest(_ context.Context, req *http.Request) (request interface{}, err error) {
	vars := mux.Vars(req)
	hash, ok := vars["hash"]
	if !ok {
		return nil, errors.New("decodeTransactionRequest: required param 'hash' not found")
	}

	return transactionRequest{Hash: hash}, nil
}

func decodeAccountTransactionsRequest(_ context.Context, req *http.Request) (request interface{}, err error) {
	vars := mux.Vars(req)
	address, ok := vars["address"]
	if !ok {
		return nil, errors.New("decodeTransactionRequest: required param 'address' not found")
	}

	return accountTransactionsRequest{Address: address}, nil
}
