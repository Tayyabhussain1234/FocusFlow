import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  calculateSummary,
  calculateDailyActivity,
  calculateCategoryBreakdown,
  formatMinutesToHours,
} from '../utils/statistics';
import { StatCard } from './StatCard';
import { EmptyState } from './EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  ListTodo,
  Calendar,
  Sparkles,
  PieChart as PieChartIcon,
} from 'lucide-react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name?: string; color?: string }>;
  label?: string;
  unit?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, unit = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-[#1B1E21] border border-[#303438] shadow-xl text-xs">
        <p className="font-semibold text-[#F7F7F5] mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-[#FFD166] font-mono tabular-nums">
            {entry.value} {unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CATEGORY_COLORS = ['#FFD166', '#FF8A00', '#72D6A0', '#60A5FA', '#F472B6', '#A78BFA'];

export const ProductivityInsights: React.FC = () => {
  const { tasks, sessions, openNewTaskModal } = useApp();
  const [rangeDays, setRangeDays] = useState<7 | 30>(7);

  // Calculate real summaries
  const summary = useMemo(() => calculateSummary(tasks, sessions), [tasks, sessions]);

  // Calculate daily activities
  const dailyData = useMemo(
    () => calculateDailyActivity(tasks, sessions, rangeDays),
    [tasks, sessions, rangeDays]
  );

  // Category breakdown
  const categoryData = useMemo(() => calculateCategoryBreakdown(tasks), [tasks]);

  const hasAnyActivity = tasks.length > 0 || sessions.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Controls: Title & Date Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1B1E21] border border-[#303438]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#FFD166] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Productivity Analytics
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F7F7F5] mt-1">
            Performance & Focus Metrics
          </h2>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center p-1 rounded-xl bg-[#151719] border border-[#303438]">
          <button
            type="button"
            onClick={() => setRangeDays(7)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              rangeDays === 7
                ? 'bg-[#22262A] text-[#FFD166] shadow-sm'
                : 'text-[#A3A8AE] hover:text-[#F7F7F5]'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setRangeDays(30)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              rangeDays === 30
                ? 'bg-[#22262A] text-[#FFD166] shadow-sm'
                : 'text-[#A3A8AE] hover:text-[#F7F7F5]'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={summary.totalTasks}
          subtext={`${summary.activeTasks} in progress`}
          icon={ListTodo}
        />
        <StatCard
          label="Completed Tasks"
          value={summary.completedTasks}
          subtext={`${summary.todayCompletedTasks} finished today`}
          icon={CheckCircle2}
        />
        <StatCard
          label="Completion Rate"
          value={`${summary.completionRate}%`}
          subtext={
            summary.totalTasks === 0
              ? 'No tasks created yet'
              : `${summary.completedTasks} of ${summary.totalTasks} tasks`
          }
          icon={TrendingUp}
        />
        <StatCard
          label="Total Focus Time"
          value={formatMinutesToHours(summary.totalFocusMinutes)}
          subtext={`${summary.todayFocusMinutes}m completed today`}
          icon={Clock}
        />
      </div>

      {!hasAnyActivity ? (
        <div className="p-6 rounded-2xl bg-[#1B1E21] border border-[#303438]">
          <EmptyState
            icon={Sparkles}
            title="No activity history yet"
            description="Start by creating tasks and running Pomodoro sessions. Your completion velocity, focus curves, and category breakdowns will populate here automatically."
            actionText="Create First Task"
            onAction={() => openNewTaskModal()}
          />
        </div>
      ) : (
        <>
          {/* Charts Row: Task Completions & Focus Minutes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Tasks Completed per Day */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#1B1E21] border border-[#303438] flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-[#F7F7F5] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#72D6A0]" />
                  Tasks Completed per Day
                </h3>
                <p className="text-xs text-[#A3A8AE] mt-0.5">
                  Task completion velocity over the last {rangeDays} days
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#72D6A0" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#72D6A0" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#303438" vertical={false} />
                    <XAxis
                      dataKey="shortDate"
                      stroke="#A3A8AE"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#303438' }}
                    />
                    <YAxis
                      stroke="#A3A8AE"
                      fontSize={11}
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={{ stroke: '#303438' }}
                    />
                    <Tooltip content={<CustomTooltip unit="tasks completed" />} />
                    <Bar
                      dataKey="completedTasks"
                      fill="url(#barGradient)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Daily Focus Minutes */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#1B1E21] border border-[#303438] flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-[#F7F7F5] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFD166]" />
                  Deep Focus Minutes
                </h3>
                <p className="text-xs text-[#A3A8AE] mt-0.5">
                  Actual logged focus time over the last {rangeDays} days
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="focusAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFD166" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#FF8A00" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#303438" vertical={false} />
                    <XAxis
                      dataKey="shortDate"
                      stroke="#A3A8AE"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#303438' }}
                    />
                    <YAxis
                      stroke="#A3A8AE"
                      fontSize={11}
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={{ stroke: '#303438' }}
                    />
                    <Tooltip content={<CustomTooltip unit="minutes" />} />
                    <Area
                      type="monotone"
                      dataKey="focusMinutes"
                      stroke="#FFD166"
                      strokeWidth={2.5}
                      fill="url(#focusAreaGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Breakdown: Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donut Chart */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#1B1E21] border border-[#303438] flex flex-col items-center justify-between">
              <div className="w-full text-left mb-2">
                <h3 className="text-sm font-bold text-[#F7F7F5] flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-[#FFD166]" />
                  Task Category Distribution
                </h3>
                <p className="text-xs text-[#A3A8AE] mt-0.5">
                  Share of tasks across functional areas
                </p>
              </div>

              {categoryData.length > 0 ? (
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {categoryData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip unit="tasks" />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-12 text-xs text-[#A3A8AE]">No categories yet</div>
              )}
            </div>

            {/* Category Progress Bars */}
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-[#1B1E21] border border-[#303438]">
              <h3 className="text-sm font-bold text-[#F7F7F5] mb-1">
                Category Completion Rates
              </h3>
              <p className="text-xs text-[#A3A8AE] mb-4">
                Completed vs total tasks per category
              </p>

              <div className="space-y-3.5">
                {categoryData.map((cat, idx) => {
                  const percent = cat.count > 0 ? Math.round((cat.completedCount / cat.count) * 100) : 0;
                  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#F7F7F5]">{cat.name}</span>
                        <span className="text-[#A3A8AE] font-mono tabular-nums">
                          {cat.completedCount} / {cat.count} done ({percent}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#151719] overflow-hidden border border-[#303438]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
