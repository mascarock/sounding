import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]",
  {
    variants: {
      variant: {
        foam: "border-foam/40 text-foam",
        cream: "border-cream/40 text-cream",
        brass: "border-brass/50 text-brass",
        signal: "border-signal text-signal",
      },
    },
    defaultVariants: { variant: "foam" },
  },
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
