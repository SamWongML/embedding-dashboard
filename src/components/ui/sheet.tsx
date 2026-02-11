"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { IconButton } from "@/components/ui/button"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-(--z-modal) bg-[var(--overlay-bg)]",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  variant = "default",
  noOverlay = false,
  shadowPreset = "default",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  variant?: "default" | "geist-floating"
  noOverlay?: boolean
  shadowPreset?: "default" | "geist"
  showCloseButton?: boolean
}) {
  const isGeistFloating = variant === "geist-floating" && side === "right"
  const useGeistShadow = isGeistFloating || shadowPreset === "geist"

  return (
    <SheetPortal>
      {!noOverlay ? <SheetOverlay /> : null}
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed z-(--z-modal) flex flex-col gap-(--dialog-gap) transition ease-in-out will-change-transform data-[state=closed]:duration-(--duration-moderate) data-[state=open]:duration-(--duration-moderate)",
          side === "right" &&
            !isGeistFloating &&
            "data-[state=closed]:slide-out-to-right-10 data-[state=open]:slide-in-from-right-5 inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-[480px] overflow-y-auto",
          isGeistFloating &&
            "data-[state=closed]:slide-out-to-right-10 data-[state=open]:slide-in-from-right-5 inset-y-0 right-0 m-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] lg:w-[512px] sm:max-w-[none] rounded-[1rem] border-0 p-0 overflow-y-auto bg-[var(--sheet-geist-surface)]",
          useGeistShadow ? "shadow-[var(--sheet-geist-shadow)]" : "shadow-lg",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left-10 data-[state=open]:slide-in-from-left-5 inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top-10 data-[state=open]:slide-in-from-top-5 inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom-10 data-[state=open]:slide-in-from-bottom-5 inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close asChild>
            <IconButton
              data-slot="sheet-close"
              variant="ghost"
              size="icon-sm"
              aria-label="Close"
              className="data-[state=open]:bg-secondary absolute top-(--space-lg) right-(--space-lg) opacity-(--opacity-muted) transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <XIcon />
            </IconButton>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-(--sheet-gap) px-6 py-5 border-b border-border", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-(--form-item-gap) p-(--sheet-padding)", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function SheetSection({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="sheet-section"
      className={cn("space-y-3", className)}
      {...props}
    />
  )
}

function SheetSectionHeader({ className, ...props }: React.ComponentProps<"h4">) {
  return (
    <h4
      data-slot="sheet-section-header"
      className={cn("text-xs font-medium text-muted-foreground uppercase tracking-wider", className)}
      {...props}
    />
  )
}

interface SheetPropertyRowProps extends React.ComponentProps<"div"> {
  label: string
  value: React.ReactNode
  isLast?: boolean
}

function SheetPropertyRow({
  label,
  value,
  isLast = false,
  className,
  ...props
}: SheetPropertyRowProps) {
  return (
    <div
      data-slot="sheet-property-row"
      className={cn(
        "flex items-center justify-between py-3",
        !isLast && "border-b border-border/40",
        className
      )}
      {...props}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetSection,
  SheetSectionHeader,
  SheetPropertyRow,
}
