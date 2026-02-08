import * as React from "react"

import {
  getSidebarViewportMode,
  type SidebarViewportMode,
} from "@/lib/layout/sidebar-mode"

export function useSidebarViewportMode() {
  const [viewportMode, setViewportMode] =
    React.useState<SidebarViewportMode>("extended")

  React.useEffect(() => {
    const onResize = () => {
      setViewportMode(getSidebarViewportMode(window.innerWidth))
    }

    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  return viewportMode
}
