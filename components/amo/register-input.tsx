"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface RegisterInputProps extends React.ComponentProps<"input"> {
  label?: string
}

export function RegisterInput({ className, type, placeholder, ...props }: RegisterInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const isPassword = type === "password"

  return (
    <div className="relative w-full">
      <input
        type={isPassword && showPassword ? "text" : type}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "h-14 w-full rounded-[20px] border-2 bg-white px-5 text-[#0077B6] transition-all duration-200",
          "placeholder:text-[#48CAE4] placeholder:font-medium",
          "focus:outline-none focus:ring-0",
          isFocused
            ? "border-[#48CAE4] shadow-[0_0_0_3px_rgba(72,202,228,0.15)]"
            : "border-[#D0E8F2]",
          isPassword && "pr-12",
          className
        )}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#48CAE4] hover:text-[#0077B6] transition-colors duration-200"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? (
            <Eye className="h-5 w-5" />
          ) : (
            <EyeOff className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  )
}
