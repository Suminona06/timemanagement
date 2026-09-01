import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { formatMinutes } from '../../../utils/timeFormatters';

/**
 * Custom Tooltip for Category Donut Chart
 */
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface-50 dark:bg-surface-850 p-2.5 rounded-2xl border border-surface-300 dark:border-surface-700 shadow-warm-lg text-xs space-y-1">
        <div className="flex items-center gap-2 font-bold text-surface-900 dark:text-surface-100">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          {data.name}
        </div>
        <div className="text-surface-600 dark:text-surface-300">
          Duration: <strong className="text-surface-900 dark:text-surface-100">{formatMinutes(data.totalMinutes)}</strong> ({data.totalHours} hrs)
        </div>
        <div className="text-surface-500 dark:text-surface-400">
          Share: <strong className="text-primary-600 dark:text-primary-400">{data.percentage}%</strong> ({data.sessionCount} sessions)
        </div>
      </div>
    );
  }
  return null;
}

/**
 * CategoryDonutChart — Interactive Donut Chart displaying time distribution across categories.
 *
 * Props:
 *  data — Array of category breakdown objects [{ name, color, totalMinutes, totalHours, percentage, sessionCount }]
 */
export default function CategoryDonutChart({ data = [] }) {
  const hasData = data && data.length > 0 && data.some((d) => d.totalMinutes > 0);

  return (
    <div className="card p-5 bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-700/80 shadow-warm-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-700/60">
        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
          <PieIcon size={16} className="text-primary-500" />
          Category Distribution
        </h3>
        <span className="text-xs text-surface-500 font-medium">
          {data.length} {data.length === 1 ? 'category' : 'categories'}
        </span>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-12 text-surface-400 gap-2">
          <PieIcon size={32} className="opacity-30 text-surface-400" />
          <p className="text-xs">No time logged in this period.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
          {/* Recharts Donut Pie */}
          <div className="w-full md:w-1/2 h-52 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="totalMinutes"
                  nameKey="name"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || '#C88A58'}
                      stroke="transparent"
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Legend & List */}
          <div className="w-full md:w-1/2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {data.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center justify-between p-2 rounded-xl bg-surface-100 dark:bg-surface-850 hover:bg-surface-200 dark:hover:bg-surface-700/60 border border-surface-200 dark:border-surface-700/60 transition-colors text-xs"
              >
                <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-surface-800 dark:text-surface-200 font-semibold truncate">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono">
                  <span className="text-surface-500">{formatMinutes(cat.totalMinutes)}</span>
                  <span className="font-bold text-surface-900 dark:text-surface-100 w-8 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
