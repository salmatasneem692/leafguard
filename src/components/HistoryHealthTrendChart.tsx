import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { SavedAnalysisSession } from '../services/historyStorage.ts';
import { Activity, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface HistoryHealthTrendChartProps {
  sessions: SavedAnalysisSession[];
  onSelectSession: (session: SavedAnalysisSession) => void;
}

interface SessionPoint {
  orderLabel: string;
  sessionNumber: number;
  sessionId: string;
  plantName: string;
  scientificName: string;
  dateStr: string;
  savedAt: string;
  healthStatus: 'healthy' | 'diseased';
  conditionLabel: string;
  healthConfidence: number;
  speciesConfidence: number;
  cumulativeHealthy: number;
  cumulativeDiseased: number;
  healthySharePct: number;
  rawSession: SavedAnalysisSession;
}

interface TrendTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: SessionPoint }>;
}

const SessionTrendTooltip: React.FC<TrendTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length || !payload[0]?.payload) {
    return null;
  }

  const point = payload[0].payload;
  const isHealthy = point.healthStatus === 'healthy';

  return (
    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg border border-slate-700 text-xs font-mono max-w-xs space-y-1.5">
      <div className="flex items-center justify-between gap-4 pb-1 border-b border-slate-800">
        <span className="font-bold text-slate-200">{point.orderLabel} · {point.plantName}</span>
        <span className="text-[10px] text-slate-400">{point.savedAt}</span>
      </div>
      <div className="text-[11px] text-slate-400">{point.dateStr}</div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-400">Condition:</span>
        <span className={`font-semibold ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
          {point.conditionLabel}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-400">Health Confidence:</span>
        <span className="font-bold tabular-nums">{point.healthConfidence.toFixed(1)}%</span>
      </div>
      <div className="pt-1 border-t border-slate-800 space-y-0.5 text-[11px]">
        <div className="flex items-center justify-between gap-4">
          <span className="text-emerald-400">Cumulative Healthy:</span>
          <span className="font-bold tabular-nums">{point.cumulativeHealthy}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-amber-400">Cumulative Diseased:</span>
          <span className="font-bold tabular-nums">{point.cumulativeDiseased}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sky-400">Running Healthy Rate:</span>
          <span className="font-bold tabular-nums">{point.healthySharePct}%</span>
        </div>
      </div>
    </div>
  );
};

interface BreakdownTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: { name: string; count: number; pct: number } }>;
}

const BreakdownTooltip: React.FC<BreakdownTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length || !payload[0]?.payload) {
    return null;
  }
  const item = payload[0].payload;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg border border-slate-700 text-xs font-mono">
      <div className="font-semibold text-slate-200 mb-0.5">{item.name}</div>
      <div className="text-slate-300 tabular-nums">
        {item.count} {item.count === 1 ? 'session' : 'sessions'} · {item.pct.toFixed(1)}%
      </div>
    </div>
  );
};

const CONDITION_COLORS = ['#059669', '#d97706', '#e11d48', '#2563eb', '#7c3aed'];

function extractSessionEpochMs(session: SavedAnalysisSession, fallbackOrder: number): number {
  const match = session.id.match(/^session_(\d+)_/);
  if (match && match[1]) {
    const parsed = Number(match[1]);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallbackOrder;
}

export const HistoryHealthTrendChart: React.FC<HistoryHealthTrendChartProps> = ({
  sessions,
  onSelectSession,
}) => {
  const [chartView, setChartView] = useState<'cumulative' | 'perSession'>('cumulative');

  const windowSessions = useMemo(() => {
    const recentThirty = sessions.slice(0, 30);
    // Oldest -> newest chronological order for left-to-right trend
    return [...recentThirty]
      .map((s, idx) => ({
        session: s,
        sortKey: extractSessionEpochMs(s, recentThirty.length - idx),
      }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((entry) => entry.session);
  }, [sessions]);

  const trendData: SessionPoint[] = useMemo(() => {
    let runningHealthy = 0;
    let runningDiseased = 0;

    return windowSessions.map((session, idx) => {
      const isHealthy = session.healthStatus === 'healthy';
      if (isHealthy) {
        runningHealthy += 1;
      } else {
        runningDiseased += 1;
      }

      const totalSoFar = runningHealthy + runningDiseased;
      const healthySharePct = totalSoFar > 0 ? Number(((runningHealthy / totalSoFar) * 100).toFixed(1)) : 0;

      return {
        orderLabel: `S${idx + 1}`,
        sessionNumber: idx + 1,
        sessionId: session.id,
        plantName: session.plantName,
        scientificName: session.scientificName,
        dateStr: session.dateStr,
        savedAt: session.savedAt,
        healthStatus: session.healthStatus,
        conditionLabel: isHealthy ? 'Healthy Folia' : (session.diseaseName || 'Diseased Folia'),
        healthConfidence: Number(session.healthConfidence.toFixed(1)),
        speciesConfidence: Number(session.speciesConfidence.toFixed(1)),
        cumulativeHealthy: runningHealthy,
        cumulativeDiseased: runningDiseased,
        healthySharePct,
        rawSession: session,
      };
    });
  }, [windowSessions]);

  const conditionDistribution = useMemo(() => {
    const counts = new Map<string, { count: number; isHealthy: boolean }>();
    for (const s of windowSessions) {
      const isHealthy = s.healthStatus === 'healthy';
      const label = isHealthy ? 'Healthy Folia' : (s.diseaseName || 'Diseased / Leaf Spot');
      const existing = counts.get(label);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(label, { count: 1, isHealthy });
      }
    }

    const total = windowSessions.length || 1;
    const rows: Array<{ name: string; count: number; pct: number; color: string }> = [];

    // Ensure Healthy appears first with emerald, then specific diseases with amber/rose/accent tones
    const sortedEntries = Array.from(counts.entries()).sort((a, b) => {
      if (a[1].isHealthy && !b[1].isHealthy) return -1;
      if (!a[1].isHealthy && b[1].isHealthy) return 1;
      return b[1].count - a[1].count;
    });

    let diseaseColorIdx = 1;
    for (const [name, info] of sortedEntries) {
      const color = info.isHealthy
        ? CONDITION_COLORS[0]
        : CONDITION_COLORS[Math.min(diseaseColorIdx++, CONDITION_COLORS.length - 1)];
      rows.push({
        name,
        count: info.count,
        pct: Number(((info.count / total) * 100).toFixed(1)),
        color,
      });
    }

    return rows;
  }, [windowSessions]);

  if (windowSessions.length === 0) {
    return null;
  }

  const healthyTotal = trendData[trendData.length - 1]?.cumulativeHealthy ?? 0;
  const diseasedTotal = trendData[trendData.length - 1]?.cumulativeDiseased ?? 0;
  const overallHealthyRate = windowSessions.length > 0
    ? ((healthyTotal / windowSessions.length) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-semibold mb-1">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Condition Telemetry · Last 30 Sessions Window</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Plant Health Condition Distribution Trend
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological health distribution across {windowSessions.length} recorded {windowSessions.length === 1 ? 'session' : 'sessions'} (max 30) · Healthy rate {overallHealthyRate}%
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setChartView('cumulative')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              chartView === 'cumulative'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Distribution Trend</span>
          </button>
          <button
            type="button"
            onClick={() => setChartView('perSession')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              chartView === 'perSession'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
            <span>Session-by-Session</span>
          </button>
        </div>
      </div>

      {/* Main 12-col Chart Grid: 8 cols Trend + 4 cols Condition Share Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Recharts Chronological Trend */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700">
              {chartView === 'cumulative'
                ? 'Cumulative Healthy vs. Diseased Specimens Over Time'
                : 'Individual Session Health Confidence & Running Healthy Rate'}
            </span>
            <span className="font-mono text-[11px] text-slate-400 tabular-nums">
              {windowSessions.length === 1 ? 'S1 (Current)' : `S1 → S${windowSessions.length}`}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'cumulative' ? (
                <AreaChart data={trendData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="historyHealthyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.04} />
                    </linearGradient>
                    <linearGradient id="historyDiseasedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="orderLabel"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                  />
                  <Tooltip content={<SessionTrendTooltip />} />
                  <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="cumulativeHealthy"
                    name="Healthy Sessions"
                    stackId="condition"
                    stroke="#059669"
                    strokeWidth={2.2}
                    fill="url(#historyHealthyGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeDiseased"
                    name="Diseased Sessions"
                    stackId="condition"
                    stroke="#d97706"
                    strokeWidth={2.2}
                    fill="url(#historyDiseasedGrad)"
                  />
                </AreaChart>
              ) : (
                <ComposedChart data={trendData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="orderLabel"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<SessionTrendTooltip />} />
                  <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="healthConfidence"
                    name="Session Health Confidence (%)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                    cursor="pointer"
                    onClick={(data: any) => {
                      if (data?.payload?.rawSession) {
                        onSelectSession(data.payload.rawSession);
                      }
                    }}
                  >
                    {trendData.map((entry) => (
                      <Cell
                        key={entry.sessionId}
                        fill={entry.healthStatus === 'healthy' ? '#059669' : '#d97706'}
                      />
                    ))}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="healthySharePct"
                    name="Running Healthy Rate (%)"
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: '#0284c7' }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
            <span>
              {chartView === 'cumulative'
                ? 'Stacked chronological accumulation from oldest (S1) to latest scan'
                : 'Bar color encodes condition (Emerald: Healthy · Amber: Diseased) · Click bar to inspect'}
            </span>
            <span className="tabular-nums text-slate-700 font-semibold">
              Healthy: {healthyTotal} · Diseased: {diseasedTotal}
            </span>
          </div>
        </div>

        {/* Right: Condition Distribution Donut & Breakdown List */}
        <div className="lg:col-span-4 lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <PieChartIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Condition Share</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500 tabular-nums">
              {windowSessions.length} total
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conditionDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={68}
                  paddingAngle={2}
                >
                  {conditionDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="#ffffff" strokeWidth={1.5} />
                  ))}
                </Pie>
                <Tooltip content={<BreakdownTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-200">
            {conditionDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-700 font-medium truncate" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <span className="font-mono text-slate-800 font-semibold tabular-nums shrink-0">
                  {item.count} ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
