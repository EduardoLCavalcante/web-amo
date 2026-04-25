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
  id,
  ...props
}: ProfessorRegisterInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const generatedId = React.useId()
  const inputId = id ?? (label ? generatedId : undefined)

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[#546E7A] pl-1"
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          id={inputId}
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
