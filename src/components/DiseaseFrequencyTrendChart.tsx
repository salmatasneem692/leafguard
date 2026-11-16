import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { SavedAnalysisSession } from '../services/historyStorage.ts';
import { Bug, TrendingUp, BarChart3, ShieldCheck, Microscope } from 'lucide-react';

interface DiseaseFrequencyTrendChartProps {
  sessions: SavedAnalysisSession[];
  onGoToDisease?: () => void;
}

interface DiseaseTypeMeta {
  name: string;
  key: string;
  color: string;
  count: number;
  sharePct: number;
  pathogenType: string;
  latestDate: string;
}

interface DailyPoint {
  dateKey: string;
  axisLabel: string;
  fullDateLabel: string;
  totalDiseased: number;
  totalScans: number;
  [diseaseKey: string]: string | number;
}

const PATHOLOGY_PALETTE = [
  '#d97706', // Amber
  '#e11d48', // Rose
  '#7c3aed', // Violet
  '#0284c7', // Sky
  '#ea580c', // Burnt Orange
  '#0d9488', // Teal
];

function extractSessionDate(session: SavedAnalysisSession): Date | null {
  const idMatch = session.id.match(/^session_(\d+)_/);
  if (idMatch && idMatch[1]) {
    const ms = Number(idMatch[1]);
    if (!Number.isNaN(ms) && ms > 0) {
      return new Date(ms);
    }
  }
  const parsed = new Date(session.dateStr);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  return null;
}

function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string; payload?: DailyPoint }>;
  chartMode: 'daily' | 'cumulative';
}

