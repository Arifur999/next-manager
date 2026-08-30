"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      // overflow-hidden so the corners actually clip, and so nothing can paint
      // outside the box even if the viewport below is ever left unconstrained.
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        // max-h-[inherit] is what makes `<ScrollArea className="max-h-96">`
        // mean what everyone here assumed it meant.
        //
        // The viewport is size-full, i.e. height:100%. A percentage height
        // resolves against the PARENT'S HEIGHT, and a parent carrying only a
        // max-height still computes height:auto - so 100% resolved to auto and
        // the viewport grew to its content instead of to the box. A 384px
        // notification panel held a 1211px viewport, which then never scrolled
        // (scrollHeight === clientHeight) and simply painted through the card.
        //
        // Inheriting the max-height binds the viewport to the same ceiling the
        // caller set, so Radix's overflow:scroll finally has something to
        // scroll against. Short content is untouched: the ceiling does not
        // bind, and no scrollbar appears.
        className="size-full max-h-[inherit] rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
