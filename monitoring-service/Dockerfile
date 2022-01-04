FROM golang:1.14

COPY . /app

ENV LISTEN="localhost:7890"
WORKDIR /app
RUN go mod download
RUN go build ./cmd/monitoringsrvweb

CMD ["go", "run", "./cmd/monitoringsrvweb"]