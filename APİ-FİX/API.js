const express = require("express");
const { UserController } = require("./src/API/User");
const bodyParser = require("body-parser");
const basicAuth = require("express-basic-auth");

class App {
  constructor(port, client) {
    this.app = express();
    this.client = client;
    this.port = port || 1555;
    this.config();
    this.userController = new UserController(this.app, this.client);
  }

  config() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));

  }

  startServer() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
    });
  }
}

module.exports = { App };
