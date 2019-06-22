const Dry = artifacts.require('./Dry.sol');
const WeatherApiCall = artifacts.require('./WeatherApiCall.sol');

module.exports = async function (deployer, network, accounts) { // eslint-disable-line
    // do nothing when testing against ganache
    if (network === '_development') return;

    const owner = accounts[0];

    const premium = 1; // ETH cost of insurance
    const insuredSum = 2; // ETH insured premium
    const lat = 0; // ETH insured premium
    const long = 0; // ETH insured premium

    const weatherApiCall = await deployer.deploy(WeatherApiCall, lat, long, {from: owner});

    const dry = await deployer.deploy(Dry, premium, insuredSum, WeatherApiCall.address, {from: owner});
};
