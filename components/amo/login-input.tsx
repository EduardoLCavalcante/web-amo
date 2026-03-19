"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoginInputProps extends React.ComponentProps<"input"> {
  label?: string
}

export function LoginInput({ className, type, ...props }: LoginInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === "password"

  return (
    <div className="relative w-full">
      <input
        type={isPassword && showPassword ? "text" : type}
        className={cn(
          "h-14 w-full rounded-2xl border-2 border-white/30 bg-white/20 px-5 text-white placeholder:text-white/80 backdrop-blur-sm transition-all",
          "focus:border-white/50 focus:outline-none focus:ring-0",
          "text-base md:text-lg",
          isPassword && "pr-12",
          className
        )}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
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
