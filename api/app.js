require('dotenv').config();
const port = process.env.PORT ? process.env.PORT : 8081; // env?
const url = process.env.CLIENT_URL
  ? process.env.CLIENT_URL
  : `http://localhost:${port}/poker/`;

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { routeGame } = require('./poker/route.js');

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: url }));

if (!fs.existsSync('./static')) fs.mkdirSync('./static');
app.use('/static', express.static('static'));

app.listen(port, () => {
  console.log('Server Started on Port:' + port);
});

app.get('/', (req, res) => {
  res.json({ welcomeMessage: 'Hello World!', url });
});

routeGame(app, __dirname);
