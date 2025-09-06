import * as React from "react";
import { cn } from "@/lib/utils";
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button ref={ref} className={cn("px-4 py-2 rounded font-semibold", className)} {...props} />
));
Button.displayName="Button";
