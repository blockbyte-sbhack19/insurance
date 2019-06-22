# DRY micro parametric insurance in lendIt

not raining for 30 days?,
* pay 1 ETH to the insurance
* get 2 ETH back automatically if condition are met

# how it is working?
* it use http://www.oraclize.it/ and query data from openweatherdata every day.
* If for more than 30 days no rains are happening, the smart contract will pay
automatically 2 ETH to all farmer that have  pay a premium of 1 ETH before (today - 30 days)
after 30 days pass the money will be kept by the insurer

the owner of the smart contract is the INSURER, he collect payments from farmer

# How to deploy
* install nodejs
* install truffle by running `npm install truffle -g`
* run `truffle migrate --network ropsten`
the smart contract is deployed on ropsten, note down the contract address in the logs



