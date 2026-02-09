import * as React from "react"

import {
  getSidebarViewportMode,
  type SidebarViewportMode,
} from "@/lib/layout/sidebar-mode"

export function useSidebarViewportMode() {
  // Always start with "extended" to match SSR and avoid hydration mismatch
  const [viewportMode, setViewportMode] = React.useState<SidebarViewportMode>("extended")

  React.useEffect(() => {
    // Set the actual viewport mode after hydration
    setViewportMode(getSidebarViewportMode(window.innerWidth))

    const onResize = () => {
      setViewportMode(getSidebarViewportMode(window.innerWidth))
    }

    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  return viewportMode
}
