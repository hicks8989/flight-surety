// =========================================
// Controller for flight
// =========================================

// Import dependencies:
import { flightSuretyApp, web3 } from "../instance";

// Funciton to register flight:
const registerFlight =  ( async (sender, flight, timestamp) => {
  try {
    await flightSuretyApp.methods.registerFlight(flight, timestamp).send({
      from: sender
    });
  } catch(e) {
    console.log("Unable to register flight", e);
  }
});

// Function to get flight:
const getFlight = ( async (flight) => {
  try {
    const flight = await flightSuretyApp.methods.getFlight(flight);
    return flight;
  } catch(e) {
    console.log(e);
  }
});

// Function to get all flights:
const getAllFlights = ( async () => {
  try {
    const flights = await flightSuretyApp.methods.getAllFlights();
  } catch(e) {
    console.log(e);
  }
});

// Function to purchase flight insurance:
const buy = ( async (sender, value, flight) => {
  try {
    await flightSuretyApp.methods.buy(flight).send({
      from: sender,
      value: web3.utils.toWei(value, "ether")
    });
  } catch(e) {
    console.log(e);
  }
});

// Function to withdraw funds:
const withdraw = ( async (sender, value) => {
  try {
    await flightSuretyApp.methods.withdraw(value).send({
      from: sender
    });
  } catch(e) {
    console.log(e);
  }
});

export {
  registerFlight,
  getAllFlights,
  getFlight,
  buy,
  withdraw
}