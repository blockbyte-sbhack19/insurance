// unsecure, should be fixcoded to latest stable compiler, but ok for an hackaton :)
pragma solidity >= 0.5.0 < 0.6.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./oraclizeAPI.sol";

contract WeatherApiCall is usingOraclize {

    using SafeMath for uint256;
    string public willRain;

    uint256 lat;
    uint256 lon;

    event LogNewOraclizeQuery(string text, uint256 lat, uint256 lon);

    constructor(uint256 _lat, uint256 _lon) public{
        lat = _lat;
        lon = _lon;
        // update();
        // Update price on contract creation...
    }

    function __callback(bytes32 myid, string memory _result) public {
        require(msg.sender == oraclize_cbAddress());
        update();
        // Recursively update the value of rain
        willRain = _result;
        emit LogNewOraclizeQuery(willRain, lat, lon);
    }

    function update() payable public {
        if (oraclize_getPrice("URL") > address(this).balance) {
            emit LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee!", lat, lon);
        } else {
            emit LogNewOraclizeQuery("Oraclize query openweather api", lat, lon);

            string memory query = strConcat("json(https://samples.openweathermap.org/data/2.5/history/city?lat=", uint2str(lat));
            query = strConcat(query, "&lon=");
            query = strConcat(query, uint2str(lon));
            query = strConcat(query, "&appid=1fb152921b0afc5676761d300b06f97a].weather[0].main");

            oraclize_query(1 * day, "URL", query);
        }
    }
}
