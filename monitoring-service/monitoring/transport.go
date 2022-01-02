package monitoring

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/itsnoproblem/pokthud/api"
)

const (
	transactionEndpointPath         = "/transactions/{hash}"
	nodeEndpointPath                = "/node/{address}"
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
			{
				Method:   http.MethodGet,
				Path:     nodeEndpointPath,
				Endpoint: NodeEndpoint(svc),
				Decoder:  decodeNodeRequest,
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

func decodeAccountTransactionsRequest(ctx context.Context, req *http.Request) (request interface{}, err error) {
	vars := mux.Vars(req)
	address, ok := vars["address"]
	if !ok {
		return nil, errors.New("decodeTransactionRequest: required param 'address' not found")
	}

	var page uint64
	reqPage := req.URL.Query().Get("page")
	if reqPage != "" {
		page, err = strconv.ParseUint(reqPage, 10, 32)
		if err != nil {
			return nil, fmt.Errorf("decodeAccountTransactionsRequest: %s", err)
		}
	}

	var perPage uint64
	reqPerPage := req.URL.Query().Get("per_page")
	if reqPerPage != "" {
		perPage, err = strconv.ParseUint(reqPerPage, 10, 32)
		if err != nil {
			return nil, fmt.Errorf("decodeAccountTransactionsRequest: %s", err)
		}
	}

	sort := req.URL.Query().Get("sort")
	if sort == "" {
		sort = "asc"
	}

	return accountTransactionsRequest{
		Address: address,
		Page:    uint(page),
		PerPage: uint(perPage),
		Sort:    sort,
	}, nil
}

func decodeNodeRequest(_ context.Context, req *http.Request) (request interface{}, err error) {
	vars := mux.Vars(req)
	address, ok := vars["address"]
	if !ok {
		return nil, errors.New("decodeNodeRequest: required param 'address' not found")
	}

	return nodeRequest{Address: address}, nil
}
