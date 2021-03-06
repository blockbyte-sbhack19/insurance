
const BN = web3.utils.BN;
require('chai')
    .use(require('chai-as-promised'))
    .use(require('bn-chai')(BN))
    .use(require('dirty-chai'))
    .use(require('chai-string'))
    .should();
const chai = require('chai');
const expect = chai.expect;

 function noEvents(tx, event = null) {
    const stack = [];

    tx.logs.forEach((item) => {
        if (event) {
            if (event === item.event) {
                stack.push(item.args);
            }
        } else {
            if (!stack[item.event]) {
                stack[item.event] = [];
            }
            stack[item.event].push(item.args);
        }
    });

    if (Object.keys(stack).length === 0) {
        return stack;
    }

    throw new Error('Events was fired');
}

 function getEvents(tx, event = null) {
    const stack = [];

    tx.logs.forEach((item) => {
        if (event) {
            if (event === item.event) {
                stack.push(item.args);
            }
        } else {
            if (!stack[item.event]) {
                stack[item.event] = [];
            }
            stack[item.event].push(item.args);
        }
    });

    if (Object.keys(stack).length === 0) {
        throw new Error('No Events with name ' + event + ' was fired');
    }

    return stack;
}

 async function logEvents(tx, event = 'LOG') {
    const events = await getEvents(tx, event);
    for (let i = 0; i < events.length; i++) {
        console.log(events[i].message + '=' + events[i].value);
    }
}


async function expectThrow(promise, message) {
    try {
        await promise;
    } catch (error) {
        // Check jump destination to destinguish between a throw and an actual invalid jump.
        const invalidOpcode = error.message.search('invalid opcode') >= 0;
        const revert = error.message.search('revert') >= 0;
        // When we contract A calls contract B, and B throws, instead
        //       of an 'invalid jump', we get an 'out of gas' error. How do
        //       we distinguish this from an actual out of gas event? (The
        //       testrpc log actually show an 'invalid jump' event.)
        const outOfGas = error.message.search('out of gas') >= 0;
        assert(
            invalidOpcode || revert || outOfGas,
            'Expected throw, got \'' + error + '\' instead',
        );
        if (message !== undefined) {
            assert(error.reason === message, `Expected '${message}' to equal '${error.reason}'`);
        }
        return;
    }
    assert.fail('Expected throw not received');
};

module.exports = {
    getEvents,
    expectThrow,
    logEvents,
    noEvents,
};
