/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like truffle-hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura API
 * keys are available for free at: infura.io/register
 *
 *   > > Using Truffle V5 or later? Make sure you install the `web3-one` version.
 *
 *   > > $ npm install truffle-hdwallet-provider@web3-one
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
    networks: {
        _development: {
            host: 'localhost',
            port: 9545,
            network_id: 4447,
            gasPrice: 1,
            gas: 4700000
        },
        local: {
            host: 'localhost',
            port: 8547,
            network_id: '*',
            gasPrice: 1,
            gas: 6712390
        },
        ropsten: {
            provider: new HDWalletProvider("80B779D5FEC4155CF43B91A8206C2DEDA7F774CF93BEA24F24BA32EB319D533F", "https://ropsten.infura.io/"),
            network_id: 3,
            gasPrice: 10000000000,
            gas: 4712394
        },
    },
    // Set default mocha options here, use special reporters etc.
    // mocha: {
    //     reporter: 'eth-gas-reporter',
    //     reporterOptions: {
    //         currency: 'CHF',
    //         gasPrice: 21
    //     }
    // },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    },
    // Configure your compilers
    compilers: {
        solc: {
            version: '0.5.4',
            docker: false,
            optimizer: {
                enabled: true,
                runs: 400
            }
        }
    }
};
