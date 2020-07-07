import Config from './config.json';
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import express from 'express';
import Web3 from 'web3';

require("babel-core/register");
require("babel-polyfill");

// Configuration:
let config = Config['localhost'];

// Web3:
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
let defaultAccount = web3.eth.defaultAccount;

// FlightSuretyApp contract:
let appAddress = config.appAddress;
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, appAddress);

// FlightSuretyData contract:
let dataAddress = config.dataAddress;
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, dataAddress);

let accounts = [];
let oracles = {};
let flights = {};


const authorizeContract = async () => {
  try {
    flightSuretyData.methods.authorizeContract(appAddress).call({
      from: defaultAccount,
      gas: 300000
    });
  } catch(e) {
    console.log("Error authorizing contract", e);
  }
}

// Function to get accounts:
const getAccounts = async () => {
  try {
    return await web3.eth.getAccounts();
  } catch(e) {
    console.log("Errors getting accounts", e);
  }
}

// Function to register oracles on deployment:
const registerOracles = async () => {
  try {
    // Get the required accounts:
    accounts = await getAccounts();

    // Register the oracle accounts:
    for (let i = 0; i < accounts.length; i++) {
      await registerOracle(accounts[i]);

      // Get the indexes:
      const indexes = await getMyIndexes(accounts[i]);
      oracles[accounts[i]] = indexes;
    }
  } catch(e) {
    console.log("Unable to register oracles:", e);
  }
}

// Create a function to register a new oracle:
const registerOracle = async (address) => {
  try {
    await flightSuretyApp.methods.registerOracle().send({
      from: address,
      value: web3.utils.toWei('1', 'ether'),
      gas: 3000000
    }, (err, res) => {
      if (err) {
        console.log("Error registering oracle:", err);
      }
    });
  } catch(e) {
    console.log("Unable to register oracle:", e);
  }
}

// function to get oracle indexes:
const getMyIndexes = async (address) => {
  try {
    const indexes = await flightSuretyApp.methods.getMyIndexes().call({
      from: address,
      gas: 500000
    });

    return indexes;
  } catch(e) {
    console.log("Errors getting oracle indexes")
  }
}

flightSuretyApp.events.FlightStatusInfo({
  fromBlock: 0
}, function (error, event) {
  if (error) {
    console.log(error);
  } else {
    flights[event.returnValues.flight] = event.returnValues.statusCode;
    console.log(`Flight ${event.returnValues.flight} update: ${event.returnValues.status}`);
  }
})

flightSuretyApp.events.OracleRequest({
  fromBlock: 0
}, async function (error, event) {
  if (error) {
    console.log(error);
  } else {
    const { index, airline, flight, timestamp } = event.returnValues;

    // Get a random status code:
    const statusCode = Math.ceil(Math.random() * 5) * 10;

    for (let oracle in oracles) {
      if (flights[flight] != 0) {
        return;
      }
      if (oracles[oracle].includes(index)) {

        try {
          await flightSuretyApp.methods.submitOracleResponse(index, airline, flight, timestamp, statusCode).send({
            from: oracle,
            gas: 500000
          });
        } catch(e) {
          console.log(e);
        }
      }
    }
  }
});

const app = express();

app.get("/api", (req, res) => {
  res.status(200).send({
    message: "An API for use with your Dapp!"
  });
});

// register initial oracles:
registerOracles();

// Authorize the app contract:
authorizeContract();

export default app;
