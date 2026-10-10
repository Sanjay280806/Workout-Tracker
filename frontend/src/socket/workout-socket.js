import { io } from "socket.io-client";

export function connectWorkoutSocket(accessToken) {
    return io("http://localhost:3000", {
        auth: {
            token: accessToken
        }
    });
}
