import React, { useState, useCallback, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Download } from 'lucide-react';
import {
  SalesRecord,
  EventRecord,
  DashboardFilters,
  COMPANY_COLORS,
  COMPANIES,
  Language,
} from '../types';
import { translations } from '../i18n/translations';

interface MainChartProps {
  salesData: SalesRecord[];
  eventsData: EventRecord[];
  filters: DashboardFilters;
  lang: Language;
  onEventClick: (event: EventRecord) => void;
  highlightedEventDate: string | null;
}

// ─── 데이터 키 규칙 ─────────────────────────────────────────
// `{company}`      → 실제 공식 발표 값
// `{company}_est`  → 추정치 값 (미발표)

interface UnifiedPoint {
  key: string;
  sortKey: number;
  is_estimate?: boolean;
  [key: string]: number | string | boolean | undefined;
}

function buildTimeKey(year: number, quarter: string) {
  return `${year} ${quarter}`;
}
function buildAnnualKey(year: number) {
  return `${year}`;
}

function aggregateUnified(
  data: SalesRecord[],
  filters: DashboardFilters
): UnifiedPoint[] {
  const activeCompanies =
    filters.companies.length > 0 ? filters.companies : [...COMPANIES];
  const activeRegions = filters.regions;

  const map: Record<string, UnifiedPoint> = {};

  data.forEach((r) => {
    if (r.year < filters.yearRange[0] || r.year > filters.yearRange[1]) return;
    if (activeRegions.length > 0 && !activeRegions.includes(r.region)) return;
    if (!activeCompanies.includes(r.company)) return;

    const key =
      filters.granularity === 'quarterly'
        ? buildTimeKey(r.year, r.quarter)
        : buildAnnualKey(r.year);
    const sortKey =
      filters.granularity === 'quarterly'
        ? r.year * 10 + ['Q1', 'Q2', 'Q3', 'Q4'].indexOf(r.quarter)
        : r.year;

    if (!map[key]) map[key] = { key, sortKey };

    if (r.is_estimate) {
      const estKey = `${r.company}_est`;
      map[key][estKey] = ((map[key][estKey] as number) || 0) + r.sales;
      map[key].is_estimate = true;
    } else {
      map[key][r.company] =
        ((map[key][r.company] as number) || 0) + r.sales;
    }
  });

  const sorted = Object.values(map).sort(
    (a, b) => (a.sortKey as number) - (b.sortKey as number)
  );

  // 경계 연결: 추정 구간 직전 실제 데이터 포인트에 _est 값도 복사 (선이 끊기지 않게)
  const firstEstIdx = sorted.findIndex((p) => p.is_estimate);
  if (firstEstIdx > 0) {
    const boundary = sorted[firstEstIdx - 1];
    activeCompanies.forEach((c) => {
      if (boundary[c] !== undefined) {
        boundary[`${c}_est`] = boundary[c];
      }
    });
  }

  return sorted;
}

interface YoYPoint {
  key: string;
  sortKey: number;
  yoy: number;
  is_estimate?: boolean;
}

function buildYoYData(data: SalesRecord[], filters: DashboardFilters): YoYPoint[] {
  const activeRegions = filters.regions;
  const activeCompanies =
    filters.companies.length > 0 ? filters.companies : [...COMPANIES];
  const byKey: Record<string, { yoySum: number; count: number; sortKey: number; is_estimate?: boolean }> = {};

  data.forEach((r) => {
    if (r.year < filters.yearRange[0] || r.year > filters.yearRange[1]) return;
    if (activeRegions.length > 0 && !activeRegions.includes(r.region)) return;
    if (!activeCompanies.includes(r.company)) return;

    const key =
      filters.granularity === 'quarterly'
        ? buildTimeKey(r.year, r.quarter)
        : buildAnnualKey(r.year);
    const sortKey =
      filters.granularity === 'quarterly'
        ? r.year * 10 + ['Q1', 'Q2', 'Q3', 'Q4'].indexOf(r.quarter)
        : r.year;

    if (!byKey[key]) byKey[key] = { yoySum: 0, count: 0, sortKey };
    byKey[key].yoySum += r.yoy_change;
    byKey[key].count += 1;
    if (r.is_estimate) byKey[key].is_estimate = true;
  });

  return Object.entries(byKey)
    .map(([key, v]) => ({
      key,
      sortKey: v.sortKey,
      yoy: v.count > 0 ? v.yoySum / v.count : 0,
      is_estimate: v.is_estimate,
    }))
    .sort((a, b) => a.sortKey - b.sortKey);
}

