# vor-ui

## VOR Randomness Portal Contract Addresses

**Mainnet**: TBD  
**Rinkeby**: [0xE0a19E5F0b0393E32BAf295D6e32Ea5786D26E4b](https://rinkeby.etherscan.io/address/0xE0a19E5F0b0393E32BAf295D6e32Ea5786D26E4b#contracts)  

## Install project

Install the Node packages and dependencies

```
npm run install
````

## Running project

Migrate the database

```
npm run db:migrate
```

Run the service
```
npm run service
```

Run the frontend UI
```
npm run start
```

## Development envirionment

A self-contained VOR Portal development environment is available via Docker Compose. 
The environment includes:

- Ganache CLI private EVM chain
- Compiled & deployed Mock ERC20 and VORCoordinator smart contracts
- All 20 Ganache accounts pre-loaded with Mock ERC20 tokens and ETH
- Fully configured, registered and running VOR Oracle service
- VOR Portal & Explorer with code mounted as volumes
- Postgres container for VOR Explorer DB during development session

### Configure the dev environment

Configuration requirements before running the development environment:

1. Copy the `.env.local` example to `.env`
2. Edit `.env` - search for and set values for the following:

- `REACT_APP_BLOCKNATIVE_API_KEY` (register with https://www.blocknative.com/onboard to get App ID)
- `PIN_APIKEY` (register with https://pinata.cloud/)
- `PIN_SECRETAPIKEY` (register with https://pinata.cloud/)

**Note:** `REACT_APP_XYDistribution_ADDRESS` is intentionally left blank, as it will be auto-filled
by scripts during composition initialisation.

3. Edit your `/etc/hosts` and add:

```bash
127.0.0.1     vor-ui-dev
127.0.0.1     vor-ui-dev-api
```

### Run the dev environment

Bring the composition up using the make target:

```bash
make dev-up
```

The VOR Explorer & Portal will be available on http://vor-ui-dev:5000

Connect MetaMask to the running Ganache CLI node on http://127.0.0.1:8545 and import
one or more of the private keys from the "Ganache CLI wallet mnemonic" outlined below 
(recommend any account between 2 - 19. Accounts 0 and 1 are reserved for contract 
deployment and running the VOR Oracle respectively)

A DB Explorer is also available via http://localhost:8081

The `service` and `front` directories are both mounted as read-only volumes in the `vor-ui`
container. Therefore, any modifications to the code will be hot-reloaded automatically 
within the container.

Take the composition down using the make target:

```bash
make dev-down
```

### Composition logs

Container logs are streamed to `./logs/log.txt`. Individual container logs can be extracted
by running:

```bash
make logs
```

Output will be saved to `./logs/[container-name].txt`

### Pre-configured values

The development VOR environment has been pre-configured with the following:

- Ganache CLI wallet mnemonic: `myth like bonus scare over problem client lizard pioneer submit female collect`
- Ganache CLI URL: `http://127.0.0.1:8545`
- Ganache CLI Network/Chain ID: `696969`
- Mock xFUND ERC20 address: `0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab`
- VORCoordinator Contract address: `0xCfEB869F69431e42cdB54A4F4f105C19C080A601`
- BlockHashStore contract address: `0x5b1869D9A4C187F2EAa108f3062412ecf0526b24`
- VOR Oracle Wallet Address: `0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0` (account #1)
- VOR Oracle KeyHash: `0x1a7a24165e904cb38eb8344affcf8fdee72ac11b5c542428b35eef5769c409f0`
