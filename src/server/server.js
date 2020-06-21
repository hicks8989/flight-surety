import Config from './config.json';
import express from 'express';
import { router } from './routes';
import { registerOracles } from './controllers/oracle';
import { flightSuretyData, web3 } from './instance';

let config = Config['localhost'];

let defaultAccount = web3.eth.defaultAccount;
let appAddress = config.appAddress;


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

const app = express();

app.use("/api", router);

// register initial oracles:
registerOracles();

// Authorize the app contract:
authorizeContract();

export default app;
