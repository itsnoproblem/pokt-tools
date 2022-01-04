FROM golang:1.16-alpine
WORKDIR /app

COPY go.mod ./
COPY go.sum ./

RUN go build ./cmd/monitoringsrvweb

CMD ["go", "run", "./cmd/monitoringsrvweb"]