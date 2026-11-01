import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:3000";

export function connectWorkoutSocket(accessToken) {
  return io(SOCKET_URL, {
    autoConnect: false,
    auth: {
      token: accessToken,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
}