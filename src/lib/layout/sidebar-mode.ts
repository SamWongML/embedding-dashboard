export const SIDEBAR_MEDIUM_MIN_WIDTH = 768
export const SIDEBAR_EXTENDED_MIN_WIDTH = 1280

export type SidebarViewportMode = "limited" | "medium" | "extended"

export function getSidebarViewportMode(width: number): SidebarViewportMode {
  if (width < SIDEBAR_MEDIUM_MIN_WIDTH) {
    return "limited"
  }

  if (width < SIDEBAR_EXTENDED_MIN_WIDTH) {
    return "medium"
  }

  return "extended"
}
