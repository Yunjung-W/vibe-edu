import React, { useCallback } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint, YoYDataPoint, GeopoliticalEvent, Company, Language } from '../types';
import { COMPANY_COLORS, SEVERITY_COLORS } from '../constants';
import { t } from '../i18n';
import { formatNumber, downloadCSV } from '../utils/dataUtils';
import { Download, FileDown } from 'lucide-react';

interface MainChartProps {
  chartData: ChartDataPoint[];
  yoyData: YoYDataPoint[];
  events: GeopoliticalEvent[];
  companies: Company[];
  selectedEventId: string | null;
  highlightedPeriod: string | null;
  onEventClick: (event: GeopoliticalEvent) => void;
  lang: Language;
}

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  lang: Language;
}> = ({ active, payload, label, lang }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: 'white',
        border: 'none',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        padding: '0',
        minWidth: '200px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid #F0F0F0',
          background: '#F4F4F4',
        }}
      >
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hyundai-dark)' }}>{label}</p>
      </div>
      <div style={{ padding: '10px 14px' }}>
        {payload
          .filter((p) => p.value != null)
          .sort((a, b) => b.value - a.value)
          .map((p) => (
            <div
              key={p.name}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '6px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: p.color,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '12px', color: 'var(--hyundai-gray-dark)' }}>{p.name}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hyundai-dark)', fontVariantNumeric: 'tabular-nums' }}>
                {formatNumber(Math.round(p.value / 10000))}
                <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--hyundai-gray-mid)', marginLeft: '2px' }}>
                  {t(lang, 'unit')}
                </span>
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

const YoYTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: 'white',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        padding: '10px 14px',
        minWidth: '180px',
      }}
    >
      <p style={{ fontSize: '11px', fontWeight: 600, color: '#000', marginBottom: '6px' }}>{label}</p>
      {payload
        .filter((p) => p.value != null)
        .map((p) => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', color: '#60605B' }}>{p.name}</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: p.value >= 0 ? 'var(--hyundai-positive)' : 'var(--hyundai-negative)',
              }}
            >
              {p.value >= 0 ? '+' : ''}{p.value}%
            </span>
          </div>
        ))}
    </div>
  );
};

interface EventDotProps {
  cx?: number;
  cy?: number;
  event: GeopoliticalEvent;
  onClick: (event: GeopoliticalEvent) => void;
  isSelected: boolean;
}

const CustomEventDot: React.FC<EventDotProps> = ({ cx, cy, event, onClick, isSelected }) => {
  if (cx == null || cy == null) return null;
  const color = SEVERITY_COLORS[event.severity];
  return (
    <g
      style={{ cursor: 'pointer' }}
      onClick={() => onClick(event)}
    >
      <circle
        cx={cx}
        cy={cy - 20}
        r={isSelected ? 8 : 6}
        fill={color}
        stroke="white"
        strokeWidth={2}
        opacity={0.9}
      />
      {isSelected && (
        <circle
          cx={cx}
          cy={cy - 20}
          r={12}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={0.4}
        />
      )}
    </g>
  );
};

