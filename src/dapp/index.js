
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';
import { ethers } from 'ethers';

(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational(async (error, result) => {
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);

            contract.flights.forEach(flight => {
                displayFlight(flight, "flight-numbers");
                displayFlight(flight, "flights");
            });

            contract.airlines.forEach(async address => {
                let airline = await contract.getAirline(address);

                airline = {
                    address,
                    name: ethers.utils.parseBytes32String(airline[0])
                }

                displayAirline(airline, "airlines");
                displayAirline(airline, "from-airline");
                displayAirline(airline, "paying-airline");
            });

            contract.passengers.forEach(async passenger => {
                displayPassenger(passenger, "purchaser");
                displayPassenger(passenger, "withdrawer");
                displayPassenger(passenger, "passenger");
            });
        });

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', async () => {
            let flight = DOM.elid('flight-numbers').value;
            // Write transaction
            await contract.fetchFlightStatus(flight, (error, result) => {
                const number = ethers.utils.parseBytes32String(result.flight);
                let date = new Date(Number(result.timestamp));
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: number + ' - ' + date} ]);
            });
        });

        DOM.elid('register-airline').addEventListener('click', async () => {
            let airline = DOM.elid('airline-address').value;
            let name = DOM.elid('airline-name').value;
            // Write transaction
            await contract.registerAirline(airline, name, (err, res) => {
                display('Register Airline', 'Registers an Airline', [ { label: 'Register Airline', error: error, value: result} ]);
            });
        });

        DOM.elid('pay-airline').addEventListener('click', async () => {
            let value = DOM.elid("airline-value").value;
            // Write transaction
            await contract.payAirline(value, (err, res) => {
                console.log(err);
                alert("Successfully paid airline fee");
            });
        });

        DOM.elid('register-flight').addEventListener('click', async () => {
            let airline = DOM.elid("airlines").value;
            let flight = DOM.elid("flight").value;
            let timestamp = DOM.elid("flight-time").value;

            // Write transaction
            await contract.registerFlight(airline, flight, timestamp, (err, res) => {
                alert("Successfully registered flight");
            });
        })

        DOM.elid('buy').addEventListener('click', async () => {
            let passenger = DOM.elid("purchaser").value;
            let flight = DOM.elid("flights").value;
            let value = DOM.elid("insurance-value").value;
            // Write transaction
            await contract.buy(passenger, flight, value, (err, res) => {
                alert("Successfully bought insurance");
            });
        });

        DOM.elid('withdraw').addEventListener('click', async () => {
            let passenger = DOM.elid("withdrawer").value;
            let value = DOM.elid("withdraw-value").value;
            // Write transaction
            await contract.withdraw(passenger, value, (err, res) => {
                alert("Successfully withdrew funds");
            });
        });

        DOM.elid('get-passenger-balance').addEventListener('click', async () => {
            let passenger = DOM.elid("passenger").value;
            // Write transaction
            await contract.getPassengerBalance(passenger, (err, res) => {
                console.log("Successfully got passenger balance");
            });

            alert(contract.balance);
        });
    });

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    });
    displayDiv.append(section);
}

function displayFlight(flight, id) {
    let el = document.createElement("option");
    el.text = ethers.utils.parseBytes32String(flight);
    el.value = flight;
    DOM.elid(id).add(el);
}

function displayAirline(airline, id) {
    let el = document.createElement("option");
    el.text = airline.name;
    el.value = airline.address;
    DOM.elid(id).add(el);
}

function displayPassenger(passenger, id) {
    let el = document.createElement("option");
    el.text = passenger;
    el.value = passenger;
    DOM.elid(id).add(el);
}