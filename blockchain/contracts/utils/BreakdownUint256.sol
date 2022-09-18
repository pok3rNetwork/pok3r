// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract BreakdownUint256 {
    function getUint256BrokenIntoUint8(uint256 n)
        public
        pure
        returns (uint8[] memory)
    {
        uint8[] memory _8BitNumbers = new uint8[](32);

        // Mask to copy 8 bits at a time
        // 0xff is 8 bits, so we are copying 8 bits at a time.
        // After copying 8 bits, then we need to move the ff 8 bits to the left, to be able to copy the next 8 bits
        uint256 mask = 0x00000000000000000000000000000000000000000000000000000000000000ff;
        uint256 shiftBy = 0;

        // a 256-bit number has 32 bytes
        for (int256 i = 31; i >= 0; i--) {
            // Copying from right to left, end of the array to the start

            // Copying 8 bits of n doing an AND bitwise operation
            uint256 v = n & mask;

            // After every iteration, move the mask byte 8 bits to the left
            mask <<= 8;

            // The bits we just copied are to the left, if we try to cast v to uint8 then the bits will be lost and the result will be 0,
            // because the casting takes the lower bits (the right-most bits).
            // To prevent this, we need to shift the bits to the right-most part and then do the casting.
            // With shiftBy, we keep track of how many bits to th left we have copied and this way we can take these
            // bits to the left-most by shifting them shiftBy times.
            v >>= shiftBy;

            // Casting the bits to uint8 then to bytes1 and adding them to the b bytes array.
            _8BitNumbers[uint256(i)] = uint8(v);

            // For the next interation, we need to skip the current 8 bits and copy the next 8 bits.
            shiftBy += 8;
        }

        return _8BitNumbers;
    }

}