export const MainChart: React.FC<MainChartProps> = ({
  chartData,
  yoyData,
  events,
  companies,
  selectedEventId,
  highlightedPeriod,
  onEventClick,
  lang,
}) => {
  const chartRef = React.useRef<HTMLDivElement>(null);

  const handleExportCSV = useCallback(() => {
    downloadCSV(chartData, companies);
  }, [chartData, companies]);

  const handleExportPNG = useCallback(() => {
    alert(lang === 'ko' ? 'PNG 저장: 브라우저 스크린샷(Ctrl+Shift+S)을 이용해 주세요.' : 'PNG Save: Please use your browser\'s screenshot tool (Ctrl+Shift+S).');
  }, [lang]);

  // Map events to periods for reference lines
  const eventPeriods = events.reduce<Record<string, GeopoliticalEvent[]>>((acc, ev) => {
    const period = chartData.find((d) => d.period.startsWith(ev.date.substring(0, 4)));
    if (!period) return acc;
    // Find the matching quarter based on month
    const month = parseInt(ev.date.split('-')[1]);
    let quarter = 'Q1';
    if (month <= 3) quarter = 'Q1';
    else if (month <= 6) quarter = 'Q2';
    else if (month <= 9) quarter = 'Q3';
    else quarter = 'Q4';
    const periodKey = chartData.find(
      (d) => d.year === parseInt(ev.date.substring(0, 4)) && d.quarter === quarter
    )?.period || chartData.find((d) => d.year === parseInt(ev.date.substring(0, 4)))?.period;
    if (periodKey) {
      if (!acc[periodKey]) acc[periodKey] = [];
      acc[periodKey].push(ev);
    }
    return acc;
  }, {});

  // Custom legend
  const CustomLegend = () => (
    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', paddingBottom: '8px' }}>
      {companies.map((company) => (
        <div key={company} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: COMPANY_COLORS[company],
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '12px', color: 'var(--hyundai-gray-dark)' }}>{company}</span>
        </div>
      ))}
    </div>
  );

  const yMax = Math.max(
    ...chartData.flatMap((d) => companies.map((c) => (d[c] as number) || 0))
  );

  return (
    <div ref={chartRef} className="chart-container animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      {/* Chart header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 500,
              color: 'var(--hyundai-dark)',
              letterSpacing: '-0.01em',
            }}
          >
            {t(lang, 'mainChartTitle')}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-outline" onClick={handleExportPNG}>
            <Download size={14} />
            {t(lang, 'exportPNG')}
          </button>
          <button className="btn-outline" onClick={handleExportCSV}>
            <FileDown size={14} />
            {t(lang, 'exportCSV')}
          </button>
        </div>
      </div>

      <CustomLegend />

      {/* Event severity legend */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginBottom: '8px' }}>
        {(['high', 'medium'] as const).map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: SEVERITY_COLORS[s],
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--hyundai-gray-mid)' }}>
              {t(lang, s)}
            </span>
          </div>
        ))}
      </div>

      {/* Main line chart */}
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#F0F0F0" vertical={false} />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 11, fill: '#999999' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => `${Math.round(v / 10000)}만`}
            tick={{ fontSize: 11, fill: '#999999' }}
            axisLine={false}
            tickLine={false}
            width={50}
            domain={[0, Math.ceil(yMax / 200000) * 200000 + 200000]}
          />
          <Tooltip content={<CustomTooltip lang={lang} />} />

          {/* Event reference lines */}
          {Object.entries(eventPeriods).map(([period, evs]) => {
            const topEv = evs.sort((a, b) =>
              a.severity === 'high' ? -1 : b.severity === 'high' ? 1 : 0
            )[0];
            return (
              <ReferenceLine
                key={period}
                x={period}
                stroke={SEVERITY_COLORS[topEv.severity]}
                strokeDasharray="4 4"
                strokeWidth={1.5}
                opacity={selectedEventId && evs.some((e) => e.id === selectedEventId) ? 1 : 0.5}
                label={
                  {
                    value: '',
                    position: 'top',
                  } as any
                }
              />
            );
          })}

          {/* Highlighted period */}
          {highlightedPeriod && (
            <ReferenceLine
              x={highlightedPeriod}
              stroke="var(--hyundai-active-blue)"
              strokeWidth={2}
              label={{ value: '◀', position: 'top', fill: 'var(--hyundai-active-blue)', fontSize: 10 }}
            />
          )}

          {companies.map((company) => (
            <Line
              key={company}
              type="monotone"
              dataKey={company}
              stroke={COMPANY_COLORS[company]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: COMPANY_COLORS[company], stroke: 'white', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      {/* YoY Change chart */}
      <div style={{ marginTop: '16px' }}>
        <p
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--hyundai-gray-dark)',
            marginBottom: '8px',
            paddingLeft: '60px',
          }}
        >
          {t(lang, 'yoyChangeTitle')}
        </p>
        <ResponsiveContainer width="100%" height={100}>
          <ComposedChart data={yoyData} margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#F0F0F0" vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 10, fill: '#999999' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10, fill: '#999999' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<YoYTooltip />} />
            <ReferenceLine y={0} stroke="#E5E5E5" strokeWidth={1} />

            {companies.map((company) => (
              <Bar
                key={company}
                dataKey={company}
                fill={COMPANY_COLORS[company]}
                opacity={0.7}
                maxBarSize={6}
                isAnimationActive={true}
                animationDuration={800}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
