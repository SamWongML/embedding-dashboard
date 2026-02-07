export { api, ApiError, API_BASE_URL } from './client'
export { queryKeys } from './query-keys'
export { getWebSocketManager, WebSocketManager } from './websocket'
export {
  toActionErrorMessage,
  toNoOpActionMessage,
} from './error-feedback'
export {
  isDemoDataEnabled,
  isMockDataEnabled,
  resolveApiState,
  toAppError,
} from './state'
export type { ApiState, AppError } from './state'
