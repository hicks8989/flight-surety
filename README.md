# flight-surety
Flight delay insurance managed as a collaboration between airlines that allows passangers to purchase insurance prior to a flight.

This application is currently deployed to the Rinkeby test network. Contract address is [0x150D1eacDd488e3d8fF1254B67fC4C3EE3cd5D87](https://rinkeby.etherscan.io/address/0x150D1eacDd488e3d8fF1254B67fC4C3EE3cd5D87).

## Getting Started
Instructions to get the FlightSurety DAPP installed and running on your local machine.

### Prerequisites
FlightSurety makes use of solidity smart contracts amd the truffle framework.

In order to get this application running on your machine, you will need:

* A [MetaMask](https://metamask.io) account installed on your browser.
* [Truffle](https://trufflesuite.com) installed on your local machine. This can be done using the `npm install` command:

```
> npm install -g truffle
```

* [NodeJS](https://nodejs.org) installed on your local machine.

### Installing
To run a local instance of the project, you must first install project files and dependencies. To get started doing this, use the `git clone` command to clone the repository to your local machine:

```
> git clone https://github.com/hicks8989/flightsurety
```

Next, change to the project root directory:

```
> cd flightsurety
```

Finally, install npm packages and compile solidity smart contracts:

```
> npm install
```

```
> truffle compile
```

### Configuration
In order to get your own instance of the FlightSurety DAPP running, certain configuration variables must be set:

* Create a secret file called `.secret` in the root directory and insert the mnemonic for your metamask account.
* Set the infuraKey variable in the `truffle-config.js` file to your infura project key.

### Running
In order to run the application, use the `truffle develop` command to start a local development environment:

```
> truffle develop
```

Next, use the `migrate --reset` command to run the migrations contract and create local instances of the Data and Application contract in the development environment:

```
truffle (Develop)> migrate --reset
```

In order to run the application on your machine, the client and server must be run seperately.

Instructions for running each are below:

#### Client
The client uses `webpack` to run a local instance of the client on your machine. Upon running webpack, the client should look like this:

![Client Screenshot](https://github.com/hicks8989/flight-surety/blob/dev/screenshots/client.JPG)

In order to run the client, use the `npm run dev` command in a new terminal window:

```
> npm run dev
```

#### Server
The server uses `webpack` to run a local instance of the server on your machine. Upon running webpack, the server should look like this:

![Server Screenshot](https://github.com/hicks8989/flight-surety/blob/dev/screenshots/server.JPG)

In order to run the server, use the `npm run server` command in a new termninal window:

```
> npm run server
```

## Testing
In order to run tests for the project, you will need to:

1. Compile and migrate contracts with the truffle terminal:

```
> truffle compile
```

```
> truffle develop
truffle(develop)> migrate --reset
```

2. Run the truffle test command:

```
truffle(develop)> test
```

There are 18 test cases provided. Upon running the tests, you should get back all 18 passing:

![Test](https://github.com/hicks8989/flight-surety/blob/dev/screenshots/test.JPG)

## Built With
* [Ethereum](https://ethereum.org) - Ethereum is a decentralized platform that runs smart contracts.
* [Truffle](https://trufflesuite.com) - Truffle is the most popular development framework for Ethereum with a mission to make your life a whole lot easier.
* [NodeJS](https://nodejs.org) - Node.js is an open-source, cross-platform, JavaScript runtime environment that executes JavaScript code outside a web browser.
* [Solidity](https://solidity.readthedocs.io/en/v0.6.10/) - Solidity is an object-oriented programming language for writing smart contracts.