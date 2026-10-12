"use client"

import { ChevronDown } from "lucide-react"
import { useId, useRef, useState, type KeyboardEvent } from "react"

// The FAQ disclosure list, written out instead of Radix Accordion so the
// landing page does not ship Radix primitives and tailwind-merge for it. Same
// pattern and semantics as before: each question is a button inside an h3
// with aria-expanded and aria-controls, each answer a labelled region, any
// number open at once, Arrow Up/Down and Home/End move between questions.
// Every answer is in the server HTML; closed ones are hidden only when
// scripts run, so with JavaScript off every answer is readable.
export default function FaqList({ items }: { items: readonly { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set())
  const list = useRef<HTMLDivElement>(null)
  const id = useId()

  const toggle = (index: number) =>
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const triggers = Array.from(list.current?.querySelectorAll<HTMLButtonElement>("[data-faq-trigger]") ?? [])
    const at = triggers.indexOf(document.activeElement as HTMLButtonElement)
    if (at === -1) return
    const target = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: triggers.length - 1 }[event.key]
    if (target === undefined) return
    event.preventDefault()
    triggers[(target + triggers.length) % triggers.length]?.focus()
  }

  return (
    <div ref={list} onKeyDown={onKeyDown} className="border-t lg:col-span-7 lg:col-start-6">
      {items.map((item, index) => {
        const isOpen = open.has(index)
        const state = isOpen ? "open" : "closed"
        return (
          <div key={item.question} data-state={state} className="border-b last:border-b-0">
            <h3 className="flex">
              <button
                type="button"
                id={`${id}-q${index}`}
                data-faq-trigger
                data-state={state}
                aria-expanded={isOpen}
                aria-controls={`${id}-a${index}`}
                onClick={() => toggle(index)}
                className="flex flex-1 items-start justify-between gap-4 rounded-md py-5 text-left text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring [&[data-state=open]>svg]:rotate-180"
              >
                {item.question}
                <ChevronDown aria-hidden="true" className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200" />
              </button>
            </h3>
            <div
              id={`${id}-a${index}`}
              role="region"
              aria-labelledby={`${id}-q${index}`}
              data-state={state}
              className="grid text-sm data-[state=open]:animate-faq-open [@media(scripting:enabled)]:data-[state=closed]:hidden"
            >
              <div className="min-h-0 overflow-hidden">
                <div className="max-w-[62ch] pb-5 text-base text-muted-foreground">{item.answer}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
