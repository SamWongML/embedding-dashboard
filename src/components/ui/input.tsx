import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-(--input-height) w-full min-w-0 rounded-md border bg-transparent px-(--input-padding-x) py-(--input-padding-y) [font-size:var(--input-font-size)] [line-height:var(--input-line-height)] [font-weight:var(--input-font-weight)] shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:[font-size:var(--input-font-size)] file:[line-height:var(--input-line-height)] file:[font-weight:var(--input-font-weight)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-(--ring-width)",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
