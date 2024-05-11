
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { CSSProperties, ReactNode } from "react"
import { twMerge } from "tailwind-merge"

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
)

export function ScrollComponent({ children, className, style, orientation }:{ children:ReactNode, className?:string, style?:CSSProperties, orientation?:'horizontal' }) {
  return (
    <ScrollArea className={twMerge("rounded-md border", className)} style={style} >
      { children }
      {orientation && <ScrollBar orientation="horizontal" />}
    </ScrollArea>
  )
}
