/**
Application : ants-demo
Description : 人流クラウド化の導通試験用プログラム
Version : 1.0.0
Dependencies : node.js + Express + Socket.io
Auther : Magosa
**/

const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const http = require('http').Server(app);
const fs = require('fs');
const front_io = require('socket.io')(http);
const backend_io = require('socket.io-client')('http://52.68.63.131:8080');
const PORT = process.env.PORT || 80;


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  next();
});

app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(bodyparser.json());

app.options('*', (req, res) => {
  res.sendStatus(200);
});

app.use(express.static(__dirname + '/'));

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

backend_io.on('connect', () => {
  console.log('websocket router connect!');
  backend_io.on('routing_data', sensor_data => {
    front_io.emit('sensor_data', sensor_data);
  });
});

http.listen(PORT, () => {
  console.log("server listening. Port:" + PORT);
});