const SEVERITY_COLORS: Record<string, string> = {
  high: '#D32F2F',
  medium: '#F59E0B',
  low: '#999999',
};

function CustomTooltip({
  active,
  payload,
  label,
  lang,
  unifiedPoints,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number; dataKey: string }[];
  label?: string;
  lang: Language;
  unifiedPoints: UnifiedPoint[];
}) {
  if (!active || !payload?.length) return null;

  const point = unifiedPoints.find((p) => p.key === label);
  const isEst = point?.is_estimate;

  // _est 키와 실제 키 중복 표시 방지: 같은 회사가 두 번 나오면 하나만 표시
  const seen = new Set<string>();
  const deduped = payload.filter((p) => {
    const company = (p.dataKey as string).replace('_est', '');
    if (seen.has(company)) return false;
    seen.add(company);
    return true;
  });

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E5E5E5',
        padding: '12px 16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        minWidth: 200,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: '#999',
          marginBottom: 6,
          fontFamily: 'Outfit, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {label}
        {isEst && (
          <span
            style={{
              fontSize: 10,
              background: '#FEF3C7',
              color: '#92400E',
              padding: '1px 6px',
              borderRadius: 999,
              fontWeight: 500,
            }}
          >
            {lang === 'ko' ? '추정치' : 'Estimate'}
          </span>
        )}
      </div>
      {deduped.map((p) => {
        const company = (p.dataKey as string).replace('_est', '');
        return (
          <div
            key={company}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: p.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 13,
                color: '#60605B',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {company}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#000',
                fontFamily: 'Outfit, sans-serif',
                marginLeft: 'auto',
                opacity: isEst ? 0.75 : 1,
              }}
            >
              {Math.round(p.value).toLocaleString()}k
              {isEst && (
                <span style={{ fontSize: 10, color: '#F59E0B', marginLeft: 3 }}>
                  *
                </span>
              )}
            </span>
          </div>
        );
      })}
      {isEst && (
        <div
          style={{
            fontSize: 10,
            color: '#999',
            marginTop: 8,
            borderTop: '1px solid #F0F0F0',
            paddingTop: 6,
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          * {lang === 'ko' ? '미발표 추정치 (실제와 다를 수 있음)' : 'Unconfirmed estimate'}
        </div>
      )}
    </div>
  );
}

// 추정치 점: 빈 원(hollow)
function EstimateDot(props: {
  cx?: number;
  cy?: number;
  color: string;
  index?: number;
  unifiedPoints: UnifiedPoint[];
}) {
  const { cx, cy, color } = props;
  if (cx == null || cy == null) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#FFFFFF"
      stroke={color}
      strokeWidth={2}
    />
  );
}

