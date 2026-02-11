import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

export const buttonBaseInteractionClassName =
  "disabled:pointer-events-none disabled:opacity-(--opacity-disabled) outline-none"
export const buttonFocusRingClassName =
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-(--ring-width)"
export const buttonIconChildClassName =
  "shrink-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--icon-sm)"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-(--button-gap) whitespace-nowrap [font-size:var(--button-font-size)] [line-height:var(--button-line-height)] [font-weight:var(--button-font-weight)] transition-all aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    buttonBaseInteractionClassName,
    buttonFocusRingClassName,
    buttonIconChildClassName,
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-(--button-height-md) px-(--button-padding-x-md) py-(--space-sm) has-[>svg]:px-(--button-padding-x-sm)",
        xs: "h-(--button-height-xs) gap-(--button-gap-xs) px-(--button-padding-x-xs) text-xs has-[>svg]:px-(--dropdown-item-padding-y) [&_svg:not([class*='size-'])]:size-(--icon-xs)",
        sm: "h-(--button-height-sm) gap-(--button-gap-sm) px-(--button-padding-x-sm) has-[>svg]:px-(--dropdown-item-padding-x)",
        lg: "h-(--button-height-lg) px-(--button-padding-x-lg) has-[>svg]:px-(--button-padding-x-md)",
        icon: "size-(--button-height-md)",
        "icon-xs": "size-(--button-height-xs) [&_svg:not([class*='size-'])]:size-(--icon-xs)",
        "icon-sm": "size-(--button-height-sm)",
        "icon-lg": "size-(--button-height-lg)",
      },
      shape: {
        square: "rounded-(--button-radius-square)",
        circle: "rounded-(--button-radius-circle)",
      },
    },
    compoundVariants: [
      {
        shape: "circle",
        size: "icon",
        className: "p-0",
      },
      {
        shape: "circle",
        size: "icon-xs",
        className: "p-0",
      },
      {
        shape: "circle",
        size: "icon-sm",
        className: "p-0",
      },
      {
        shape: "circle",
        size: "icon-lg",
        className: "p-0",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "square",
    },
  }
)

type ButtonVariantProps = VariantProps<typeof buttonVariants>
type ButtonSize = NonNullable<ButtonVariantProps["size"]>
type ButtonShape = NonNullable<ButtonVariantProps["shape"]>
type IconButtonSize = Extract<ButtonSize, "icon" | "icon-xs" | "icon-sm" | "icon-lg">

const iconButtonSizes: ReadonlySet<ButtonSize> = new Set([
  "icon",
  "icon-xs",
  "icon-sm",
  "icon-lg",
])

type ButtonShapeConstraints =
  | {
      shape?: "square"
      size?: ButtonSize
    }
  | {
      shape: "circle"
      size: IconButtonSize
    }

type ButtonProps = React.ComponentProps<"button"> &
  Omit<ButtonVariantProps, "shape" | "size"> &
  ButtonShapeConstraints & {
    asChild?: boolean
  }

type IconButtonAccessibleName =
  | {
      "aria-label": string
      "aria-labelledby"?: never
    }
  | {
      "aria-label"?: never
      "aria-labelledby": string
    }

type IconButtonProps = Omit<ButtonProps, "size" | "aria-label" | "aria-labelledby"> &
  IconButtonAccessibleName & {
    size?: IconButtonSize
    shape?: ButtonShape
  }

function hasExplicitAccessibleName(
  props: Pick<React.ComponentProps<"button">, "aria-label" | "aria-labelledby">
) {
  return Boolean(props["aria-label"]?.trim() || props["aria-labelledby"]?.trim())
}

function Button({
  className,
  variant = "default",
  size = "default",
  shape = "square",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  const isCircle = shape === "circle"
  const supportsCircle = iconButtonSizes.has(size)
  const effectiveShape = isCircle && !supportsCircle ? "square" : shape

  if (
    process.env.NODE_ENV !== "production" &&
    isCircle &&
    !supportsCircle
  ) {
    console.warn(
      '[Button] `shape="circle"` only supports icon sizes (`icon`, `icon-xs`, `icon-sm`, `icon-lg`). Falling back to `shape="square"`.'
    )
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-shape={effectiveShape}
      className={cn(buttonVariants({ variant, size, shape: effectiveShape, className }))}
      {...props}
    />
  )
}

function IconButton({
  size = "icon",
  shape = "square",
  ...props
}: IconButtonProps) {
  if (
    process.env.NODE_ENV !== "production" &&
    !hasExplicitAccessibleName(props)
  ) {
    console.warn(
      "[IconButton] Missing accessible name. Provide `aria-label` or `aria-labelledby`."
    )
  }

  return <Button size={size} shape={shape} {...props} />
}

export { Button, IconButton, buttonVariants }
export type { ButtonProps, IconButtonProps, IconButtonSize }
