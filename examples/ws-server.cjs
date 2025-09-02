// Tiny ws echo server to view events
const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({ port: 8080 });
wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    console.log("event:", msg.toString());
    ws.send("ack");
  });
});
console.log("WS server on ws://localhost:8080");
