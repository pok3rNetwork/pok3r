require('dotenv').config();
const port = process.env.API_PORT ? process.env.API_PORT : 8081;
const url = process.env.CLIENT_URL
  ? process.env.CLIENT_URL
  : `http://localhost:${port}/poker/`;

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const poker = require('./poker/route.js');

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: url }));

if (!fs.existsSync(`${__dirname}/static/lobbies`))
  fs.mkdirSync(`${__dirname}/static/lobbies`, { recursive: true });
app.use('/static', express.static('static'));

app.listen(port, () => {
  console.log('Server Started on Port:' + port);
});

app.get('/', (req, res) => {
  res.json({ welcomeMessage: 'Hello World!', url });
});

poker(app, __dirname);
