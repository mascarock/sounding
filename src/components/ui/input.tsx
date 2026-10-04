import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-sm border border-cream/20 bg-water px-3 py-2 text-base text-cream shadow-none placeholder:text-foam/60 focus-visible:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
