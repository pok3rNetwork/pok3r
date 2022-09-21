require('dotenv').config();
const port = process.env.API_PORT ? process.env.API_PORT : 8081;
const localClient = `http://localhost:3000/`;
const frontendUrl = process.env.CLIENT_URL
  ? process.env.CLIENT_URL
  : localClient;

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const initApp = (root) => {
  console.log(root);
  let server = express();
  server.use(bodyParser.json());

  if (!fs.existsSync(`${root}/static/lobbies`))
    fs.mkdirSync(`${root}/static/lobbies`, { recursive: true });

  if (frontendUrl == localClient)
    server.use('/static', express.static('static'));
  else server.use(cors({ origin: frontendUrl }));

  server.get('/', (req, res) => res.json(frontendUrl));

  return server;
};

module.exports = { port, localClient, frontendUrl, initApp };
