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
        "type": "create",
        "inputs": {
            "maxPlayers": 2,
            "minBet": 1
        }
    },
    "player": {
        "address":"0x05B84704B1F7df0BAaf80788EBDD8FD7ADD9A63d",
        "signature": "0x53244bd30bc2211653baac16ea8abcee00a90dd937815faf3bcf76fce8c16b0315f97401316aa9880c30eafdbb01bece6643bb892f6c15b1a67bd7c7207a266a1c",
        "message": "Example `personal_sign` message"
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
        "address":"0x05B84704B1F7df0BAaf80788EBDD8FD7ADD9A63d",
        "signature": "0x53244bd30bc2211653baac16ea8abcee00a90dd937815faf3bcf76fce8c16b0315f97401316aa9880c30eafdbb01bece6643bb892f6c15b1a67bd7c7207a266a1c",
        "message": "Example `personal_sign` message"
    }
}
```
