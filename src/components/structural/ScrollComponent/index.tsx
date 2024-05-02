
import { ScrollArea } from "@/components/ui/scroll-area"
import { CSSProperties, ReactNode } from "react"
import { twMerge } from "tailwind-merge"

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
)

export function ScrollComponent({ children, className, style }:{ children:ReactNode, className?:string, style?:CSSProperties }) {
  return (
    <ScrollArea className={twMerge("h-72 w-48 rounded-md border", className)} style={style} >
      { children }
    </ScrollArea>
  )
}