export default function MainChart({
  salesData,
  eventsData,
  filters,
  lang,
  onEventClick,
  highlightedEventDate,
}: MainChartProps) {
  const t = translations[lang];
  const activeCompanies =
    filters.companies.length > 0 ? filters.companies : [...COMPANIES];

  const unifiedPoints = aggregateUnified(salesData, filters);
  const yoyPoints = buildYoYData(salesData, filters);
  const chartRef = useRef<HTMLDivElement>(null);

  // 추정 구간 범위
  const firstEstKey = unifiedPoints.find((p) => p.is_estimate)?.key;
  const lastEstKey = [...unifiedPoints].reverse().find((p) => p.is_estimate)?.key;
  const hasEstimates = !!firstEstKey;

  const chartKeys = new Set(unifiedPoints.map((p) => p.key));

  const getEventKey = (date: string): string => {
    const [year, month] = date.split('-');
    const y = parseInt(year);
    const m = parseInt(month || '1');
    if (filters.granularity === 'annual') return `${y}`;
    const q = m <= 3 ? 'Q1' : m <= 6 ? 'Q2' : m <= 9 ? 'Q3' : 'Q4';
    return `${y} ${q}`;
  };

  const filteredEvents = eventsData.filter((e) => {
    const year = parseInt(e.date.split('-')[0]);
    return year >= filters.yearRange[0] && year <= filters.yearRange[1];
  });

  const handleExportCSV = useCallback(() => {
    const rows = [
      ['Period', 'IsEstimate', ...activeCompanies].join(','),
      ...unifiedPoints.map((p) => {
        const vals = activeCompanies.map((c) => {
          const actual = p[c] as number | undefined;
          const est = p[`${c}_est`] as number | undefined;
          return actual ?? est ?? 0;
        });
        return [p.key, p.is_estimate ? 'Y' : 'N', ...vals].join(',');
      }),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'auto-sales-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [unifiedPoints, activeCompanies]);

  return (
    <div
      ref={chartRef}
      style={{
        background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        padding: '40px 40px 24px',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: '#000',
              fontFamily: 'Outfit, sans-serif',
              marginBottom: 4,
            }}
          >
            {t.chart.salesVolume}
          </h2>
          {/* 추정치 범례 */}
          {hasEstimates && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginTop: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="28" height="6">
                  <line x1="0" y1="3" x2="28" y2="3" stroke="#555" strokeWidth="2" />
                </svg>
                <span style={{ fontSize: 11, color: '#60605B', fontFamily: 'Outfit, sans-serif' }}>
                  {lang === 'ko' ? '공식 발표' : 'Official'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="28" height="10">
                  <line
                    x1="0" y1="5" x2="28" y2="5"
                    stroke="#555" strokeWidth="2"
                    strokeDasharray="5 3"
                  />
                  <circle cx="14" cy="5" r="3.5" fill="white" stroke="#555" strokeWidth="1.5" />
                </svg>
                <span style={{ fontSize: 11, color: '#60605B', fontFamily: 'Outfit, sans-serif' }}>
                  {lang === 'ko' ? '추정치 (미발표)' : 'Estimate (unconfirmed)'}
                </span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleExportCSV}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            border: '1px solid #002C5F',
            background: 'transparent',
            color: '#002C5F',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'Outfit, sans-serif',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#002C5F';
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = '#002C5F';
          }}
        >
          <Download size={12} />
          {t.export.csv}
        </button>
      </div>

      {/* 메인 라인 차트 */}
      <ResponsiveContainer width="100%" height={340}>
        <LineChart
          data={unifiedPoints}
          margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="#F0F0F0"
            vertical={false}
          />
          <XAxis
            dataKey="key"
            tick={{
              fontSize: 12,
              fill: '#999',
              fontFamily: 'Outfit, sans-serif',
            }}
            axisLine={false}
            tickLine={false}
            interval={filters.granularity === 'quarterly' ? 3 : 0}
          />
          <YAxis
            tick={{
              fontSize: 12,
              fill: '#999',
              fontFamily: 'Outfit, sans-serif',
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}M`}
          />
          <Tooltip
            content={
              <CustomTooltip lang={lang} unifiedPoints={unifiedPoints} />
            }
          />
          <Legend
            wrapperStyle={{
              fontSize: 12,
              fontFamily: 'Outfit, sans-serif',
              paddingTop: 16,
            }}
            iconType="circle"
            iconSize={8}
            payload={activeCompanies.map((c) => ({
              value: c,
              type: 'circle' as const,
              color: COMPANY_COLORS[c],
              id: c,
            }))}
          />

          {/* 추정 구간 음영 */}
          {hasEstimates && firstEstKey && lastEstKey && (
            <ReferenceArea
              x1={firstEstKey}
              x2={lastEstKey}
              fill="#FEF9EC"
              fillOpacity={0.9}
              strokeOpacity={0}
              label={{
                value: lang === 'ko' ? '추정 구간' : 'Estimated',
                position: 'insideTopLeft',
                fontSize: 11,
                fill: '#B45309',
                fontFamily: 'Outfit, sans-serif',
                dy: -4,
              }}
            />
          )}

          {/* 이벤트 레퍼런스 라인 */}
          {filteredEvents.map((evt) => {
            const evtKey = getEventKey(evt.date);
            if (!chartKeys.has(evtKey)) return null;
            const isHighlighted = highlightedEventDate === evt.date;
            const color = SEVERITY_COLORS[evt.severity];
            return (
              <ReferenceLine
                key={evt.id}
                x={evtKey}
                stroke={color}
                strokeDasharray="4 2"
                strokeWidth={isHighlighted ? 2 : 1}
                strokeOpacity={isHighlighted ? 1 : 0.55}
                label={{
                  value: '●',
                  position: 'top',
                  fill: color,
                  fontSize: 10,
                  cursor: 'pointer',
                  onClick: () => onEventClick(evt),
                }}
              />
            );
          })}

          {/* 실제 데이터 라인 (solid) */}
          {activeCompanies.map((company) => (
            <Line
              key={`${company}-actual`}
              type="monotone"
              dataKey={company}
              stroke={COMPANY_COLORS[company]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls={false}
              animationDuration={700}
              animationEasing="ease-out"
              legendType="circle"
            />
          ))}

          {/* 추정치 라인 (dashed + hollow dots) */}
          {activeCompanies.map((company) => (
            <Line
              key={`${company}-est`}
              type="monotone"
              dataKey={`${company}_est`}
              stroke={COMPANY_COLORS[company]}
              strokeWidth={2}
              strokeDasharray="5 3"
              strokeOpacity={0.75}
              connectNulls={false}
              dot={(dotProps: { cx?: number; cy?: number }) => (
                <EstimateDot
                  key={`edot-${dotProps.cx}-${dotProps.cy}`}
                  cx={dotProps.cx}
                  cy={dotProps.cy}
                  color={COMPANY_COLORS[company]}
                  unifiedPoints={unifiedPoints}
                />
              )}
              activeDot={{
                r: 5,
                fill: '#FFFFFF',
                stroke: COMPANY_COLORS[company],
                strokeWidth: 2,
              }}
              legendType="none"
              animationDuration={700}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* YoY 바 차트 */}
      <div style={{ marginTop: 8 }}>
        <div
          style={{
            fontSize: 12,
            color: '#999',
            marginBottom: 4,
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          {t.chart.yoyChange}
        </div>
        <ResponsiveContainer width="100%" height={90}>
          <BarChart
            data={yoyPoints}
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#F0F0F0"
              vertical={false}
            />
            <XAxis dataKey="key" hide />
            <YAxis
              tick={{
                fontSize: 10,
                fill: '#999',
                fontFamily: 'Outfit, sans-serif',
              }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              width={36}
            />
            <ReferenceLine y={0} stroke="#E5E5E5" />
            <Bar dataKey="yoy" radius={[2, 2, 0, 0]} animationDuration={700}>
              {yoyPoints.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.yoy >= 0 ? '#00825A' : '#D32F2F'}
                  fillOpacity={entry.is_estimate ? 0.45 : 0.8}
                  stroke={entry.is_estimate ? (entry.yoy >= 0 ? '#00825A' : '#D32F2F') : 'none'}
                  strokeDasharray={entry.is_estimate ? '3 2' : undefined}
                  strokeWidth={entry.is_estimate ? 1 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
