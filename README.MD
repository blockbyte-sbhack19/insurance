# DRY micro parametric insurance in lendIt

not raining for 30 days?,
* pay 1 ETH to the insurance
* get 2 ETH back automatically if condition are met

# how it is working?
* it use http://www.oraclize.it/ and query data from openweatherdata every day for every single farmer payment
* If for more than 30 days no rains are happening, the smart contract will pay
automatically 2 ETH to all farmer that have  pay a premium of 1 ETH before (today - 30 days)
after 30 days pass the money will be kept by the insurer!

the owner of the smart contract is the INSURER, he collect payments from farmer.
If claims is too high, insurer can use refill() method to tranfer more ETH to cover all insured premium.

the smart contract emit events that the mobile app or the backend can listen to
* PremiumPayed(farmer, amount) a farmer has paid his premium
* InsurerFunding(amount)       the insurer is adding some ETH to better cover claims cost
* InsurerPayingInsuredSum(farmer, amount) the insurer is paying the insured premium to farmer
* InsuranceExpired(farmer)                farmer lose its premium, after 30 days without claims

# How to deploy
* install nodejs
* install truffle by running `npm install truffle -g`
* run `truffle migrate --network ropsten`
the smart contract is deployed on ropsten, note down the contract address in the logs



