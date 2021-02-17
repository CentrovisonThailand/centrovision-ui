const express = require("express");
const serveStatic = require("serve-static");
const path = require("path");
var passport = require("passport");
var BasicStrategy = require("passport-http").BasicStrategy;
var cors = require("cors");

passport.use(
  new BasicStrategy({}, function(username, password, done) {
    var success = username === "centrovision" && password === "sennalabs";
    done(null, success);
  })
);

const app = express();
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});
app.use(passport.initialize());
app.use(passport.authenticate("basic", { session: false }));

//here we are configuring dist to serve app files
app.use("/", serveStatic(path.join(__dirname, "/dist")));

// this * route is to serve project on different page routes except root `/`
app.get(/.*/, function(req, res) {
  res.sendFile(path.join(__dirname, "/dist/index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port);
console.log(`app is listening on port: ${port}`);
