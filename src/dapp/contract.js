import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import { ethers } from 'ethers';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress, config.dataAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.flights = [];
        this.flight = null;

        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts(async (error, accts) => {

            this.owner = accts[0];

            let counter = 1;

            this.airlines = await this.flightSuretyApp.methods.getRegisteredAirlines.call();
            this.flights = await this.flightSuretyApp.methods.getAllFlights.call();

            if (this.flights.length > 0) {
                this.flight = this.flights[0];
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    async registerAirline(airline, name, callback) {
        let self = this;
        name = ethers.utils.formatBytes32String(name);
        await self.flightSuretyApp.methods.registerAirline(airline, name).send({
            from: self.owner
        }, callback);
    }

    async payAirline(airline, value, callback) {
        let self = this;
        await self.flightSuretyApp.methods.payAirline(airline).send({
            from: self.owner,
            value: self.web3.utils.toWei(value, "ether")
        }, callback);
    }

    async getPassengerBalance(callback) {
        let self = this;

        self.balance = await self.flightSuretyApp.methods.getPassengerBalance().send({
            from: self.owner
        }, callback);
    }

    async buy(flight, value, callback) {
        let self = this;

        await self.flightSuretyApp.methods.buy(flight).send({
            from: self.owner,
            value: self.web3.utils.toWei(value, "ether")
        }, callback);
    }

    async withdraw(value, callback) {
        let self = this;

        await self.flightSuretyApp.methods.withdraw().send({
            from: self.owner,
            value: self.web3.utils.toWei(value, "ether")
        }, callback);
    }

    async registerFlight(flight, timestamp, callback) {
        flight = ethers.utils.formatBytes32String(flight);
        timestamp = Number(new Date(timestamp));

        await self.flightSuretyApp.methods.registerAirline(flight, timestamp).send({
            from: self.owner
        }, callback);
    }

    async getFlight(flight, callback) {
        let self = this;
        flight = ethers.utils.formatBytes32String(flight);

        self.flight = await self.flightSuretyApp.methods.getFlight(flight, callback);
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        }
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }
}