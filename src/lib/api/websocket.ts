type MessageHandler = (data: unknown) => void
type ConnectionHandler = () => void

interface WebSocketMessage {
  type: string
  data: unknown
}

class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private reconnectDelay = 2000
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map()
  private connectionHandlers: Set<ConnectionHandler> = new Set()
  private disconnectionHandlers: Set<ConnectionHandler> = new Set()
  private isIntentionalClose = false
  private isEnabled = true

  constructor(url?: string) {
    this.url = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'
    // Disable WebSocket in development if no URL is configured
    this.isEnabled = process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true'
  }

  connect(): void {
    // Skip connection if disabled or already connected
    if (!this.isEnabled || this.ws?.readyState === WebSocket.OPEN) return

    // Don't retry if we've exhausted attempts
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (process.env.NODE_ENV === 'development') {
        console.info('[WebSocket] Max reconnection attempts reached. Real-time updates disabled.')
      }
      return
    }

    try {
      this.ws = new WebSocket(this.url)
      this.isIntentionalClose = false

      this.ws.onopen = () => {
        if (process.env.NODE_ENV === 'development') {
          console.info('[WebSocket] Connected')
        }
        this.reconnectAttempts = 0
        this.connectionHandlers.forEach((handler) => handler())
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          const handlers = this.messageHandlers.get(message.type)
          if (handlers) {
            handlers.forEach((handler) => handler(message.data))
          }
        } catch {
          // Silently ignore parse errors
        }
      }

      this.ws.onclose = () => {
        this.disconnectionHandlers.forEach((handler) => handler())

        if (!this.isIntentionalClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      }

      this.ws.onerror = () => {
        // Silently handle WebSocket errors - connection failures are expected
        // when no backend is running. The onclose handler will manage reconnection.
      }
    } catch {
      // Connection failed - will retry via scheduleReconnect if within limits
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect()
      }
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    if (process.env.NODE_ENV === 'development' && this.reconnectAttempts === 1) {
      console.info(`[WebSocket] Connection failed. Retrying...`)
    }
    setTimeout(() => this.connect(), delay)
  }

  disconnect(): void {
    this.isIntentionalClose = true
    this.ws?.close()
    this.ws = null
  }

  subscribe(messageType: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set())
    }
    this.messageHandlers.get(messageType)!.add(handler)

    return () => {
      this.messageHandlers.get(messageType)?.delete(handler)
    }
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler)
    return () => this.connectionHandlers.delete(handler)
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectionHandlers.add(handler)
    return () => this.disconnectionHandlers.delete(handler)
  }

  send(type: string, data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null

export function getWebSocketManager(): WebSocketManager {
  if (typeof window === 'undefined') {
    throw new Error('WebSocketManager can only be used in the browser')
  }

  if (!wsManager) {
    wsManager = new WebSocketManager()
  }

  return wsManager
}

export { WebSocketManager }
