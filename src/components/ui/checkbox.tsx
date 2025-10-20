import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox }