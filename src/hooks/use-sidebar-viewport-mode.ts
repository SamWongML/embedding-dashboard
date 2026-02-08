import * as React from "react"

import {
  getSidebarViewportMode,
  type SidebarViewportMode,
} from "@/lib/layout/sidebar-mode"

export function useSidebarViewportMode() {
  const [viewportMode, setViewportMode] = React.useState<SidebarViewportMode>(() => {
    if (typeof window === "undefined") {
      return "extended"
    }

    return getSidebarViewportMode(window.innerWidth)
  })

  React.useEffect(() => {
    const onResize = () => {
      setViewportMode(getSidebarViewportMode(window.innerWidth))
    }

    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  return viewportMode
}
