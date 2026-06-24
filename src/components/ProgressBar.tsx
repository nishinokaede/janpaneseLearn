interface ProgressBarProps {
  mastered: number;
  total: number;
  showText?: boolean;
  className?: string;
}

export default function ProgressBar({ mastered, total, showText = true, className = '' }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        {showText && (
          <span className="text-xs text-gray-500 min-w-[4rem] text-right">
            {mastered}/{total}
          </span>
        )}
      </div>
    </div>
  );
}
