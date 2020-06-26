// =========================================
// File to create single instance of contracts:
// =========================================

// Imports:
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

let config = Config['localhost'];

// Web3:
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];

// FlightSuretyApp contract:
let appAddress = config.appAddress;
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, appAddress);

// FlightSuretyData contract:
let dataAddress = config.dataAddress;
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, dataAddress);

// Export instances:
export {
  flightSuretyApp,
  flightSuretyData,
  web3
}