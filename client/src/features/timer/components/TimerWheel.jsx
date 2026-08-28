/**
 * TimerWheel — SVG Circular countdown and progress wheel.
 *
 * Props:
 *  displayTime     — Formatted time string (e.g. "24:59" or "01:23:45")
 *  progressPercent — Progress percentage (0 to 100)
 *  mode            — 'pomodoro' | 'stopwatch'
 *  phase           — 'work' | 'shortBreak' | 'longBreak'
 *  status          — 'idle' | 'running' | 'paused'
 *  size            — Circle diameter in pixels (default: 280)
 */
export default function TimerWheel({
  displayTime,
  progressPercent = 0,
  mode = 'pomodoro',
  phase = 'work',
  status = 'idle',
  size = 280,
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

  // Phase & mode color accents
  const getColor = () => {
    if (mode === 'stopwatch') return '#F59E0B'; // Amber
    switch (phase) {
      case 'shortBreak':
        return '#10B981'; // Emerald
      case 'longBreak':
        return '#8B5CF6'; // Purple
      case 'work':
      default:
        return '#06B6D4'; // Cyan
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
      {/* SVG Circular Ring */}
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-800"
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
            filter: status === 'running' ? `drop-shadow(0 0 8px ${ringColor}60)` : 'none',
          }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {/* Phase Pill */}
        <span
          className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1 transition-colors"
          style={{
            backgroundColor: `${ringColor}20`,
            color: ringColor,
          }}
        >
          {getPhaseLabel()}
        </span>

        {/* Digital Time Readout */}
        <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-surface-100">
          {displayTime}
        </span>

        {/* Status indicator */}
        <span className="text-xs text-surface-500 font-medium mt-1 uppercase tracking-wider">
          {status === 'running' ? '● Running' : status === 'paused' ? '❚❚ Paused' : 'Ready'}
        </span>
      </div>
    </div>
  );
}
