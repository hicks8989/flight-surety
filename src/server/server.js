import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
import { router } from './routes';
import { registerOracles } from './controllers/oracle';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let defaultAccount = web3.eth.defaultAccount;
let appAddress = config.appAddress;
let dataAddress = config.dataAddress;
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, dataAddress);

const authorizeContract = async (address) => {
  try {
    flightSuretyData.methods.authorizeContract(appAddress).call({
      from: defaultAccount,
      gas: 300000
    });
  } catch(e) {
    console.log("Error authorizing contract", e);
  }
}

const app = express();

app.use("/api", router);

// register initial oracles:
registerOracles();

// Authorize the app contract:
authorizeContract();

export default app;
