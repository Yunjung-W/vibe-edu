import React, { useMemo } from 'react';
import { SalesRecord, COMPANY_COLORS, COMPANIES, Language } from '../types';
import { translations } from '../i18n/translations';

interface RankingsChartProps {
  data: SalesRecord[];
  yearRange: [number, number];
  lang: Language;
}

function computeRankings(data: SalesRecord[], yearRange: [number, number]): Record<number, string[]> {
  const years: number[] = [];
  for (let y = yearRange[0]; y <= yearRange[1]; y++) years.push(y);

  const result: Record<number, string[]> = {};

  years.forEach((year) => {
    const byCompany: Record<string, number> = {};
    data
      .filter((r) => r.year === year)
      .forEach((r) => {
        byCompany[r.company] = (byCompany[r.company] || 0) + r.sales;
      });

    result[year] = Object.entries(byCompany)
      .sort(([, a], [, b]) => b - a)
      .map(([c]) => c);
  });

  return result;
}

const CHART_WIDTH = 460;
const CHART_HEIGHT = 280;
const PADDING_X = 50;
const PADDING_Y = 30;
const DOT_R = 12;

export default function RankingsChart({ data, yearRange, lang }: RankingsChartProps) {
  const t = translations[lang].rankings;

  const years = useMemo(() => {
    const ys: number[] = [];
    for (let y = yearRange[0]; y <= yearRange[1]; y++) ys.push(y);
    return ys;
  }, [yearRange]);

  const rankings = useMemo(() => computeRankings(data, yearRange), [data, yearRange]);

  if (years.length < 2) {
    return (
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#000', fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>
          {t.title}
        </h2>
        <p style={{ fontSize: 13, color: '#999' }}>
          {lang === 'ko' ? '2년 이상의 기간을 선택하세요.' : 'Select a range of 2+ years.'}
        </p>
      </div>
    );
  }

  const maxRank = 5;
  const usableW = CHART_WIDTH - PADDING_X * 2;
  const usableH = CHART_HEIGHT - PADDING_Y * 2;

  const getX = (yearIdx: number) =>
    PADDING_X + (yearIdx / (years.length - 1)) * usableW;

  const getY = (rank: number) =>
    PADDING_Y + ((rank - 1) / (maxRank - 1)) * usableH;

  const activeCompanies = COMPANIES.filter((c) =>
    years.some((y) => (rankings[y] || []).includes(c))
  );

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 500, color: '#000', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>
        {t.title}
      </h2>
      <p style={{ fontSize: 13, color: '#999', marginBottom: 20, fontFamily: 'Outfit, sans-serif' }}>
        {t.subtitle}
      </p>

      <svg
        width="100%"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        style={{ overflow: 'visible' }}
      >
        {/* Rank labels (left) */}
        {[1, 2, 3, 4, 5].map((rank) => (
          <text
            key={rank}
            x={PADDING_X - 14}
            y={getY(rank) + 4}
            textAnchor="end"
            fontSize={11}
            fill="#999"
            fontFamily="Outfit, sans-serif"
          >
            #{rank}
          </text>
        ))}

        {/* Year labels (top) */}
        {years.map((year, i) => (
          <text
            key={year}
            x={getX(i)}
            y={PADDING_Y - 12}
            textAnchor="middle"
            fontSize={12}
            fill="#999"
            fontFamily="Outfit, sans-serif"
          >
            {year}
          </text>
        ))}

        {/* Horizontal grid lines */}
        {[1, 2, 3, 4, 5].map((rank) => (
          <line
            key={rank}
            x1={PADDING_X}
            y1={getY(rank)}
            x2={CHART_WIDTH - PADDING_X}
            y2={getY(rank)}
            stroke="#F0F0F0"
            strokeDasharray="4 2"
          />
        ))}

        {/* Company lines */}
        {activeCompanies.map((company) => {
          const color = COMPANY_COLORS[company];
          const points = years
            .map((year, i) => {
              const rank = (rankings[year] || []).indexOf(company) + 1;
              if (rank === 0) return null;
              return { x: getX(i), y: getY(rank), rank };
            })
            .filter(Boolean) as { x: number; y: number; rank: number }[];

          if (points.length < 2) return null;

          const pathD = points.reduce(
            (acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`),
            ''
          );

          return (
            <g key={company}>
              <path
                d={pathD}
                stroke={color}
                strokeWidth={2}
                fill="none"
                strokeLinejoin="round"
              />
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={DOT_R} fill={color} />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#fff"
                    fontWeight={600}
                    fontFamily="Outfit, sans-serif"
                  >
                    {p.rank}
                  </text>
                </g>
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
        {activeCompanies.map((c) => (
          <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: COMPANY_COLORS[c],
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: 12, color: '#60605B', fontFamily: 'Outfit, sans-serif' }}>
              {c}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
