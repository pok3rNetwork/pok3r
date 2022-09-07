require("dotenv").config();
const port = 8001;
const url = process.env.CLIENT_URL;

const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

function configureApp() {
  const application = express();
  application.use(bodyParser.json());
  application.use(cors({ origin: url }));

  if (!fs.existsSync("./static")) fs.mkdirSync("./static");
  application.use("/static", express.static("static"));

  application.listen(port, () => {
    console.log("Server Started on Port:" + port);
  });
  return application;
}

const app = configureApp();

const welcomeMessage = "Hello World!";
app.get("/", (req, res) => {
  res.json({ welcomeMessage, url });
});
