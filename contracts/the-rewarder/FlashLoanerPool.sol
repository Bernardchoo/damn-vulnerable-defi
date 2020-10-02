pragma solidity ^0.6.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "../DamnValuableToken.sol";

/**
 * @notice A simple pool to get flash loans of DVT
 */
contract FlashLoanerPool is ReentrancyGuard {

    using Address for address payable;

    DamnValuableToken public liquidityToken;

    constructor(address liquidityTokenAddress) public {
        liquidityToken = DamnValuableToken(liquidityTokenAddress);
    }

    function flashLoan(uint256 amount) external nonReentrant {
        uint256 balanceBefore = liquidityToken.balanceOf(address(this));
        //Token balance must be more than or equal amount that user want to borrow.
        require(amount <= balanceBefore, "Not enough token balance");
        // Call by Attacker
        require(msg.sender.isContract(), "Borrower must be a deployed contract");
        //Transfer liquidity token to attacker contract.
        liquidityToken.transfer(msg.sender, amount);
/*      TheRewarderPool(rewarder).liquidityToken().approve(rewarder, amount);
        TheRewarderPool(rewarder).deposit(amount);
        TheRewarderPool(rewarder).withdraw(amount);
        TheRewarderPool(rewarder).liquidityToken().transfer(msg.sender, amount);*/
        // Call attacker function and execute -> 
        (bool success, ) = msg.sender.call(
            abi.encodeWithSignature(
                "receiveFlashLoan(uint256)",
                amount
            )
        );
        require(success, "External call failed");

        require(liquidityToken.balanceOf(address(this)) >= balanceBefore, "Flash loan not paid back");
    }
}