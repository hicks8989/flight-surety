import Config from './config.json';
import express from 'express';
import { flightSuretyData, flightSuretyApp, web3 } from './instance';
require("babel-core/register");
require("babel-polyfill");
let config = Config['localhost'];
let defaultAccount = web3.eth.defaultAccount;
let appAddress = config.appAddress;
let accounts = [];
let oracles = {};


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
    await web3.eth.getAccounts();
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
      oracles[i] = accounts[indexes];
    }
  } catch(e) {
    console.log("Unable to register oracles:", e);
  }
}

// Create a function to register a new oracle:
const registerOracle = async (address) => {
  try {
    await flightSuretyApp.methods.registerOracle.send({
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
    const indexes = await flightSuretyApp.methods.getMyIndexes.call({
      from: address,
      gas: 500000
    });

    return indexes;
  } catch(e) {
    console.log("Errors getting oracle indexes")
  }
}

flightSuretyApp.events.OracleRequest({
  fromBlock: 0
}, function (error, event) {
  if (error) console.log(error)
  console.log(event)
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
