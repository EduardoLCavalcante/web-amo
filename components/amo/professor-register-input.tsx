"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProfessorRegisterInputProps extends React.ComponentProps<"input"> {
  label?: string
}

export function ProfessorRegisterInput({
  className,
  label,
  type = "text",
  placeholder,
  ...props
}: ProfessorRegisterInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)

  return (
    <div className="flex w-full items-center gap-3">
      {label && (
        <span className="w-[90px] shrink-0 text-right text-sm font-medium text-[#546E7A]">
          {label}
        </span>
      )}
      <div className="relative flex-1">
        <input
          type={type}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "h-12 w-full rounded-[20px] border-2 bg-white px-5 text-sm text-[#0077B6] transition-all duration-200",
            "placeholder:text-[#48CAE4]/80 placeholder:font-normal",
            "focus:outline-none focus:ring-0",
            isFocused
              ? "border-[#48CAE4] shadow-[0_0_0_3px_rgba(72,202,228,0.15)]"
              : "border-[#D0E8F2]",
            className
          )}
          {...props}
        />
      </div>
    </div>
  )
}
