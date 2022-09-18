// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.16;
import "@openzeppelin/contracts/access/Ownable.sol";
contract Destructible is Ownable {
    
    constructor() payable {
    }
    /**
     * @dev Transfers the current balance to the owner and terminates the contract.
     */
    function destroy() public onlyOwner {
        address payable payableOwner = payable(owner());
        selfdestruct(payableOwner);
    }
    function destroyAndSend(address payable _recipient) public onlyOwner {
        selfdestruct(_recipient);
    }
}
