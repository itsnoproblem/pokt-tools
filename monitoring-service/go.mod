module monitoring-service

go 1.18

require (
	git.mills.io/prologic/bitcask v1.0.2
	github.com/go-kit/kit v0.12.0
	github.com/gorilla/mux v1.8.0
	github.com/oklog/oklog v0.3.2
	gopkg.in/errgo.v2 v2.1.0
)

require (
	github.com/abcum/lcp v0.0.0-20201209214815-7a3f3840be81 // indirect
	github.com/go-kit/log v0.2.0 // indirect
	github.com/go-logfmt/logfmt v0.5.1 // indirect
	github.com/gofrs/flock v0.8.0 // indirect
	github.com/oklog/run v1.1.0 // indirect
	github.com/pkg/errors v0.9.1 // indirect
	github.com/plar/go-adaptive-radix-tree v1.0.4 // indirect
	github.com/sirupsen/logrus v1.8.1 // indirect
	golang.org/x/exp v0.0.0-20200228211341-fcea875c7e85 // indirect
	golang.org/x/sys v0.0.0-20210917161153-d61c044b1678 // indirect
)

replace github.com/itsnoproblem/pokt-calculator/api v0.0.0 => ../api
