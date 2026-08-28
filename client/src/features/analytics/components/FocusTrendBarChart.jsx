import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { formatMinutes } from '../../../utils/timeFormatters';

/**
 * Custom Tooltip for Focus Trend Bar Chart
 */
function CustomBarTooltip({ active, payload, dailyGoalHours }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isGoalMet = data.totalHours >= dailyGoalHours;

    return (
      <div className="bg-surface-850 p-2.5 rounded-xl border border-surface-700 shadow-xl text-xs space-y-1">
        <div className="font-semibold text-surface-100">
          {data.dayName}, {data.formattedDate}
        </div>
        <div className="text-surface-300">
          Focus Time: <strong className="text-primary-400">{data.totalHours} hrs</strong> ({formatMinutes(data.totalMinutes)})
        </div>
        {dailyGoalHours > 0 && (
          <div className={`text-[11px] font-medium ${isGoalMet ? 'text-success-400' : 'text-surface-400'}`}>
            {isGoalMet ? '✓ Daily Goal Met' : `Target: ${dailyGoalHours} hrs`}
          </div>
        )}
      </div>
    );
  }
  return null;
}

/**
 * FocusTrendBarChart — Daily focus hours bar chart comparing against daily goal target line.
 *
 * Props:
 *  data           — Array of daily trend objects [{ date, dayName, formattedDate, totalMinutes, totalHours }]
 *  dailyGoalHours — User's configured daily target (e.g. 8)
 */
export default function FocusTrendBarChart({ data = [], dailyGoalHours = 8 }) {
  const hasData = data && data.length > 0;

  return (
    <div className="card p-5 bg-surface-800 border-surface-700 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-surface-700/60">
        <h3 className="text-sm font-semibold text-surface-100 flex items-center gap-2">
          <BarChart3 size={16} className="text-primary-400" />
          Daily Focus Trend
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-surface-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary-500 inline-block" />
            Tracked Hours
          </span>
          {dailyGoalHours > 0 && (
            <span className="flex items-center gap-1 text-surface-400">
              <span className="w-3 border-t-2 border-dashed border-amber-400 inline-block" />
              Goal ({dailyGoalHours}h)
            </span>
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-12 text-surface-500 gap-2">
          <BarChart3 size={32} className="opacity-30" />
          <p className="text-xs">No trend data available for this range.</p>
        </div>
      ) : (
        <div className="w-full h-56 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
              <XAxis
                dataKey="dayName"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}h`}
              />
              <Tooltip
                content={<CustomBarTooltip dailyGoalHours={dailyGoalHours} />}
                cursor={{ fill: '#334155', opacity: 0.2 }}
              />
              {dailyGoalHours > 0 && (
                <ReferenceLine
                  y={dailyGoalHours}
                  stroke="#F59E0B"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
              )}
              <Bar
                dataKey="totalHours"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                maxBarSize={38}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
