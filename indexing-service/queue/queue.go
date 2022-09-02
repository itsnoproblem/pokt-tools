package queue

import (
	"encoding/json"
	"strings"
	"time"

	"github.com/go-redis/redis"
	"github.com/pkg/errors"
)

const (
	BlocksQueue = "blockHeightsToProcess"
	ParamsQueue = "paramHeightsToProcess"
	NodesQueue  = "nodeHeightsToProcess"
)

type queue struct {
	redisClient *redis.Client
}

func New(c *redis.Client) queue {
	return queue{
		redisClient: c,
	}
}

func (q queue) AddMessage(queueName string, messages ...interface{}) error {
	if err := q.redisClient.RPush(queueName, messages...).Err(); err != nil {
		return errors.Wrap(err, "queue.AddMessage")
	}

	return nil
}

func (q queue) NextMessage(queueName string, target interface{}) error {
	result, err := q.redisClient.BLPop(0*time.Second, queueName).Result()
	if err != nil {
		return errors.Wrap(err, "queue.NextMessage")
	}

	err = json.NewDecoder(strings.NewReader(string(result[1]))).Decode(&target)
	if err != nil {
		return errors.Wrap(err, "queue.NextMessage")
	}

	return nil
}
