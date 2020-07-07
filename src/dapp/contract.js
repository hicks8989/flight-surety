import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import { ethers } from 'ethers';

export default class Contract {
    constructor(network, callback) {

        this.config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.config.url));
        this.initialize(callback);
        this.owner = null;
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, this.config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, this.config.dataAddress);
        this.airlines = [];
        this.flights = [];
        this.passengers = [];
        this.balance = null;
        this.passengers = [];
    }

    async initialize(callback) {
        const accts = await this.web3.eth.getAccounts();

        this.owner = accts[0];

        try {
            this.flightSuretyData.methods.authorizeContract(this.config.appAddress).send({ from: this.owner });
        } catch(e) {
            console.log(e);
        }

        const airlines = [
            "Oceanic Airlines",
            "American Airlines",
            "JetBlue",
            "Southwest Airlines",
            "Delta Airlines"
        ].map( airline => ethers.utils.formatBytes32String(airline));
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

        // Fund the first airline:
        try {
            await this.flightSuretyApp.methods.payAirlineFee()
            .send({
                from: this.owner,
                value: this.web3.utils.toWei("10", "ether"),
                gas: 3000000
            });
        } catch(e) {
            console.log(e);
        }

        // Register Airlines and Flights:
        for (let i = 0; i < 3; i++) {
            try {

                await this.flightSuretyApp.methods.registerAirline(accts[i + 1], airlines[i + 1])
                .send({
                    from: this.owner,
                    gas: 3000000
                });
            } catch(e) {
                console.log(e);
            }

            try {
                await this.flightSuretyApp.methods.payAirlineFee()
                .send({
                    from: accts[i + 1],
                    value: this.web3.utils.toWei("10", "ether"),
                    gas: 3000000
                });
            } catch(e) {
                console.log(e);

            } try {
                await this.flightSuretyApp.methods.registerFlight(flights[i], times[i])
                .send({
                    from: accts[i + 1],
                    gas: 3000000
                });

            } catch(e) {
                console.log(e);
            }
        }

        this.airlines = await this.flightSuretyApp.methods.getRegisteredAirlines().call();
        this.flights = await this.flightSuretyApp.methods.getAllFlights().call();

        let counter = 1;

        while(this.passengers.length < 5) {
            this.passengers.push(accts[counter++]);
        }

        callback();
    }

    async registerAirline(from, airline, name, callback) {
        let self = this;
        name = ethers.utils.formatBytes32String(name);
        await self.flightSuretyApp.methods.registerAirline(airline, name).send({
            from,
            gas: 3000000
        }, callback);
    }

    async getAirline(airline, callback) {
        let self = this;
        return await self.flightSuretyApp.methods.getAirline(airline).call({}, callback);
    }

    async payAirline(from, value, callback) {
        let self = this;
        const walletValue = self.web3.utils.toWei(value, "ether");
        await self.flightSuretyApp.methods.payAirlineFee().send({
            from,
            value: walletValue,
            gas: 3000000
        }, callback);
    }

    async getPassengerBalance(from, callback) {
        let self = this;

        self.balance = await self.flightSuretyApp.methods.getPassengerBalance().call({
            from
        }, callback);
    }

    async buy(from, flight, value, callback) {
        let self = this;

        await self.flightSuretyApp.methods.buy(flight).send({
            from,
            value: self.web3.utils.toWei(value, "ether"),
            gas: 3000000
        }, callback);
    }

    async withdraw(from, value, callback) {
        let self = this;

        await self.flightSuretyApp.methods.withdraw(self.web3.utils.toWei(value, "ether")).send({
            from,
            gas: 3000000
        }, callback);
    }

    async registerFlight(from, flight, timestamp, callback) {
        let self = this;

        flight = ethers.utils.formatBytes32String(flight);
        timestamp = Number(new Date(timestamp));

        await self.flightSuretyApp.methods.registerFlight(flight, timestamp).send({
            from,
            gas: 3000000
        }, callback);
    }

    async getFlight(flight, callback) {
        let self = this;
        flight = ethers.utils.formatBytes32String(flight);

        self.flight = await self.flightSuretyApp.methods.getFlight(flight, callback);
    }

    async isOperational(callback) {
        let self = this;
        await self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner, gas: 3000000 }, callback);

    }

    async fetchFlightStatus(name, callback) {
        let self = this;
        let flight = await self.flightSuretyApp.methods.getFlight(name).call();
        let payload = {
            airline: flight[1],
            flight: flight[2],
            timestamp: flight[3],
        }
        await self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }
}