// unsecure, should be fixcoded to latest stable compiler, but ok for an hackaton :)
pragma solidity >= 0.5.0 < 0.6.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./WeatherApiCall.sol";

/**
* not raining for 30 days?,
pay 0.5 ETH
get 1.5 ETH back automatically if condition are met
*/
contract Dry is Ownable, Pausable {

    mapping(address => bool) public insuredAccount;
    mapping(address => bool) public claimValidAccount;

    mapping (address => uint) pendingWithdrawals;

    // the external connection to a trustworthy weather oracle
    WeatherApiCall oracle;

    uint256 insuredSum;
    uint256 premium;

    /**
    * @dev insurer defined the term of the micro parametric insurance
    * @param _premium for example max 0.5 ETH
    * @param _insuredSum for example max 1.5 ETH
    * @param _weather oracle
    */
    constructor(uint256 _insuredSum, uint256 _premium, address _weather) public {
        require(_insuredSum > 0, "_insuredSum must be > 0");
        require(_premium > 0, "_premium must be > 0");
        require(_insuredSum < _premium * 3, "ensure rentability formula violation");

        require(msg.sender != address(0), "_insurer must not be address(0)");
        require(_weather != address(0), "oracle must not be address(0)");

        oracle = WeatherApiCall(_weather);
        insuredSum = _insuredSum;
        premium = _premium;
    }

    // some events the app can listen to
    event PremiumPayed(
        address indexed farmer,
        uint256 amount
    );

    event InsurerFunding(
        address indexed owner,
        uint256 amount
    );

    event InsurerPayingInsuredSum(
        address indexed farmer,
        uint256 amount
    );

    /**
     * @dev farmer can pay premium here
     * @param _premiumAmount amount payed in eth to cover the insurance
     */
    function payPremium(uint256 _premiumAmount) payable public {
        require(_premiumAmount == premium, "Insurance premium not payed, you need to transfer exactly that amount");
        require(owner() != msg.sender, "Insurer can not pay the premium");
        require(insuredAccount[msg.sender] == false, "Dry insurance can only be taken once per farmer");

        // msg.sender will be insured
        insuredAccount[msg.sender] = true;

        emit PremiumPayed(msg.sender, _premiumAmount);
    }

    /**
    * @dev insurer can refill the wallet to cover the claims
     */
    function refill(uint256 _amount) payable public onlyOwner {
        emit InsurerFunding(msg.sender, _amount);
    }

    /**
    * to avoid an obvious ren-entrancy bug, it is better to let farmer retrieve their own ETH gains (from insurance)
    */
    function withdraw(uint256 _amount) public whenNotPaused returns (bool)
    {
        require(_amount > 0, "no ether to be withdrawn");
        require(!isOwner(), "the owner cannot withdraw ether tokens");
        address farmer = msg.sender;

        require(insuredAccount[farmer] == true, "you were not insured");
        require(claimValidAccount[farmer] == false, "your claims is not acceptable, did you pay too late (< 30 days)");

        uint amount = pendingWithdrawals[farmer];
        // Remember to zero the pending refund before
        // sending to prevent re-entrancy attacks
        pendingWithdrawals[farmer] = 0;
        msg.sender.transfer(amount);
        emit InsurerPayingInsuredSum(farmer, amount);
    }

}
