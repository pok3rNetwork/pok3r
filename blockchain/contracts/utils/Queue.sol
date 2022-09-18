// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title Queue
 * @author Erick Dagenais (https://github.com/edag94)
 * @dev Implementation of the queue data structure, providing a library with struct definition for queue storage in consuming contracts.
 */
library Queue {
    // To implement this library for multiple types with as little code
    // repetition as possible, we write it in terms of a generic Queue type with
    // bytes32 values.
    // The Set implementation uses private functions, and user-facing
    // implementations (such as AddressSet) are just wrappers around the
    // underlying Set.
    // This means that we can only create new EnumerableSets for types that fit
    // in bytes32.
    // Based off the pattern used in https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/structs/EnumerableSet.sol[EnumerableSet.sol] by OpenZeppelin

    struct QueueStorage {
        mapping (uint256 => bytes32) _data;
        uint256 _first;
        uint256 _last;
    }

    modifier isNotEmpty(QueueStorage storage queue) {
        require(!_isEmpty(queue), "Queue is empty.");
        _;
    }

    /**
     * @dev Sets the queue's initial state, with a queue size of 0.
     * @param queue QueueStorage struct from contract.
     */
    function _initialize(QueueStorage storage queue) private {
        queue._first = 1;
        queue._last = 0;
    }

    /**
     * @dev Gets the number of elements in the queue. O(1)
     * @param queue QueueStorage struct from contract.
     */
    function _length(QueueStorage storage queue) private view returns (uint256) {
        if (queue._last < queue._first) {
            return 0;
        }
        return queue._last - queue._first + 1;
    }

    /**
     * @dev Returns if queue is empty. O(1)
     * @param queue QueueStorage struct from contract.
     */
    function _isEmpty(QueueStorage storage queue) private view returns (bool) {
        return _length(queue) == 0;
    }

    /**
     * @dev Adds an element to the back of the queue. O(1)
     * @param queue QueueStorage struct from contract.
     * @param data The added element's data.
     */
    function _enqueue(QueueStorage storage queue, bytes32 data) private {
        queue._data[++queue._last] = data;
    }

    /**
     * @dev Removes an element from the front of the queue and returns it. O(1)
     * @param queue QueueStorage struct from contract.
     */
    function _dequeue(QueueStorage storage queue) private isNotEmpty(queue) returns (bytes32 data) {
        data = queue._data[queue._first];
        delete queue._data[queue._first++];
    }

    /**
     * @dev Returns the data from the front of the queue, without removing it. O(1)
     * @param queue QueueStorage struct from contract.
     */
    function _peek(QueueStorage storage queue) private view isNotEmpty(queue) returns (bytes32 data) {
        return queue._data[queue._first];
    }

    /**
     * @dev Returns the data from the back of the queue. O(1)
     * @param queue QueueStorage struct from contract.
     */
    function _peekLast(QueueStorage storage queue) private view isNotEmpty(queue) returns (bytes32 data) {
        return queue._data[queue._last];
    }

    // Bytes32Queue

    struct Bytes32Queue {
        QueueStorage _inner;
    }

    /**
     * @dev Sets the queue's initial state, with a queue size of 0.
     * @param queue Bytes32Queue struct from contract.
     */
    function initialize(Bytes32Queue storage queue) internal {
        _initialize(queue._inner);
    }

    /**
     * @dev Gets the number of elements in the queue. O(1)
     * @param queue Bytes32Queue struct from contract.
     */
    function length(Bytes32Queue storage queue) internal view returns (uint256) {
        return _length(queue._inner);
    }

    /**
     * @dev Returns if queue is empty. O(1)
     * @param queue Bytes32Queue struct from contract.
     */
    function isEmpty(Bytes32Queue storage queue) internal view returns (bool) {
        return _isEmpty(queue._inner);
    }

    /**
     * @dev Adds an element to the back of the queue. O(1)
     * @param queue Bytes32Queue struct from contract.
     * @param data The added element's data.
     */
    function enqueue(Bytes32Queue storage queue, bytes32 data) internal {
        _enqueue(queue._inner, data);
    }

    /**
     * @dev Removes an element from the front of the queue and returns it. O(1)
     * @param queue Bytes32Queue struct from contract.
     */
    function dequeue(Bytes32Queue storage queue) internal returns (bytes32 data) {
        return _dequeue(queue._inner);
    }

    /**
     * @dev Returns the data from the front of the queue, without removing it. O(1)
     * @param queue Bytes32Queue struct from contract.
     */
    function peek(Bytes32Queue storage queue) internal view returns (bytes32 data) {
        return _peek(queue._inner);
    }

    /**
     * @dev Returns the data from the back of the queue. O(1)
     * @param queue Bytes32Queue struct from contract.
     */
    function peekLast(Bytes32Queue storage queue) internal view returns (bytes32 data) {
        return _peekLast(queue._inner);
    }

    // AddressQueue

    struct AddressQueue {
        QueueStorage _inner;
    }

    /**
     * @dev Sets the queue's initial state, with a queue size of 0.
     * @param queue AddressQueue struct from contract.
     */
    function initialize(AddressQueue storage queue) internal {
        _initialize(queue._inner);
    }

    /**
     * @dev Gets the number of elements in the queue. O(1)
     * @param queue AddressQueue struct from contract.
     */
    function length(AddressQueue storage queue) internal view returns (uint256) {
        return _length(queue._inner);
    }

    /**
     * @dev Returns if queue is empty. O(1)
     * @param queue AddressQueue struct from contract.
     */
    function isEmpty(AddressQueue storage queue) internal view returns (bool) {
        return _isEmpty(queue._inner);
    }

    /**
     * @dev Adds an element to the back of the queue. O(1)
     * @param queue AddressQueue struct from contract.
     * @param data The added element's data.
     */
    function enqueue(AddressQueue storage queue, address data) internal {
        _enqueue(queue._inner, bytes32(uint256(uint160(data))));
    }

    /**
     * @dev Removes an element from the front of the queue and returns it. O(1)
     * @param queue AddressQueue struct from contract.
     */
    function dequeue(AddressQueue storage queue) internal returns (address data) {
        return address(uint160(uint256(_dequeue(queue._inner))));
    }

    /**
     * @dev Returns the data from the front of the queue, without removing it. O(1)
     * @param queue AddressQueue struct from contract.
     */
    function peek(AddressQueue storage queue) internal view returns (address data) {
        return address(uint160(uint256(_peek(queue._inner))));
    }

    /**
     * @dev Returns the data from the back of the queue. O(1)
     * @param queue AddressQueue struct from contract.
     */
    function peekLast(AddressQueue storage queue) internal view returns (address data) {
        return address(uint160(uint256(_peekLast(queue._inner))));
    }

    // Uint256Queue
    struct Uint256Queue {
        QueueStorage _inner;
    }

    /**
     * @dev Sets the queue's initial state, with a queue size of 0.
     * @param queue Uint256Queue struct from contract.
     */
    function initialize(Uint256Queue storage queue) internal {
        _initialize(queue._inner);
    }

    /**
     * @dev Gets the number of elements in the queue. O(1)
     * @param queue Uint256Queue struct from contract.
     */
    function length(Uint256Queue storage queue) internal view returns (uint256) {
        return _length(queue._inner);
    }

    /**
     * @dev Returns if queue is empty. O(1)
     * @param queue Uint256Queue struct from contract.
     */
    function isEmpty(Uint256Queue storage queue) internal view returns (bool) {
        return _isEmpty(queue._inner);
    }

    /**
     * @dev Adds an element to the back of the queue. O(1)
     * @param queue Uint256Queue struct from contract.
     * @param data The added element's data.
     */
    function enqueue(Uint256Queue storage queue, uint256 data) internal {
        _enqueue(queue._inner, bytes32(data));
    }

    /**
     * @dev Removes an element from the front of the queue and returns it. O(1)
     * @param queue Uint256Queue struct from contract.
     */
    function dequeue(Uint256Queue storage queue) internal returns (uint256 data) {
        return uint256(_dequeue(queue._inner));
    }

    /**
     * @dev Returns the data from the front of the queue, without removing it. O(1)
     * @param queue Uint256Queue struct from contract.
     */
    function peek(Uint256Queue storage queue) internal view returns (uint256 data) {
        return uint256(_peek(queue._inner));
    }

    /**
     * @dev Returns the data from the back of the queue. O(1)
     * @param queue Uint256Queue struct from contract.
     */
    function peekLast(Uint256Queue storage queue) internal view returns (uint256 data) {
        return uint256(_peekLast(queue._inner));
    }


    // struct MetaRequestQueue {
    //     mapping (uint256 => Uint256Queue) _data;
    //     uint256 _first;
    //     uint256 _last;
    // }

    // modifier isMetaNotEmpty(MetaRequestQueue storage queue) {
    //     require(!isMetaEmpty(queue), "Queue is empty.");
    //     _;
    // }

    // function metaInitialize(MetaRequestQueue storage queue) internal {
    //     queue._first = 1;
    //     queue._last = 0;
    // }
    
    // function isMetaEmpty(MetaRequestQueue storage queue) public view returns (bool) {
    //     return metaLength(queue) == 0;
    // }

    // function metaLength(MetaRequestQueue storage queue) public view returns (uint256) {
    //     if (queue._last < queue._first) {
    //         return 0;
    //     }
    //     return queue._last - queue._first + 1;
    // }

    // function metaEnqueue(MetaRequestQueue storage queue, Uint256Queue storage data) external {
    //     queue._data[++queue._last] = data;
    // }

    // function metaDequeue(MetaRequestQueue storage queue) external isMetaNotEmpty(queue) returns (Uint256Queue memory data) {
    //     data = queue._data[queue._first];
    //     delete queue._data[queue._first++];
    // } 

    // function metaPeek(MetaRequestQueue storage queue) external view returns (Uint256Queue memory data) {
    //     return queue._data[queue._first];
    // }

    // function metaPeekLast(MetaRequestQueue storage queue) external view isMetaNotEmpty(queue) returns (Uint256Queue memory data) {
    //     return queue._data[queue._last];
    // }

}






contract RequestQueue {
    // Max length of 32
    using Queue for Queue.Uint256Queue;
    // using Queue for Queue.MetaRequestQueue;

    Queue.Uint256Queue private _requestQueue;
    // Queue.MetaRequestQueue private _metaQueue;

    event OperationResult(uint256 data);

    constructor() {
        _requestQueue.initialize();
        // _metaQueue.MetaInitialize();
    }


    function length() public view returns (uint256) {
        return _requestQueue.length();
    }

    function isEmpty() public view returns (bool) {
        return _requestQueue.isEmpty();
    }

    function enqueue(uint256 data) public {
        _requestQueue.enqueue(data);
        if (_requestQueue.length() == 320) {
            revert("RequestQueue cannot exceed 32 length.");
        }
    }

    function dequeue() public returns (uint256 data) {
        data = _requestQueue.dequeue();
        emit OperationResult(data);
    }

    function peek() public view returns (uint256 data) {
        return _requestQueue.peek();
    }

    function peekLast() public view returns (uint256 data) {
        return _requestQueue.peekLast();
    }

    
}