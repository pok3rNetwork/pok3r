// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
// Contract by CAT6#2699
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MintyFreshCoin is ERC20 {
    uint standardAmount = 10000 * (10**18);

    function quickMint() public {
        _mint(msg.sender, standardAmount);
    }

    constructor() ERC20("Minty Fresh Coin", "MINT") {}
}

contract wBTC is ERC20 {
    uint standardAmount = 10000 * (10**18);

    function quickMint() public {
        _mint(msg.sender, standardAmount);
    }

    constructor() ERC20("Wrapped Bitcoin", "wBTC") {}
}

contract wETH is ERC20 {
    uint standardAmount = 10240 * (10**18);

    function quickMint() public {
        _mint(msg.sender, standardAmount);
    }

    constructor() ERC20("Wrapped Ethereum", "wETH") {}
}

contract usdt is ERC20 {
    uint standardAmount = 1000000 * (10**18);

    function quickMint() public {
        _mint(msg.sender, standardAmount);
    }

    constructor() ERC20("United States' Token", "UST") {}
}

contract nfd is ERC20 {
    uint standardAmount = 1000000 * (10**0);

    function quickMint() public {
        _mint(msg.sender, standardAmount);
    }

    constructor() ERC20("Non-Fungible Dollars", "NFD") {}

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }
}

contract usdcc is ERC20 {
    uint standardAmount = 1000000000 * (10**10); // 1,000,000

    function quickMint() public {
        _mint(msg.sender, standardAmount);
    }

    constructor() ERC20("USD Coin", "USDC") {}

    function decimals() public view virtual override returns (uint8) {
        return 10;
    }
}

contract AdminToken is ERC721 {
    uint private _tokenIds;

    function quickMint() public returns (uint) {
        _tokenIds++;
        _mint(msg.sender, _tokenIds);
        return _tokenIds;
    }

    function _baseURI() internal view override returns (string memory) {
        return "ipfs://QmQvYD4LqDdB8gMaVh7vzGfBmApv1kdfGmToQ2B3t2QsU1";
    }

    constructor() ERC721("Admin Token", "ADMIN") {}
}

contract OverrideToken is ERC721 {
    uint private _tokenIds;

    function quickMint() public returns (uint) {
        _tokenIds++;
        _mint(msg.sender, _tokenIds);
        return _tokenIds;
    }

    function _baseURI() internal view override returns (string memory) {
        return "ipfs://QmQvYD4LqDdB8gMaVh7vzGfBmApv1kdfGmToQ2B3t2QsU1";
    }

    constructor() ERC721("Override Token", "OVR") {}
}

contract ExpensiveJpeg is ERC721 {
    uint private _tokenIds;

    function quickMint() public returns (uint) {
        _tokenIds++;
        _mint(msg.sender, _tokenIds);
        return _tokenIds;
    }

    function _baseURI() internal view override returns (string memory) {
        return "ipfs://QmQvYD4LqDdB8gMaVh7vzGfBmApv1kdfGmToQ2B3t2QsU1";
    }

    constructor() ERC721("Expensive JPEG", "$JPG") {}
}
