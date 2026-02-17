import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

// In dev, Vite proxies /socket.io to the backend.
// In production, the server serves both the app and socket.io on the same origin.
const SOCKET_URL =
  import.meta.env.DEV
    ? `http://${window.location.hostname}:3001`
    : window.location.origin;

let sharedSocket: Socket | null = null;

function getSocket(): Socket {
  if (!sharedSocket) {
    sharedSocket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
  }
  return sharedSocket;
}

/**
 * Subscribe to one or more Socket.IO events.
 * The callback is called whenever any of the events fire.
 */
export function useSocket(events: string | string[], callback: () => void) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    const socket = getSocket();
    const evts = Array.isArray(events) ? events : [events];

    const handler = () => cbRef.current();
    evts.forEach((e) => socket.on(e, handler));

    return () => {
      evts.forEach((e) => socket.off(e, handler));
    };
  }, [events]);
}
