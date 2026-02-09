import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-(--badge-padding-x) py-(--badge-padding-y) text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-(--icon-xs) gap-(--badge-gap) [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-(--ring-width) aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        // Geist subtle semantic color variants
        "blue-subtle":
          "bg-[oklch(0.95_0.02_250)] text-[oklch(0.45_0.12_250)] dark:bg-[oklch(0.25_0.04_250)] dark:text-[oklch(0.75_0.10_250)]",
        "gray-subtle":
          "bg-[oklch(0.95_0_0)] text-[oklch(0.45_0_0)] dark:bg-[oklch(0.25_0_0)] dark:text-[oklch(0.70_0_0)]",
        "green-subtle":
          "bg-[oklch(0.95_0.03_145)] text-[oklch(0.45_0.12_145)] dark:bg-[oklch(0.25_0.04_145)] dark:text-[oklch(0.75_0.10_145)]",
        "amber-subtle":
          "bg-[oklch(0.95_0.04_85)] text-[oklch(0.50_0.12_85)] dark:bg-[oklch(0.28_0.05_85)] dark:text-[oklch(0.78_0.10_85)]",
        "purple-subtle":
          "bg-[oklch(0.95_0.03_300)] text-[oklch(0.50_0.12_300)] dark:bg-[oklch(0.25_0.05_300)] dark:text-[oklch(0.75_0.10_300)]",
        "teal-subtle":
          "bg-[oklch(0.95_0.02_180)] text-[oklch(0.45_0.10_180)] dark:bg-[oklch(0.25_0.04_180)] dark:text-[oklch(0.75_0.08_180)]",
        "red-subtle":
          "bg-[oklch(0.95_0.03_25)] text-[oklch(0.50_0.15_25)] dark:bg-[oklch(0.28_0.06_25)] dark:text-[oklch(0.78_0.12_25)]",
        "cyan-subtle":
          "bg-[oklch(0.95_0.02_200)] text-[oklch(0.45_0.10_200)] dark:bg-[oklch(0.25_0.04_200)] dark:text-[oklch(0.75_0.08_200)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
