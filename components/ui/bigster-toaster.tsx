"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const BigsterToaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group toast rounded-none bg-bigster-surface border border-bigster-border shadow-bigster-card w-full p-4 flex items-start gap-3 pointer-events-auto",
          title: "text-[15px] font-semibold text-bigster-text leading-tight",
          description: "text-sm text-bigster-text-muted mt-1 leading-snug",
          actionButton:
            "rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity ml-auto shrink-0",
          cancelButton:
            "rounded-none bg-bigster-surface text-bigster-text border border-bigster-border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors ml-2 shrink-0",
          closeButton:
            "rounded-none bg-transparent border-none text-bigster-text-muted hover:text-bigster-text transition-colors absolute right-2 top-2 p-1",
          success: "border-l-4 border-l-green-500 bg-bigster-surface",
          error: "border-l-4 border-l-red-500 bg-bigster-surface",
          info: "border-l-4 border-l-blue-500 bg-bigster-surface",
          warning: "border-l-4 border-l-yellow-500 bg-bigster-surface",
        },
      }}
      {...props}
    />
  );
};

export { BigsterToaster };
