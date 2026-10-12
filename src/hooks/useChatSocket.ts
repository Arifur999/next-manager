"use client"

import { useEffect, useRef } from "react"

/**
 * The live half of chat.
 *
 * Deliberately does almost nothing. The socket is a hint that something
 * changed, not a source of truth: every message it announces is already stored,
 * and the thread on screen comes from HTTP. So this hook's whole job is to tell
 * the caller "refetch" — which means a dropped connection degrades to a page
 * that is merely not live, never one that is missing messages.
 *
 * There is nothing to send. The server accepts no subscribe message and would
 * ignore one; what reaches this connection is decided by the database, from the
 * cookie proven on the handshake.
 *
 * Reconnects with a backoff that gives up climbing at 30s, because a server
 * that is down for a minute should not be hit every 200ms by every open tab.
 */
// nginx serves the socket at /ws on the page's own origin, which CSP
// connect-src 'self' allows. Only `next dev` (page on 3000, API on 5000) needs
// NEXT_PUBLIC_DEV_WS_URL; production images carry no API address at all.
const chatSocketUrl = () => {
    const devUrl = process.env.NODE_ENV === "development" ? process.env.NEXT_PUBLIC_DEV_WS_URL : undefined
    if (devUrl) return new URL(devUrl)

    const url = new URL("/ws", window.location.origin)
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
    return url
}

export const useChatSocket = (onEvent: (event: { type: string; conversation_id?: string }) => void) => {
    // Held in a ref so a changing callback never tears down the connection —
    // re-opening a socket on every render would be a reconnect storm. Written
    // in an effect rather than during render, which React forbids: a render can
    // be thrown away, and a ref written by one that was is a lie.
    const handler = useRef(onEvent)

    useEffect(() => {
        handler.current = onEvent
    }, [onEvent])

    useEffect(() => {
        const url = chatSocketUrl()

        let socket: WebSocket | null = null
        let retry: ReturnType<typeof setTimeout> | null = null
        let attempt = 0
        let closed = false

        const connect = () => {
            if (closed) return

            socket = new WebSocket(url.toString())

            socket.onopen = () => {
                attempt = 0
            }

            socket.onmessage = (event) => {
                try {
                    handler.current(JSON.parse(event.data))
                } catch {
                    // A frame we cannot read is not worth breaking the page
                    // over. The next refetch will pick up whatever it was.
                }
            }

            socket.onclose = () => {
                if (closed) return
                attempt += 1
                retry = setTimeout(connect, Math.min(1000 * 2 ** attempt, 30_000))
            }

            // onerror is always followed by onclose, which already schedules
            // the retry — handling it here too would double every backoff.
            socket.onerror = () => socket?.close()
        }

        connect()

        return () => {
            closed = true
            if (retry) clearTimeout(retry)
            socket?.close()
        }
    }, [])
}
