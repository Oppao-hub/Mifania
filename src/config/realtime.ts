/** Shared Socket.IO host — must match Mifania-Web SOCKET_PUBLIC_URL / socket-server deploy. */
export const SOCKET_URL = 'https://web-socket-production-29ca.up.railway.app';

/** Fallback poll interval when the socket is disconnected and a live-sync screen is open. */
export const LIVE_SYNC_POLL_MS = 15000;

/** Safety-net poll interval while the socket is connected (catches missed socket events). */
export const LIVE_SYNC_CONNECTED_POLL_MS = 15000;

/** Faster polling for order screens where status must feel instant. */
export const LIVE_SYNC_ORDER_POLL_MS = 10000;
