
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';
import { ethers } from 'ethers';

(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational(async (error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);

            contract.flights.forEach(async flight => {
                displayFlight(await contract.getFlight(flight));
            });
        });

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        });

        DOM.elid('register-airline').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').value;
            let name = DOM.elid('airline-name').value;
            // Write transaction
            contract.registerAirline(airline, name, (err, res) => {
                alert("Airline was successfully registered");
            });
        });

        DOM.elid('pay-airline').addEventListener('click', () => {
            let value = DOM.elid("airline-value").value;
            // Write transaction
            contract.payAirline(value, (err, res) => {
                alert("Successfully paid airline fee");
            });
        });

        DOM.elid('register-flight').addEventListener('click', () => {
            let flight = DOM.elid("flight").value;
            let timestamp = DOM.elid("flight-timestamp").value;
            // Write transaction
            contract.registerFlight(flight, timestamp, (err, res) => {
                alert("Successfully registered flight");
            });
        })

        DOM.elid('buy').addEventListener('click', () => {
            let flight = DOM.elid("flight-name").value;
            let value = DOM.elid("insurance-value").value;
            // Write transaction
            contract.buy(flight, value, (err, res) => {
                alert("Successfully bought insurance");
            });
        });

        DOM.elid('withdraw').addEventListener('click', () => {
            let value = DOM.elid("withdraw-value").value;
            // Write transaction
            contract.withdraw(value, (err, res) => {
                alert("Successfully withdrew funds");
            });
        });

        DOM.elid('get-passenger-balance').addEventListener('click', () => {
            // Write transaction
            contract.getPassengerBalance((err, res) => {
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

function displayFlight(flight) {
    let el = document.createElement("option");
    const name = ethers.utils.toUtf8Bytes(flight.name);
    const timestamp = new Date(flight.timestamp);
    el.text = `${name} - ${timestamp}`;
    el.value = flight.name;
    DOM.elid("flights").add(el);
}
