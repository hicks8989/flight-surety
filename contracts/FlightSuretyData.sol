// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                // Blocks all state changes throughout the contract if false

    struct Airline {
        bytes32 name;
        bool isRegistered;
        bool hasPaidFee;
    }

    struct Flight {
        bool isRegistered;
        bytes32 flight;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
    }

    struct Insurance {
        address passenger;
        uint256 value;
        bool isPaid;
        bool isRegistered;
    }

    // Airline Variables:
    address[] registeredAirlines;
    mapping (address => Airline) airlines;
    mapping (address => uint256) airlineBalances;

    // Flight Variables:
    mapping(bytes32 => Flight) private flights;
    bytes32[] private flightKeys;

    // Insurance Variables:
    mapping(bytes32 => bytes32[]) passengerKeys; // Flight to passenger address
    mapping(address => bytes32[]) insuranceKeys; // Passenger address to insurance key
    mapping(bytes32 => Insurance) insurances;
    mapping(address => uint256) insuranceBalances;

    // Authorized Contracts:
    mapping (address => bool) authorizedContracts;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor(bytes32 name)
        public
    {
        contractOwner = msg.sender;

        // Create the first airline:
        airlines[msg.sender] = Airline(name, true, false);

        // Add to airline count:
        registeredAirlines.push(msg.sender);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireContractAuthorized()
    {
        require(authorizedContracts[msg.sender], "Contract is unautorized");
        _;
    }

    modifier requireContractHasFunds(uint256 value)
    {
        require(address(this).balance >= value, "Contract does not have enough funds to pay out insurance costs");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational()
        public
        view
        returns(bool)
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus(bool mode)
        external
        requireContractOwner
    {
        operational = mode;
    }

    function authorizeContract(address _address)
        external
        requireIsOperational
        requireContractOwner
    {
        authorizedContracts[_address] = true;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline(address _address, bytes32 name)
        external
        requireIsOperational
        requireContractAuthorized
    {
        // Register a new airline with provided information:
        airlines[_address] = Airline(name, true, false);

        registeredAirlines.push(_address);
    }

   /**
    * @dev Get the number of airlines verified
    *
    */
    function getAirlineCount()
        external
        view
        returns(uint)
    {
        return registeredAirlines.length;
    }

    function getRegisteredAirlines()
        external
        view
        returns(address[] memory)
    {
        return registeredAirlines;
    }

   /**
    * @dev Get the airline at the provided address
    *
    */
    function getAirline(address _address)
        external
        view
        returns(bytes32, bool, bool)
    {
        Airline memory airline = airlines[_address];
        return (airline.name, airline.isRegistered, airline.hasPaidFee);
    }

   /**
    * @dev Pay the required airline fee
    *
    */
    function payAirlineFee(address _address, uint256 value)
        external
        requireIsOperational
        requireContractAuthorized
    {
        airlineBalances[_address] = airlineBalances[_address].add(value);
        airlines[_address].hasPaidFee = true;
    }

    function registerFlight(address airline, bytes32 flight, uint256 timestamp, uint8 status)
        external
        requireIsOperational
        requireContractAuthorized
    {
        // Generate a flight key with provided information:
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        flights[flightKey] = Flight(true, flight, status, timestamp, airline);

        // Save the flight key:
        flightKeys.push(flightKey);
    }

    function getFlight(bytes32 flight)
        external
        view
        returns(bool, address, bytes32, uint256, uint8)
    {
        return _getFlight(flight);
    }

    function _getFlight(bytes32 _flight)
        internal
        view
        returns(bool, address, bytes32, uint256, uint8)
    {
        // Pass in empty string to flights to get empty flight:
        Flight memory flight = flights[bytes32(0)];
        for(uint256 i = 0; i < flightKeys.length; i++) {
            // Check if the passed in flight matches the flight at the flight key:
            if (flights[flightKeys[i]].flight == _flight) {
                flight = flights[flightKeys[i]];
                break;
            }
        }
        return (flight.isRegistered, flight.airline, flight.flight, flight.updatedTimestamp, flight.statusCode);
    }

    function getAllFlights()
        external
        view
        returns(bytes32[] memory)
    {
        // Create an array for flight names:
        bytes32[] memory flightNames = new bytes32[](flightKeys.length);

        // Iterate through all flights and add the flight name:
        for (uint256 i = 0; i < flightKeys.length; i++) {
            flightNames[i] = (flights[flightKeys[i]].flight);
        }

        return flightNames;
    }

    function updateFlightStatus(bytes32 flightKey, uint8 statusCode)
        external
        requireIsOperational
        requireContractAuthorized
    {
        flights[flightKey].statusCode = statusCode;
    }

   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy(address _address, uint256 value, bytes32 _flight)
        external
        requireIsOperational
        requireContractAuthorized
    {
        bytes32 insuranceKey = getInsuranceKey(_address, _flight);
        if(insurances[insuranceKey].isRegistered) {
            insurances[insuranceKey].value = insurances[insuranceKey].value.add(value);
        } else {
            // Create a new insurance:
            insurances[insuranceKey] = Insurance(_address, value, false, true);
            passengerKeys[_flight].push(insuranceKey);
            insuranceKeys[_address].push(insuranceKey);
        }

        // Update airlines balance:
        address airline;
        ( , airline, , , ) = _getFlight(_flight);
        airlineBalances[airline] = airlineBalances[airline].add(value);

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees(bytes32 flight, uint256 payoutFactor)
        external
        requireIsOperational
        requireContractAuthorized
    {
        address airline;
        ( , airline, , , ) = _getFlight(flight);
        for(uint256 i = 0; i < passengerKeys[flight].length; i++) {
            bytes32 insuranceKey = passengerKeys[flight][i];
            Insurance memory insurance = insurances[insuranceKey];
            if (insurance.isPaid == false) {
                uint256 value = insurance.value.mul(payoutFactor).div(100);
                address passenger = insurance.passenger;
                _creditInsuree(insurance, passenger, value);

                airlineBalances[airline] = airlineBalances[airline].sub(value);
            }

        }
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function _creditInsuree(Insurance memory insurance, address passenger, uint256 value)
        internal
    {
        insurance.isPaid = true;
        insuranceBalances[passenger] = insuranceBalances[passenger].add(value);
    }

    function getInsurance(address _address, bytes32 flight)
        external
        view
        returns(address, uint256, bool)
    {
        bytes32 insuranceKey = getInsuranceKey(_address, flight);
        Insurance memory insurance = insurances[insuranceKey];

        return(insurance.passenger, insurance.value, insurance.isPaid);
    }

    function getInsuranceBalance(address _address)
        external
        view
        returns(uint256)
    {
        return insuranceBalances[_address];
    }

    function getAirlineBalance(address _address)
        external
        view
        returns(uint256)
    {
        return airlineBalances[_address];
    }

    function pay(address _address, uint256 value)
        external
        requireIsOperational
        requireContractAuthorized
        requireContractHasFunds(value)
    {
        insuranceBalances[_address] = insuranceBalances[_address].sub(value);
    }

    function getFlightKey(address airline, bytes32 flight, uint256 timestamp)
        internal
        pure
        returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    function getInsuranceKey(address passenger, bytes32 flight)
        internal
        pure
        returns(bytes32)
    {
        return keccak256(abi.encodePacked(passenger, flight));
    }

}

