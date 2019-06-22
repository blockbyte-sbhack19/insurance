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

    const lat = new BN('2', 10);
    const long = new BN('2', 10);

    let dry;
    let weatherOracle;

    beforeEach(async function () {
        weatherOracle = await WeatherApiCall.new({from: owner});
        dry = await DRY.new(insuredSum, premium, weatherOracle.address, {from: owner});
    });

    describe('Deploy', () => {
        it('should succeed to deploy', async function () {
            dry = await DRY.new(insuredSum, premium, weatherOracle.address, {from: owner});
        });

        it('should failed if insuredSum is 0', async function () {
            // arrange
            const insuredSum = 0;

            // act + assert
            await utils.expectThrow(DRY.new(insuredSum, premium, weatherOracle.address, {from: owner}),
                "_insuredSum must be > 0");
        });

        it('should failed if insuredSum is 0', async function () {
            // arrange
            const insuredSum = 1;
            const premium = 0;

            // act + assert
            await utils.expectThrow(DRY.new(insuredSum, premium, weatherOracle.address, {from: owner}),
                "_premium must be > 0");
        });

        it('should failed if product not rentable', async function () {
            // arrange
            const insuredSum = 4;
            const premium = 1;

            // act + assert
            await utils.expectThrow(DRY.new(insuredSum, premium, weatherOracle.address, {from: owner}),
                "ensure rentability formula violation");
        });

        it('should failed if oracle not set', async function () {
            // arrange
            const insuredSum = 1;
            const premium = 2;

            // act + assert
            await utils.expectThrow(DRY.new(insuredSum, premium, constants.ZERO_ADDRESS, {from: owner}),
                "oracle must not be address(0)");
        });
    });

    describe('Farmer paying premium', () => {
        it('should failed since Insurance premium not payed, you need to transfer exactly that amount', async function () {
            await utils.expectThrow(dry.payPremium( 0, lat, long, {
                value: 0,
                from: farmer1,
            }), 'Insurance premium not payed, you need to transfer exactly that amount');
        });

        it('should failed since Insurance premium not payed, you need to transfer exactly that amount', async function () {
            await utils.expectThrow(dry.payPremium( 0, lat, long, {
                value: 0,
                from: farmer1,
            }), 'Insurance premium not payed, you need to transfer exactly that amount');
        });

        it('should failed since Insurer can not pay the premium', async function () {
            const pay = 1;

            await utils.expectThrow(dry.payPremium( pay, lat, long, {
                value: pay,
                from: owner,
            }), 'Insurer can not pay the premium');
        });

        it('should failed since farmer can not pay twice the premium', async function () {
            const pay = 1;

            await dry.payPremium( pay, lat, long, {
                value: pay,
                from: farmer1,
            });
            await utils.expectThrow(dry.payPremium( pay, lat, long, {
                value: pay,
                from: farmer1,
            }), 'Dry insurance can only be taken once per farmer');
        });

        it('should succeed since farmer did pay right amount once', async function () {
            const pay = premium;

            const tx = await dry.payPremium( pay, lat, long, {
                value: pay,
                from: farmer1,
            });

            const events = await utils.getEvents(tx, 'PremiumPayed');
            expect(events.length).to.be.equal(1);
            expect(events[0].farmer).to.be.equal(farmer1);
            expect(events[0].amount).to.eq.BN(pay);
        });
    });

    describe('Insurer refill wallet to cover insured premium', () => {
        it('should failed since farmer can not refill', async function () {
            const pay = 100;

            await utils.expectThrow(dry.refill( pay, {
                value: pay,
                from: farmer1,
            }));
        });

        it('should succeed since insurer can refill', async function () {
            const pay = premium;

            const tx = await dry.refill( pay, {
                value: pay,
                from: owner,
            });

            const events = await utils.getEvents(tx, 'InsurerFunding');
            expect(events.length).to.be.equal(1);
            expect(events[0].owner).to.be.equal(owner);
            expect(events[0].amount).to.eq.BN(pay);
        });
    });


});

