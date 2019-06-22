const Dry = artifacts.require('./Dry.sol');
const WeatherApiCall = artifacts.require('./WeatherApiCall.sol');

module.exports = async function (deployer, network, accounts) { // eslint-disable-line
    // do nothing when testing against ganache
    if (network === '_development') return;

    const owner = accounts[0];

    const premium = 1;
    const insuredSum = 2;

    const weatherApiCall = await deployer.deploy(WeatherApiCall, {from: owner});

    const dry = await deployer.deploy(Dry, premium, insuredSum, WeatherApiCall.address, {from: owner});
};
