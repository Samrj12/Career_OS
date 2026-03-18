import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[2px] bg-[var(--paper-alt)]",
        "bg-gradient-to-r from-[var(--paper-alt)] via-[var(--paper)] to-[var(--paper-alt)]",
        "bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
