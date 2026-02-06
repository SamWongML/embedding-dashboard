'use strict'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WebSocketManager, getWebSocketManager } from '@/lib/api/websocket'

class MockWebSocket {
  static OPEN = 1
  static instances: MockWebSocket[] = []
  readyState = MockWebSocket.OPEN
  url: string
  onopen: (() => void) | null = null
  onclose: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onerror: (() => void) | null = null
  send = vi.fn()
  close = vi.fn(() => {
    this.readyState = 3
    this.onclose?.()
  })

  constructor(url: string) {
    this.url = url
    MockWebSocket.instances.push(this)
  }
}

describe('WebSocketManager', () => {
  const ORIGINAL_ENV = process.env
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)

  beforeEach(() => {
    MockWebSocket.instances = []
    process.env = { ...ORIGINAL_ENV, NEXT_PUBLIC_ENABLE_REALTIME: 'true' }
    vi.stubGlobal('WebSocket', MockWebSocket as any)
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
    warnSpy.mockReset()
    infoSpy.mockReset()
    vi.unstubAllGlobals()
  })

  it('connects and sends messages', () => {
    const manager = new WebSocketManager('ws://example.com')
    manager.connect()

    expect(MockWebSocket.instances[0]?.url).toBe('ws://example.com')
    manager.send('ping', { ok: true })
    expect(MockWebSocket.instances[0].send).toHaveBeenCalled()
  })

  it('dispatches messages to subscribers', () => {
    const manager = new WebSocketManager('ws://example.com')
    const handler = vi.fn()
    manager.subscribe('ping', handler)
    manager.connect()

    const instance = MockWebSocket.instances[0]
    instance.onmessage?.({ data: JSON.stringify({ type: 'ping', data: { ok: true } }) })

    expect(handler).toHaveBeenCalledWith({ ok: true })
  })

  it('reconnects after unexpected close', () => {
    vi.useFakeTimers()
    const manager = new WebSocketManager('ws://example.com')
    manager.connect()

    const instance = MockWebSocket.instances[0]
    instance.close()

    vi.advanceTimersByTime(2000)
    expect(MockWebSocket.instances.length).toBeGreaterThanOrEqual(2)
    vi.useRealTimers()
  })

  it('warns when sending while disconnected', () => {
    const manager = new WebSocketManager('ws://example.com')
    manager.disconnect()
    manager.send('ping', { ok: true })
    expect(warnSpy).toHaveBeenCalled()
  })

  it('throws when used on the server', () => {
    const originalWindow = (globalThis as any).window
    vi.stubGlobal('window', undefined)
    expect(() => getWebSocketManager()).toThrow('WebSocketManager can only be used in the browser')
    vi.stubGlobal('window', originalWindow)
  })
})
