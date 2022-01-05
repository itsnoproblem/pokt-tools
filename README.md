# POKT Calculator

A reward explorer for Pocket Network nodes.

### Quick start

You can run the application with `docker-compose`.  First check out the repository:

```shell
git clone https://github.com/itsnoproblem/pokt-calculator
```

It is **highly recommended** that you edit `docker-compose.yml` and replace the value of the `POCKET_URL` with your node's RPC URL.
(This repo ships with a functioning, free-tier RPC endpoint, but performance will be better if you don't rely on this). 


Then start the containers:
```shell
docker-compose up -d
```

Now you can visit the app im your browser at http://127.0.0.1:4444

Happy exploring!