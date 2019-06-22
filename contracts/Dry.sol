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

    using SafeMath for uint256;

    mapping(address => Payment) public insuredAccount;
    mapping(address => bool) public claimValidAccount;

    mapping (address => uint) pendingWithdrawals;

    // the external connection to a trustworthy weather oracle
    address oracle;

    uint256 insuredSum;
    uint256 premium;

    /**
    * @dev insurer defined the term of the micro parametric insurance
    * @param _premium for example max 0.5 ETH
    * @param _insuredSum for example max 1.5 ETH
    * @param _oracle oracle address
    */
    constructor(uint256 _insuredSum, uint256 _premium, address _oracle) public {
        require(_insuredSum > 0, "_insuredSum must be > 0");
        require(_premium > 0, "_premium must be > 0");
        require(_insuredSum < _premium * 3, "ensure rentability formula violation");

        require(msg.sender != address(0), "_insurer must not be address(0)");
        require(_oracle != address(0), "oracle must not be address(0)");

        oracle = _oracle;
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

    struct Payment
    {
        uint256 createdOn;
        uint256 endOn;
        address issuer;
        uint256 lat;
        uint256 long;
        uint256 daysWithoutRain;
        WeatherApiCall oracle;
    }

    /**
     * @dev farmer can pay premium here
     * @param _premiumAmount amount payed in eth to cover the insurance
     */
    function payPremium(uint256 _premiumAmount, uint256 _lat, uint256 _long) payable public {
        require(_premiumAmount == premium, "Insurance premium not payed, you need to transfer exactly that amount");

        address farmer = msg.sender; // payer is insured person

        require(owner() != farmer, "Insurer can not pay the premium");
        require(doesInsuranceExist(farmer) == false, "Dry insurance can only be taken once per farmer");

        // create a new oracle instance
        WeatherApiCall hisOracle = new WeatherApiCall(_lat, _long);

        insuredAccount[farmer] = Payment({
            createdOn : block.number,
            endOn : (block.number.add(30)).mul(60).mul(60).div(17), // naive 30 days end bloc
            issuer : farmer,
            lat: _lat,
            long: _long,
            daysWithoutRain: 0,
            oracle: hisOracle
            });

        emit PremiumPayed(farmer, _premiumAmount);
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

        require(doesInsuranceExist(farmer) == false, "you were not insured");
        require(claimValidAccount[farmer] == false, "your claims is not acceptable, did you pay too late (< 30 days)");

        uint amount = pendingWithdrawals[farmer];
        // Remember to zero the pending refund before
        // sending to prevent re-entrancy attacks
        pendingWithdrawals[farmer] = 0;
        msg.sender.transfer(amount);
        emit InsurerPayingInsuredSum(farmer, amount);

        return true;
    }

    function doesInsuranceExist(address farmer) public view returns (bool)
    {
        return insuredAccount[farmer].issuer != address(0);
    }
}
