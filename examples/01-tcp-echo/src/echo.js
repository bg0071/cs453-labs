export function formatEchoResponse(message) {
  return `Echo: ${message}`;
}

export function isQuitCommand(message) {
  return message.trim().toUpperCase() === "QUIT";
}