const DiseaseTooltip: React.FC<CustomTooltipProps> = ({ active, payload, chartMode }) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const nonZeroEntries = payload.filter((entry) => typeof entry.value === 'number' && entry.value > 0);

  return (
    <div className="bg-[#123D2A] text-white p-3 rounded-xl shadow-xl border border-[#E8F5EC]/20 text-xs font-mono max-w-xs space-y-1.5">
      <div className="flex items-center justify-between gap-4 pb-1 border-b border-[#E8F5EC]/15">
        <span className="font-bold text-[#E8F5EC]">{point.fullDateLabel}</span>
        <span className="text-[10px] text-[#4ade80] tabular-nums">
          {point.totalScans} {point.totalScans === 1 ? 'scan' : 'scans'}
        </span>
      </div>

      {nonZeroEntries.length > 0 ? (
        <div className="space-y-1">
          {nonZeroEntries.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-[#E8F5EC]/90 truncate">
                <span
                  className="w-2 h-2 rounded-xs shrink-0"
                  style={{ backgroundColor: entry.color || '#d97706' }}
                />
                <span className="truncate">{entry.name}</span>
              </span>
              <span className="font-bold tabular-nums text-white shrink-0">
                {entry.value} {chartMode === 'cumulative' ? 'total' : entry.value === 1 ? 'case' : 'cases'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-[11px] text-[#E8F5EC]/70">No leaf diseases detected</div>
      )}
    </div>
  );
};

export const DiseaseFrequencyTrendChart: React.FC<DiseaseFrequencyTrendChartProps> = ({
  sessions,
  onGoToDisease,
}) => {
  const [chartMode, setChartMode] = useState<'daily' | 'cumulative'>('daily');

  const { dailyData, cumulativeData, diseaseTypes, totalScans30d, totalDiseased30d } = useMemo(() => {
    const now = new Date();
    const endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);

    // Build continuous 30-day calendar frame
    const daySlots: Array<{ dateKey: string; axisLabel: string; fullDateLabel: string }> = [];
    const dayLookup = new Map<
      string,
      { totalScans: number; totalDiseased: number; diseaseCounts: Map<string, number> }
    >();

    for (let i = 0; i < 30; i += 1) {
      const d = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate() + i);
      const key = toLocalDateKey(d);
      daySlots.push({
        dateKey: key,
        axisLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDateLabel: d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      });
      dayLookup.set(key, {
        totalScans: 0,
        totalDiseased: 0,
        diseaseCounts: new Map<string, number>(),
      });
    }

    const typeTotals = new Map<
      string,
      { count: number; pathogenType: string; latestTime: number; latestDate: string }
    >();

    let scans30 = 0;
    let diseased30 = 0;

    for (const s of sessions) {
      const dt = extractSessionDate(s);
      if (!dt || dt < startDay || dt > endDay) continue;

      const key = toLocalDateKey(dt);
      const slot = dayLookup.get(key);
      if (!slot) continue;

      scans30 += 1;
      slot.totalScans += 1;

      if (s.healthStatus === 'diseased') {
        diseased30 += 1;
        slot.totalDiseased += 1;

        const diseaseLabel = (s.diseaseName && s.diseaseName.trim()) || 'Unspecified Leaf Pathology';
        slot.diseaseCounts.set(diseaseLabel, (slot.diseaseCounts.get(diseaseLabel) || 0) + 1);

        const existing = typeTotals.get(diseaseLabel);
        const ts = dt.getTime();
        const shortDate = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (existing) {
          existing.count += 1;
          if (ts > existing.latestTime) {
            existing.latestTime = ts;
            existing.latestDate = shortDate;
          }
        } else {
          typeTotals.set(diseaseLabel, {
            count: 1,
            pathogenType: s.result?.health?.pathogenType || 'fungal',
            latestTime: ts,
            latestDate: shortDate,
          });
        }
      }
    }

    // Sort disease types by frequency descending
    const sortedTypes: DiseaseTypeMeta[] = Array.from(typeTotals.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, info], idx) => ({
        name,
        key: `disease_${idx}`,
        color: PATHOLOGY_PALETTE[idx % PATHOLOGY_PALETTE.length],
        count: info.count,
        sharePct: diseased30 > 0 ? Number(((info.count / diseased30) * 100).toFixed(1)) : 0,
        pathogenType: info.pathogenType,
        latestDate: info.latestDate,
      }));

    // Build daily & cumulative chart arrays
    const runningCounts = new Map<string, number>();
    sortedTypes.forEach((t) => runningCounts.set(t.key, 0));

    const dailyPoints: DailyPoint[] = [];
    const cumulativePoints: DailyPoint[] = [];

    for (const slotInfo of daySlots) {
      const stats = dayLookup.get(slotInfo.dateKey)!;
      const dailyRow: DailyPoint = {
        dateKey: slotInfo.dateKey,
        axisLabel: slotInfo.axisLabel,
        fullDateLabel: slotInfo.fullDateLabel,
        totalDiseased: stats.totalDiseased,
        totalScans: stats.totalScans,
      };
      const cumRow: DailyPoint = {
        dateKey: slotInfo.dateKey,
        axisLabel: slotInfo.axisLabel,
        fullDateLabel: slotInfo.fullDateLabel,
        totalDiseased: stats.totalDiseased,
        totalScans: stats.totalScans,
      };

      for (const dtMeta of sortedTypes) {
        const dayVal = stats.diseaseCounts.get(dtMeta.name) || 0;
        dailyRow[dtMeta.key] = dayVal;

        const updatedCum = (runningCounts.get(dtMeta.key) || 0) + dayVal;
        runningCounts.set(dtMeta.key, updatedCum);
        cumRow[dtMeta.key] = updatedCum;
      }

      dailyPoints.push(dailyRow);
      cumulativePoints.push(cumRow);
    }

    return {
      dailyData: dailyPoints,
      cumulativeData: cumulativePoints,
      diseaseTypes: sortedTypes,
      totalScans30d: scans30,
      totalDiseased30d: diseased30,
    };
  }, [sessions]);

  const topDisease = diseaseTypes[0]?.name || 'None Detected';
  const activeSeriesData = chartMode === 'daily' ? dailyData : cumulativeData;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#123D2A]/12 shadow-xs space-y-5">
      {/* Header & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#123D2A]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#16A36A] font-semibold mb-1">
            <Bug className="w-4 h-4" />
            <span>30-Day Pathology Surveillance · Saved Analysis History</span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#123D2A]">
            Leaf Disease Type Frequency (Last 30 Days)
          </h3>
          <p className="text-xs text-[#18251E]/65 mt-0.5">
            Tracks occurrence frequency across detected foliar diseases over the past 30 calendar days
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#E8F5EC]/75 rounded-xl border border-[#123D2A]/12 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setChartMode('daily')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              chartMode === 'daily'
                ? 'bg-[#123D2A] text-white shadow-xs'
                : 'text-[#123D2A] hover:bg-white/70'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Daily Frequency</span>
          </button>
          <button
            type="button"
            onClick={() => setChartMode('cumulative')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              chartMode === 'cumulative'
                ? 'bg-[#123D2A] text-white shadow-xs'
                : 'text-[#123D2A] hover:bg-white/70'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cumulative 30d</span>
          </button>
        </div>
      </div>

      {/* Inline 30-Day Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-[#FAFCF8] border border-[#123D2A]/10">
          <span className="text-[10px] uppercase text-[#18251E]/55 block">30-Day Scans</span>
          <span className="text-lg font-extrabold text-[#123D2A] tabular-nums">{totalScans30d}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#FAFCF8] border border-[#123D2A]/10">
          <span className="text-[10px] uppercase text-[#18251E]/55 block">Diseased Cases</span>
          <span className="text-lg font-extrabold text-amber-700 tabular-nums">{totalDiseased30d}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#FAFCF8] border border-[#123D2A]/10">
          <span className="text-[10px] uppercase text-[#18251E]/55 block">Disease Types</span>
          <span className="text-lg font-extrabold text-[#123D2A] tabular-nums">
            {diseaseTypes.length}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#FAFCF8] border border-[#123D2A]/10">
          <span className="text-[10px] uppercase text-[#18251E]/55 block">Top Pathology</span>
          <span className="text-xs sm:text-sm font-bold text-[#123D2A] truncate block mt-1" title={topDisease}>
            {topDisease}
          </span>
        </div>
      </div>

      {/* Chart & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 8 cols: 30-Day Multi-Series Disease Frequency Recharts Visualization */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#18251E]/65 mb-2">
            <span className="font-semibold text-[#123D2A]">
              {chartMode === 'daily'
                ? 'Daily Detections by Leaf Disease Type (30-Day Calendar)'
                : 'Cumulative Leaf Disease Frequency Over Last 30 Days'}
            </span>
            <span className="font-mono text-[11px] tabular-nums">
              {dailyData[0]?.axisLabel} → {dailyData[dailyData.length - 1]?.axisLabel}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'daily' ? (
                <BarChart data={activeSeriesData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2ece5" vertical={false} />
                  <XAxis
                    dataKey="axisLabel"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    interval={4}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={[0, (dataMax: number) => Math.max(2, dataMax)]}
                    tick={{ fontSize: 10, fill: '#475569' }}
                  />
                  <Tooltip content={<DiseaseTooltip chartMode={chartMode} />} />
                  {diseaseTypes.length > 0 && (
                    <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  )}
                  {diseaseTypes.length > 0 ? (
                    diseaseTypes.map((dt) => (
                      <Bar
                        key={dt.key}
                        dataKey={dt.key}
                        name={dt.name}
                        stackId="diseases"
                        fill={dt.color}
                        radius={[3, 3, 0, 0]}
                        maxBarSize={18}
                      />
                    ))
                  ) : (
                    <Bar
                      dataKey="totalDiseased"
                      name="No Diseases Detected"
                      fill="#16A36A"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={18}
                    />
                  )}
                </BarChart>
              ) : (
                <AreaChart data={activeSeriesData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2ece5" vertical={false} />
                  <XAxis
                    dataKey="axisLabel"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    interval={4}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={[0, (dataMax: number) => Math.max(2, dataMax)]}
                    tick={{ fontSize: 10, fill: '#475569' }}
                  />
                  <Tooltip content={<DiseaseTooltip chartMode={chartMode} />} />
                  {diseaseTypes.length > 0 && (
                    <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  )}
                  {diseaseTypes.length > 0 ? (
                    diseaseTypes.map((dt) => (
                      <Area
                        key={dt.key}
                        type="monotone"
                        dataKey={dt.key}
                        name={dt.name}
                        stackId="cumDiseases"
                        stroke={dt.color}
                        strokeWidth={2}
                        fill={dt.color}
                        fillOpacity={0.22}
                      />
                    ))
                  ) : (
                    <Area
                      type="monotone"
                      dataKey="totalDiseased"
                      name="No Diseases Detected"
                      stroke="#16A36A"
                      strokeWidth={2}
                      fill="#16A36A"
                      fillOpacity={0.12}
                    />
                  )}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 4 cols: Disease Frequency Breakdown Ranked List (Hairline divider, zero nested card box) */}
        <div className="lg:col-span-4 lg:border-l lg:border-[#123D2A]/10 lg:pl-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#123D2A]">
                Detected Disease Breakdown
              </span>
              <span className="text-[11px] font-mono text-[#18251E]/60 tabular-nums">
                {totalDiseased30d} cases
              </span>
            </div>

            {diseaseTypes.length > 0 ? (
              <div className="space-y-3">
                {diseaseTypes.map((dt) => (
                  <div key={dt.key} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-2 min-w-0 font-semibold text-[#123D2A]">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: dt.color }}
                        />
                        <span className="truncate" title={dt.name}>
                          {dt.name}
                        </span>
                      </span>
                      <span className="font-mono font-bold text-[#123D2A] tabular-nums shrink-0">
                        {dt.count} ({dt.sharePct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E8F5EC] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(6, dt.sharePct)}%`,
                          backgroundColor: dt.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#18251E]/55">
                      <span className="capitalize">Pathogen: {dt.pathogenType}</span>
                      <span>Last: {dt.latestDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EC] text-[#16A36A] flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#123D2A]">
                    {totalScans30d > 0
                      ? 'All Recent Scans Are Healthy'
                      : 'No Disease Detections Logged Yet'}
                  </p>
                  <p className="text-[11px] text-[#18251E]/65 leading-relaxed">
                    {totalScans30d > 0
                      ? `${totalScans30d} leaf scans checked over the last 30 days with 0 disease detections.`
                      : 'Run Disease Detection on a leaf specimen to populate your 30-day pathology frequency chart.'}
                  </p>
                </div>
                {onGoToDisease && (
                  <button
                    type="button"
                    onClick={onGoToDisease}
                    className="px-3.5 py-2 rounded-xl bg-[#16A36A] hover:bg-[#138f5d] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Microscope className="w-3.5 h-3.5" />
                    <span>Run Disease Detection</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#123D2A]/10 text-[11px] font-mono text-[#18251E]/55 flex items-center justify-between">
            <span>Rolling 30-day history</span>
            <span className="tabular-nums">{sessions.length} total stored</span>
          </div>
        </div>
      </div>
    </div>
  );
};
