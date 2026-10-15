import { io } from "socket.io-client";

export function connectWorkoutSocket(accessToken) {
  const socketUrl =
    import.meta.env.VITE_SOCKET_URL ||
    "http://localhost:3000";

  return io(socketUrl, {
    auth: {
      token: accessToken,
    },
    autoConnect: false,
  });
}
