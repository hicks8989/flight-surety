
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const { ethers } = require('ethers');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  const airlines = [
    "Oceanic Airlines",
    "American Airlines",
    "JetBlue",
    "Southwest Airlines",
    "Delta Airlines"
  ].map( airline => ethers.utils.formatBytes32String(airline));
  const AIRLINE_FEE = web3.utils.toWei("10", "ether");
  const flights = [
    "815",
    "337",
    "2490",
    "2491"
  ].map( flight => ethers.utils.formatBytes32String(flight));
  const times = [
    "03/01/2020 12:48:38 PM",
    "05/16/2020 01:01:49 AM",
    "01/26/2020 04:21:39 AM",
    "01/13/2020 11:06:16 PM",
    "06/14/2020 07:32:58 PM"
  ].map( time => Number(new Date(time)));

  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address, { from: config.firstAirline });
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

    // Ensure that access is denied for non-Contract Owner account
    let accessDenied = false;
    try
    {
      await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
    }
    catch(e) {
      accessDenied = true;
    }
    assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
    let accessDenied = false;
    try
    {
      await config.flightSuretyData.setOperatingStatus(false, {from: config.firstAirline});
    }
    catch(e) {
      accessDenied = true;
    }
    assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
  });

  it('(airline) can fund an airline', async () => {

    // ACT
    try {
      await config.flightSuretyData.setOperatingStatus(true, {from: config.firstAirline});
      await config.flightSuretyApp.payAirlineFee({
        from: config.firstAirline,
        value: AIRLINE_FEE
      });
    }
    catch(e) {

    }

    let result = await config.flightSuretyApp.getAirline.call(config.firstAirline);
    // ASSERT
    assert(result[2], "Airline should not be able to register another airline if it hasn't provided funding");
  });

  it("(airline) can register an airline if calling airline is funded (less than concensus)", async () => {
    const newAirline = airlines[1];
    let eventEmitted = false;

    try {
      await config.flightSuretyApp.AirlineRegistered((err, res) => {
        eventEmitted = true;
      });
      await config.flightSuretyApp.registerAirline(accounts[2], newAirline, { from: config.firstAirline });
    } catch(e) {

    }

    const result = await config.flightSuretyApp.getAirline.call(accounts[2]);

    assert(result[1], "Airline should be able to register another airline if concensus is not yet met");
    assert(eventEmitted, "Invalid event emitted");
  });

  it("(airline) can not register an airline if concensus is met and it doesn't have 50% of all airline votes", async () => {
    const thirdAirline = airlines[2];
    const fourthAirline = airlines[3];
    const newAirline = airlines[4];

    try {
      await config.flightSuretyApp.registerAirline(accounts[3], thirdAirline, { from: config.firstAirline });
      await config.flightSuretyApp.registerAirline(accounts[4], fourthAirline, { from: config.firstAirline });
      await config.flightSuretyApp.registerAirline(accounts[5], newAirline, {from: config.firstAirline});
    } catch(e) {

    }
    const result = await config.flightSuretyApp.getAirline.call(accounts[5]);
    assert(!result[1], "Airlines should need 50% of votes to register after concensus");
  });

  it("(airline) can register an airline if concensus is met and 50% of registered airlines vote", async () => {
    let eventEmitted = false;
    const newAirline = airlines[4];

    try {
      await config.flightSuretyApp.payAirlineFee({
        from: accounts[3],
        value: AIRLINE_FEE
      });

      await config.flightSuretyApp.AirlineRegistered((err, res) => {
        eventEmitted = true;
      });

      await config.flightSuretyApp.registerAirline(accounts[5], newAirline, {from: accounts[3]});
    } catch(e) {

    }

    const result = await config.flightSuretyApp.getAirline.call(accounts[5]);

    assert(result[1], "Airlines should be able to register another airline if 50% vote");
    assert(eventEmitted, "Invalid event emitted");
  });

  it("(airline) can get an airline by its address", async () => {
    const result = await config.flightSuretyApp.getAirline.call(config.firstAirline);

    assert.equal(result[0], airlines[0], "Invalid airline name");
    assert(result[1], "Invalid airline registration status");
    assert(result[2], "Invalid airline payment status");
  });

  it("(airline) can get registered airlines", async () => {
    const result = await config.flightSuretyData.getRegisteredAirlines.call();

    assert.equal(result[0], config.firstAirline, "Invalid registered airline: 1");
    assert.equal(result[1], accounts[2], "Invalid registered airline: 2");
    assert.equal(result[2], accounts[3], "Invalid registered airline: 3");
    assert.equal(result[3], accounts[4], "Invalid registered airline: 4");
    assert.equal(result[4], accounts[5], "Invalid registered airline: 5");
  });

  it("(flight) can register a flight", async () => {
    let eventEmitted = false;

    try {
      await config.flightSuretyApp.FlightRegistered((err, res) => {
        eventEmitted = true;
      });
      await config.flightSuretyApp.registerFlight(flights[0], times[0], {
        from: config.firstAirline
      });
    } catch(e) {
      console.log(e);
    }

    const result = await config.flightSuretyApp.getFlight.call(flights[0]);

    assert(result[0], "Funded airline should be able to register flight");
    assert(eventEmitted, "Invalid event emitted");
  });

  it("(flight) can get a flight by its name", async () => {
    const result = await config.flightSuretyApp.getFlight.call(flights[0]);

    assert(result[0], "Invalid flight registration");
    assert.equal(result[1], config.firstAirline, "Invalid airline address");
    assert.equal(result[2], flights[0], "Invalid flight name");
    assert(new BigNumber(result[3]).isEqualTo(times[0]), "Invalid timestamp");
    assert(new BigNumber(result[4]).isEqualTo(0), "Invalid status code");
  });

  it("(flight) can get all registered flights", async () => {
    try {
      await config.flightSuretyApp.registerFlight(flights[1], times[1], {
        from: config.firstAirline
      });
      await config.flightSuretyApp.registerFlight(flights[2], times[1], {
        from: config.firstAirline
      })
    } catch(e) {

    }

    const result = await config.flightSuretyApp.getAllFlights.call();

    assert.equal(result[0], flights[0], "Invalid flight: 1");
    assert.equal(result[1], flights[1], "Invalid flight: 2");
    assert.equal(result[2], flights[2], "Invalid flight: 3");
  });

  it("(Insurance) can let a passenger invest in flight insurance", async() => {
    let reverted = false;

    try {
      await config.flightSuretyApp.buy(flights[0], {
        from: accounts[6],
        value: web3.utils.toWei("1", "ether")
      });
    } catch(e) {
      reverted = true;
      console.log(e);
    }

    assert(!reverted, "Invalid insurance purchase");
  });
});