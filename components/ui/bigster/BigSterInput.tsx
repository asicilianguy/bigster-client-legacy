import * as React from "react";
import { cn } from "@/lib/utils";

export interface BigSterInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const BigSterInput = React.forwardRef<HTMLInputElement, BigSterInputProps>(
  ({ className, label, helperText, error, ...props }, ref) => {
    const inputId = React.useId();

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="bigster-label">
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            "bigster-input",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1 text-xs text-bigster-text-muted">{helperText}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
BigSterInput.displayName = "BigSterInput";

export { BigSterInput };
