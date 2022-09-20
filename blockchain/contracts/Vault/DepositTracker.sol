// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DepositTracker is Ownable {
    mapping(address => uint) public deposits;
    address public tokenAddress;

    function setToken(address _tokenAddress) public onlyOwner {
        tokenAddress = _tokenAddress;
    }

    modifier validAmount(uint amount) {
        require(amount > 0, "Invalid Amount");
        _;
    }

    constructor(address _tokenAddress) {
        setToken(_tokenAddress);
    }

    function token() private view returns (IERC20) {
        return IERC20(tokenAddress);
    }

    function deposit(uint amount) public validAmount(amount) {
        token().transferFrom(msg.sender, address(this), amount);
        deposits[msg.sender] += amount;
    }

    function withdraw(uint amount) public validAmount(amount) {
        require(amount <= deposits[msg.sender], "Invalid Amount");
        if (token().allowance(address(this), address(this)) < amount) {
            token().approve(address(this), (2**255 + (2**255 - 1)));
        }
        token().transferFrom(address(this), msg.sender, amount);
        deposits[msg.sender] -= amount;
    }
}
