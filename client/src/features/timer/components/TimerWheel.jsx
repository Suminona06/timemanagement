/**
 * TimerWheel — SVG Circular countdown and progress wheel with ChronoCraft Lo-Fi branding.
 *
 * Props:
 *  displayTime     — Formatted time string (e.g. "24:59" or "01:23:45")
 *  progressPercent — Progress percentage (0 to 100)
 *  mode            — 'pomodoro' | 'stopwatch'
 *  phase           — 'work' | 'shortBreak' | 'longBreak'
 *  status          — 'idle' | 'running' | 'paused'
 *  size            — Circle diameter in pixels (default: 290)
 */
export default function TimerWheel({
  displayTime,
  progressPercent = 0,
  mode = 'pomodoro',
  phase = 'work',
  status = 'idle',
  size = 290,
}) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // In Pomodoro mode, stroke offset reflects countdown progress (100% full to 0% or vice versa)
  // In stopwatch mode, ring pulses or rotates smoothly
  const strokeDashoffset =
    mode === 'pomodoro'
      ? circumference - (progressPercent / 100) * circumference
      : status === 'running'
      ? 0
      : circumference;

  // Phase & mode color accents aligned with ChronoCraft Lo-Fi & Pastel System
  const getColor = () => {
    if (mode === 'stopwatch') return '#D4A373'; // Amber Sand
    switch (phase) {
      case 'shortBreak':
        return '#8DA780'; // Matcha Green
      case 'longBreak':
        return '#B8B8D1'; // Muted Lavender
      case 'work':
      default:
        return '#C88A58'; // Caramel Amber
    }
  };

  const ringColor = getColor();

  const getPhaseLabel = () => {
    if (mode === 'stopwatch') return 'Stopwatch';
    switch (phase) {
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      case 'work':
      default:
        return 'Focus Session';
    }
  };

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {/* Background Soft Glow */}
      {status === 'running' && (
        <div
          className="absolute inset-4 rounded-full filter blur-2xl opacity-20 pointer-events-none transition-all duration-500"
          style={{ backgroundColor: ringColor }}
        />
      )}

      {/* SVG Circular Ring */}
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-200 dark:text-surface-800"
          fill="transparent"
        />

        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className={`transition-all duration-500 ease-linear ${
            status === 'running' && mode === 'stopwatch' ? 'animate-pulse' : ''
          }`}
          style={{
            filter: status === 'running' ? `drop-shadow(0 0 10px ${ringColor}80)` : 'none',
          }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {/* Phase Pill */}
        <span
          className="text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full mb-1.5 transition-colors border"
          style={{
            backgroundColor: `${ringColor}18`,
            borderColor: `${ringColor}40`,
            color: ringColor,
          }}
        >
          {getPhaseLabel()}
        </span>

        {/* Digital Time Readout */}
        <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-surface-900 dark:text-surface-100 drop-shadow-sm">
          {displayTime}
        </span>

        {/* Status indicator */}
        <span className="text-[11px] text-surface-500 font-semibold mt-1.5 uppercase tracking-widest flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              status === 'running'
                ? 'bg-success-500 animate-ping'
                : status === 'paused'
                ? 'bg-warning-500'
                : 'bg-surface-400'
            }`}
          />
          {status === 'running' ? 'In Flow' : status === 'paused' ? 'Paused' : 'Ready'}
        </span>
      </div>
    </div>
  );
}
