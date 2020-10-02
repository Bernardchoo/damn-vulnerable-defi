![](cover.png)

**A set of challenges to hack implementations of DeFi in Ethereum.** Featuring flash loans, oracles, governance, NFTs, lending pools, and more!

Created by [@tinchoabbate](https://twitter.com/tinchoabbate) at OpenZeppelin

## Play

Visit [damnvulnerabledefi.xyz](https://damnvulnerabledefi.xyz)!

## Participate

Share your solutions, comments, feedback and more in Twitter with [#DamnVulnerableDeFi](https://twitter.com/hashtag/DamnVulnerableDeFi).

## Disclaimer

All Solidity code, practices and patterns in this repository are DAMN VULNERABLE and for educational purposes only.

DO NOT USE IN PRODUCTION.

How to Hack
Clone the repository
Install dependencies with npm install
Code your solutions in the provided *.challenge.js files (inside each challenge's folder in the test folder)
Run your exploit for a challenge with npm run challenge-name. If the challenge is executed successfully, you've passed!
Tips and tricks
In all challenges you must use the attacker account. That means all your transactions must include {from: attacker}
In some cases, you might need to use custom attacker contracts.
To code the exploits, you might want to refer to the OpenZeppelin Test Helpers and Truffle Contracts docs
Participate
Were you able to exploit everything ? Did you get stuck ? Want more challenges ?

Join in Twitter with #DamnVulnerableDeFi

Solution : https://github.com/Amxx/damn-vulnerable-defi

https://www.damnvulnerabledefi.xyz/

    $ yarn unstoppable
    $ yarn truster
    $ yarn side-entrance
    $ yarn the-rewarder // done
    $ yarn naive-receiver
    $ yarn selfie
    $ yarn compromised
    $ yarn puppet

If error occurs : 
Timeout of 5000ms exceeded. For async tests and hooks, ensure "done()" is called; if returning a Promise, ensure it resolves.

Increase npx mocha --timeout 5000 (to 10000)