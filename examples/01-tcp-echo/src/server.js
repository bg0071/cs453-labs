import net from "node:net";
import { formatEchoResponse, isQuitCommand } from "./echo.js";

const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number(process.env.PORT ?? 3000);

const server = net.createServer((socket) => {
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;

  console.log(`Client connected: ${clientAddress}`);

  socket.setEncoding("utf8");

  socket.write("Welcome to the CS453 echo server.\n");
  socket.write("Type a message and press Enter. Type QUIT to disconnect.\n");

  socket.on("data", (data) => {
    const message = data.trim();

    console.log(`Received from ${clientAddress}: ${message}`);

    if (isQuitCommand(message)) {
      socket.write("Goodbye.\n");
      socket.end();
      return;
    }

    socket.write(`${formatEchoResponse(message)}\n`);
  });

  socket.on("end", () => {
    console.log(`Client disconnected: ${clientAddress}`);
  });

  socket.on("error", (err) => {
    console.error(`Socket error from ${clientAddress}:`, err.message);
  });
});

server.on("error", (err) => {
  console.error("Server error:", err.message);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`Echo server listening on ${HOST}:${PORT}`);
});
