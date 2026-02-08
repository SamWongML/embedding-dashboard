"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-(--form-item-gap) [font-size:var(--label-font-size)] [line-height:var(--label-line-height)] [font-weight:var(--label-font-weight)] select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-(--opacity-disabled) peer-disabled:cursor-not-allowed peer-disabled:opacity-(--opacity-disabled)",
        className
      )}
      {...props}
    />
  )
}

export { Label }
