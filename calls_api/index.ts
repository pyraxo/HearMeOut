import { createServer } from "http";
import express from "express";
import { ExpressPeerServer } from "peer";

require("dotenv").config();

const server = createServer(function (req, res) {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello world!");
});

const PORT = 9000;

const app = express();

app.use(express.static("public"));

const peerServer = ExpressPeerServer(server, {
  allow_discovery: true,
  corsOptions: {
    origin: "*",
  },
});

app.use("/discovery", peerServer);

server.listen(PORT, () => {
  console.log(`PeerJS server running on port ${PORT}`);
});
