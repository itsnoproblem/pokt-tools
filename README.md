# POKT Calculator

A reward explorer for Pocket Network nodes.

![](doc/rewards-sample.png)

### Quick start

Steps to run pokt-calculator:  

1) check out the repository:

```shell
git clone https://github.com/itsnoproblem/pokt-calculator
```

2) There are 2 environment variables to pay attention to in the `docker-compose.yml` file:
   - `POCKET_URL` - this is the RPC endpoint the monitoring-service will use to query the Pocket Network.
   - `RPC_URL` - This url needs to be accesible by your browser. Most people will want to update the docker-compose file, 
     replacing `http://YOUR-PUBLIC-IP-OR-HOSTNAME:7878` with `http://your.hostname.com:7878`
   
   It is **highly recommended** that you edit `docker-compose.yml` and replace the value of the `POCKET_URL` with your node's RPC URL.
   Eg: `https://your-service-url.com:443/v1` This repo ships with a functioning, free-tier Pocket RPC endpoint, but performance will be limited.

   If you don't want to use your own node, you can get your own pocket network endpoint url by visiting https://www.portal.pokt.network/#1 
   and creating an app on Pocket Network Mainnet. 


3) Start the containers:
```shell
docker-compose up -d
```

Now you can visit the app im your browser at http://127.0.0.1:4444

Happy exploring!