FROM golang:1.14

WORKDIR /app
COPY go.mod .
COPY go.sum .
RUN go mod download

ENV LISTEN "localhost:7890"
ENV DBPATH "/db"
ENV POCKET_URL "https://mainnet.gateway.pokt.network/v1/lb/61d4a60d431851003b628aa8/v1"

COPY . /app
RUN go build -o /app/monitoringsrvweb ./cmd/monitoringsrvweb

CMD ["/bin/sh", "-c", "/app/monitoringsrvweb -listen=$LISTEN -dbPath=$DBPATH -pocketURL=$POCKET_URL"]