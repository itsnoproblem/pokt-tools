package http

import (
	"fmt"
	"monitoring-service/timer"
	"net/http"

	"github.com/go-kit/kit/log"
)

type Client interface {
	Do(req *http.Request) (*http.Response, error)
}

func NewClientWithLogger(c http.Client, l log.Logger) Client {
	return &ClientWithLogger{
		client: c,
		logger: l,
	}
}

type ClientWithLogger struct {
	client http.Client
	logger log.Logger
}

func (c ClientWithLogger) Do(req *http.Request) (*http.Response, error) {
	logError := func(err error) {
		_ = c.logger.Log("type", "ERROR", "loc", log.Caller(2), "error", fmt.Errorf("clientWithLogger.Do: %s", err))
	}

	t := timer.Start()
	resp, err := c.client.Do(req)
	if err != nil {
		logError(err)
	}

	_ = c.logger.Log("type", "INFO", "url", req.URL.String(), "took", t.Elapsed().String())
	return resp, nil
}

func (c ClientWithLogger) Log(args ...interface{}) error {
	return c.logger.Log(args)
}
