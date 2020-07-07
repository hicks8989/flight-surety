
var Test = require('../config/testConfig.js');
const { ethers, utils } = require("ethers");
const { default: BigNumber } = require('bignumber.js');
//var BigNumber = require('bignumber.js');

contract('Oracles', async (accounts) => {

  const TEST_ORACLES_COUNT = 20;
  var config;
  let flight = ethers.utils.formatBytes32String('ND1309');

  // Watch contract events
  const STATUS_CODE_UNKNOWN = 0;
  const STATUS_CODE_ON_TIME = 10;
  const STATUS_CODE_LATE_AIRLINE = 20;
  const STATUS_CODE_LATE_WEATHER = 30;
  const STATUS_CODE_LATE_TECHNICAL = 40;
  const STATUS_CODE_LATE_OTHER = 50;

  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address, { from: config.firstAirline });

  });


  it('can register oracles', async () => {

    // ARRANGE
    let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();

    // ACT
    for(let a=1; a<TEST_ORACLES_COUNT; a++) {
      await config.flightSuretyApp.registerOracle({ from: accounts[a], value: fee });
      let result = await config.flightSuretyApp.getMyIndexes.call({from: accounts[a]});
      console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
    }
  });

  it('can request flight status', async () => {

    // ARRANGE
    let timestamp = Math.floor(Date.now() / 1000);

    try {
      await config.flightSuretyApp.payAirlineFee({
        from: config.firstAirline,
        value: web3.utils.toWei("10", "ether")
      });

      await config.flightSuretyApp.registerFlight(flight, timestamp, {
        from: config.firstAirline
      });

      await config.flightSuretyApp.buy(flight, {
        from: accounts[1],
        value: web3.utils.toWei("1", "ether")
      });
    } catch(e) {

    }

    // Submit a request for oracles to get status information for a flight
    try {
      await config.flightSuretyApp.fetchFlightStatus(config.firstAirline, flight, timestamp);
    } catch(e) {
    }
    // ACT
    // Since the Index assigned to each test account is opaque by design
    // loop through all the accounts and for each account, all its Indexes (indices?)
    // and submit a response. The contract will reject a submission if it was
    // not requested so while sub-optimal, it's a good test of that feature
    for(let a=1; a<TEST_ORACLES_COUNT; a++) {

      // Get oracle information
      let oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({ from: accounts[a]});
      for(let idx=0;idx<3;idx++) {

        try {
          // Submit a response...it will only be accepted if there is an Index match
          await config.flightSuretyApp.submitOracleResponse(oracleIndexes[idx], config.firstAirline, flight, timestamp, STATUS_CODE_LATE_AIRLINE, { from: accounts[a] });
        }
        catch(e) {
          // Enable this when debugging
          console.log('\nError', idx, oracleIndexes[idx].toNumber(), flight, timestamp);
        }

      }
    }

  });

  it("(Insurance) can credit an insuree", async() => {
    const result = await config.flightSuretyApp.getPassengerBalance.call({
      from: accounts[1]
    });

    assert(new BigNumber(result).isEqualTo(web3.utils.toWei("1.5", "ether")), "Invalid account balance");
  });

  it("(Insurance) can allow a passenger to withdraw credit", async() => {
    try {
      await config.flightSuretyApp.withdraw(web3.utils.toWei("1", "ether"), {
        from: accounts[1]
      });
    } catch(e) {
      console.log(e);
    }

    const result = await config.flightSuretyApp.getPassengerBalance.call({
      from: accounts[1]
    });

    assert(new BigNumber(result).isEqualTo(web3.utils.toWei(".5", "ether")), "Invalid account balance");
  });
});
