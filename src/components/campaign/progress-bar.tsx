import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  max,
  className,
  showLabel = false,
  labelPrefix = "",
}: {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  labelPrefix?: string;
}) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>{labelPrefix}</span>
          <span className="font-semibold text-emerald-400">{percentage}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-navy-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-500 ease-out shadow-glow"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
