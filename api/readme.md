# Backend Server

> made with express x ethers

## Utils

> for testing only

### Postman Payloads

> POST to http://localhost:8081/poker/${lobbyId}

---

Create a Lobby

```js
{
    "action": {
        "type": "create"
        "inputs": {
            "maxPlayers": 2,
            "minBet": 1
        }
    },
    "player": {
        "address":'0x...',
        "signature": '1`2312sad...',
        "message": 'test'
    }
}

```

---

Autoplay a match (w/o contract)

```js
{
    "action": {
        "type": "auto",
        "inputs": {}
    },
    "player": {
        "address":'0x...',
        "signature": '1`2312sad...',
        "message": 'test'
    }
}
```
