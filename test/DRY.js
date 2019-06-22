const DRY = artifacts.require('Dry');
const WeatherApiCall = artifacts.require('WeatherApiCall');
const utils = require('./utils.js');
const constants = require('./constants.js');

const BN = web3.utils.BN;
require('chai')
    .use(require('chai-as-promised'))
    .use(require('bn-chai')(BN))
    .use(require('dirty-chai'))
    .use(require('chai-string'))
    .should();
const chai = require('chai');
const expect = chai.expect;

contract('Dry', (accounts) => {
    const owner = accounts[0];

    const farmer1 = accounts[1];
    const farmer2 = accounts[2];

    const premium = new BN('1', 10);
    const insuredSum = new BN('2', 10);

    let dry;
    let weatherOracle;

    beforeEach(async function () {
        weatherOracle = await WeatherApiCall.new({from: owner});
        dry = await DRY.new(insuredSum, premium, weatherOracle.address, {from: owner});
    });

    describe('Deploy', () => {
        xit('should failed if insurer is 0x0', async function () {
            await utils.expectThrow(DRY.new(premium, insuredSum, weatherOracle.address, {from: constants.ZERO_ADDRESS}),
                "_insurer must not be address(0)");
        });



    });

});

