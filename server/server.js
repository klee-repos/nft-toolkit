require("dotenv").config();
import express from "express";
var app = express();
var server = require("http").createServer(app);

import bodyParser from "body-parser";
app.use(bodyParser.json({ limit: "100mb" })); // support json encoded bodies
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true })); // support encoded bodies

// =========== ADD HEADERS ===========
app.use(function (req, res, next) {
  res.setHeader("Cache-Control", "max-age=0,no-cache,no-store,must-revalidate");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// =========== Routes ===========
import nft from './routes/nft';
app.use('/nft', nft);

// =========== SERVER ===========
server.listen(process.env.PORT || 8080, function () {
  console.info("Node server started");
});
