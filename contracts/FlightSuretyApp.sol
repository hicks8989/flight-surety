// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    // Airline Variables:
    uint256 private constant AIRLINE_FEE = 10 ether;
    uint256 private constant AIRLINE_CONSENSUS = 4;
    uint256 private constant AIRLINE_CONSENSUS_FACTOR = 2;

    address private contractOwner;          // Account used to deploy contract

    // Flight Surety Data Contract:
    FlightSuretyData data;
    address flightSuretyDataAddress;


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
         // Modify to call data contract's status
        require(true, "Contract is currently not operational");
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

    modifier requireAirlineRegistered()
    {
        bool isRegistered;
        ( , isRegistered, ) = data.getAirline(msg.sender);
        require(isRegistered, "Provided airline is not registered");
        _;
    }

    modifier requireAirlineFeePaid()
    {
        bool hasPaidFee;
        ( , , hasPaidFee) = data.getAirline(msg.sender);
        require(hasPaidFee, "Provided airline has not paid fee");
        _;
    }

    modifier requireHasNotVoted(address _address)
    {
        address[] memory airlineVotes = data.getAirlineVotes(_address);
        bool hasVoted;

        for (uint i = 0; i < airlineVotes.length; i++) {
            if (airlineVotes[i] == msg.sender) {
                hasVoted = true;
                break;
            }
        }

        require(!hasVoted, "Cannot vote for the same airline twice");
        _;
    }

    modifier requireFee(uint256 fee)
    {
        require(msg.value >= fee, "Fee must be met in order to continue");
        _;
    }

    /********************************************************************************************/
    /*                                       EVENTS                                             */
    /********************************************************************************************/

    event AirlineRegistered(address indexed _address, uint256 votes);
    event AirlineFeePaid(address indexed _address, uint256 value);

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor(address dataAddress) public
    {
        contractOwner = msg.sender;

        // Save dataAddress
        flightSuretyDataAddress = dataAddress;

        // Get data from data contract:
        data = FlightSuretyData(dataAddress);
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() public pure returns(bool)
    {
        return true;  // Modify to call data contract's status
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/


   /**
    * @dev Add an airline to the registration queue
    *
    */
    function registerAirline(address _address, bytes32 name)
    external requireIsOperational requireAirlineRegistered requireAirlineFeePaid returns(bool success, uint256 votes)
    {
        // Get the total number of airlines:
        uint256 airlineCount = data.getAirlineCount();
        // Check if it is greater than the consensus variable:
        if(airlineCount > AIRLINE_CONSENSUS) {
            // Cast vote:
            voteForAirline(_address);

            // Get total number of votes:
            uint256 voteCount = data.getAirlineVotes(_address).length;

            // Check if concensus reached:
            if (_hasEnoughVotes(airlineCount, voteCount)) {
                _registerAirline(_address, name, voteCount);
                return (true, voteCount);
            } else {
                return (false, voteCount);
            }
        } else {
            // Register the airline:
            _registerAirline(_address, name, 1);
            return (true, 1);
        }
    }

    function _registerAirline(address _address, bytes32 name, uint256 votes) internal {
        data.registerAirline(_address, name);
        emit AirlineRegistered(_address, votes);
    }

    function payAirlineFee(address _address) external payable requireIsOperational requireAirlineRegistered requireFee(AIRLINE_FEE) {
        address(uint160(address(data))).transfer(msg.value);
        _payAirlineFee(_address, msg.value);
    }

    function _payAirlineFee(address _address, uint256 value) internal {
        data.payAirlineFee(_address, msg.value);
        emit AirlineFeePaid(_address, value);
    }

    function voteForAirline(address _address)
    internal requireIsOperational requireAirlineRegistered requireAirlineFeePaid requireHasNotVoted(_address) {
        data.voteForAirline(_address, msg.sender);
    }

    function _hasEnoughVotes(uint256 airlineCount, uint256 voteCount) internal pure returns(bool) {
        // Get the number of required votes:
        uint256 neededVotes = airlineCount.div(AIRLINE_CONSENSUS_FACTOR);

        if ((airlineCount % 2) == 1) {
            neededVotes.add(1);
        }

        return (voteCount >= neededVotes);
    }

   /**
    * @dev Register a future flight for insuring.
    *
    */
    function registerFlight() external pure
    {

    }

   /**
    * @dev Called after oracle has updated flight status
    *
    */
    function processFlightStatus
    (address airline,
    string memory flight,
    uint256 timestamp,
    uint8 statusCode) internal pure
    {

    }


    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus(address airline, string memory flight, uint256 timestamp) public
    {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        oracleResponses[key] = ResponseInfo({
            requester: msg.sender,
            isOpen: true
        });

        emit OracleRequest(index, airline, flight, timestamp);
    }


// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);


    // Register an oracle with the contract
    function registerOracle() external payable
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
            isRegistered: true,
            indexes: indexes
        });
    }

    function getMyIndexes() external view returns(uint8[3] memory)
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }




    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse(
        uint8 index,
        address airline,
        string memory flight,
        uint256 timestamp,
        uint8 statusCode
    ) public
    {
        bool hasIndex = (
            (oracles[msg.sender].indexes[0] == index) ||
            (oracles[msg.sender].indexes[1] == index) ||
            (oracles[msg.sender].indexes[2] == index)
        );
        require(hasIndex, "Index does not match oracle request");


        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }


    function getFlightKey(address airline, string memory flight, uint256 timestamp) internal pure returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes(address account) internal returns(uint8[3] memory)
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);

        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex
                            (
                                address account
                            )
                            internal
                            returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

// endregion

}

// Contract Stub:
contract FlightSuretyData {
    function registerAirline(address _address, bytes32 name) external view returns(uint256);
    function payAirlineFee(address _address, uint256 value) external;
    function getAirlineCount() external view returns(uint256);
    function getAirlineVotes(address _address) external view returns(address[] memory);
    function getAirline(address _address) external view returns(bytes32, bool, bool);
    function voteForAirline(address _address, address voter) external;
    function buy() external payable;
    function creditInsurees() external pure;
    function pay() external pure;
    function fund() public payable;
    function getFlightKey(address _address, string memory flight, uint256 timestamp) internal pure returns(bytes32);
}
