import * as React from "react";
import { cn } from "../../lib/utils";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "lg" | "default";
  variant?: "default" | "outline" | "ghost";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "default", variant = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "px-3 py-1 text-sm",
      default: "px-4 py-2",
      lg: "px-6 py-3 text-lg"
    };
    
    const variantClasses = {
      default: "bg-blue-600 hover:bg-blue-700 text-white",
      outline: "border border-gray-300 hover:bg-gray-50",
      ghost: "hover:bg-gray-100"
    };
    
    return (
      <button 
        ref={ref} 
        className={cn(
          "rounded font-semibold transition-colors",
          sizeClasses[size],
          variantClasses[variant],
          className
        )} 
        {...props} 
      />
    );
  }
);
Button.displayName="Button";
