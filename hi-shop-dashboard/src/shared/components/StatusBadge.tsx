import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  colorMap: Record<string, string>;
  className?: string;
}

export const StatusBadge = ({ status, colorMap, className }: StatusBadgeProps) => {
  const color = colorMap[status] ?? "text-on-surface-variant bg-surface-container";
  return (
    <span
      className={cn(
        "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full",
        color,
        className
      )}
    >
      {status}
    </span>
  );
};
