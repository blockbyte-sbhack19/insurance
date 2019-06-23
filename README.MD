# DRY micro parametric insurance in lendIt

This insurance product is deployed on Ethereum Ropsten (Testnet)
*  Dry at https://ropsten.etherscan.io/address/0x9ec90cec0cb4bafd5d97e3efd83c05e9c96aad15
*  WeatherApiCall at https://ropsten.etherscan.io/address/0xC64Bb3D5F7cb8b6aaBA2E2694272cEA99642ce6D

## Insurer:
* account private key is 80B779D5FEC4155CF43B91A8206C2DEDA7F774CF93BEA24F24BA32EB319D533F, has 1 ETH to deploy
* Cover the cost of Oracle daily query
* if claims are too high, insurer can use `refill()` method to tranfer more ETH to cover all insured premium.

## Farmer
Farmer insure the case where their parcel see no rain for 30 days,
* farmer pay 1 ETH to the insurance through the mobile app (in backend we miss the code to create that online Tx)
* farmer get 2 ETH back automatically if following conditions are met:
 * it is not raining on his parcel during 30 days
 * after 60 days (it rain regurlaly, at least every 29 days), then the insurance contract is stopped, and money left get to the insurer

## Smart Contract
* collect payments from farmers.
* the owner of the smart contract is the Insurer
* history of who is insured, how many payment are collected is maintained on chain.

# how it is working?
* it use http://www.oraclize.it/ and query data from openweatherdata every day for every single farmer payment & parcel
* If for more than 30 days no rains are happening, the smart contract will pay
automatically 2 ETH to all farmer that have  pay a premium of 1 ETH before (today - 30 days)
after 60 days pass the money will be kept by the insurer!

The smart contract emit events that the mobile app or the backend can listen to
* `PremiumPayed(farmer, amount)` a farmer has paid his premium
* `InsurerFunding(amount)`       the insurer is adding some ETH to better cover claims cost
* `InsurerPayingInsuredSum(farmer, amount)` the insurer is paying the insured premium to farmer
* `InsuranceExpired(farmer)`              farmer lose its premium, after 30 days without claims

# How to deploy
* install nodejs
* install truffle by running `npm install truffle -g`
* run `truffle migrate --network ropsten`
the smart contract is deployed on ropsten, note down the contract address in the logs
