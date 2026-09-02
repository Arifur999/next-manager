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
        // The socket shares the API's origin, so it is derived from the same
        // env var rather than configured twice and left to disagree.
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1"
        const url = new URL(base)
        url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
        url.pathname = "/ws"
        url.search = ""

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
