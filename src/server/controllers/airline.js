// =========================================
// Controller for Airline
// =========================================

// Import Dependencies:
import { flightSuretyApp, web3 } from "../instance";

// Function to register an airline:
const registerAirline = async (sender, address, name) => {
  try {
    await flightSuretyApp.methods.registerAirline(address, name).call({
      from: sender,
      gas: 3000000
    }, (err, res) => {
      if (err) {
        console.log("Error registering airline:", err);
      }
    });
  } catch(e) {
    console.log("Unable to register airline:", e);
  }
}

// Function to pay initial airline fee:
const payAirlineFee = async (sender, value) => {
  try {
    await flightSuretyApp.methods.payAirlineFee.send({
      from: sender,
      value: web3.utils.toWei(value, 'ether'),
      gas: 500000
    }, (err, res) => {
      if (err) {
        console.log("Errors paying airline fee");
      }
    });
  } catch(e) {
    console.log("Errors paying airline fee", e);
  }
}

const getAirline = async (address) => {
  try {
    const airline = await flightSuretyApp.methods.getAirline(address);
    return airline;
  } catch(e) {
    console.log(e);
  }
}

export {
  registerAirline,
  payAirlineFee,
  getAirline,
}