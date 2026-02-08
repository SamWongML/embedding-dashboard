export const SIDEBAR_STATE_COOKIE_NAME = "sidebar_state"

export function parseSidebarOpenCookie(value?: string): boolean {
  return value !== "false"
}
