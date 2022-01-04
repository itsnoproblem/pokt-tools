module monitoring-service

go 1.14

require (
	git.mills.io/prologic/bitcask v1.0.2
	github.com/go-kit/kit v0.12.0
	github.com/gorilla/mux v1.8.0
	github.com/itsnoproblem/pokt-calculator/api v0.0.0-00010101000000-000000000000
	github.com/oklog/oklog v0.3.2
	github.com/oklog/run v1.1.0 // indirect
)

replace github.com/itsnoproblem/pokt-calculator/api v0.0.0-00010101000000-000000000000 => ../api
