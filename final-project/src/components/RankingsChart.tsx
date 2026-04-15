import React from 'react';
import type { RankingData, Language, Region } from '../types';
import { COMPANY_COLORS, COMPANIES } from '../constants';
import { computeRankings } from '../utils/dataUtils';
import type { SalesRecord } from '../types';
import { t } from '../i18n';

interface RankingsChartProps {
  data: SalesRecord[];
  regions: Region[];
  lang: Language;
}

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];
const CHART_HEIGHT = 300;
const RANK_POSITIONS = [1, 2, 3, 4, 5];

export const RankingsChart: React.FC<RankingsChartProps> = ({ data, regions, lang }) => {
  const rankingData = computeRankings(data, regions);

  const getY = (rank: number) => {
    const padding = 30;
    const usableHeight = CHART_HEIGHT - padding * 2;
    return padding + ((rank - 1) / (RANK_POSITIONS.length - 1)) * usableHeight;
  };

  const getX = (yearIndex: number, totalWidth: number) => {
    const padding = 40;
    const usableWidth = totalWidth - padding * 2;
    return padding + (yearIndex / (YEARS.length - 1)) * usableWidth;
  };

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: '0.4s' }}
    >
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 500,
          color: 'var(--hyundai-dark)',
          marginBottom: '20px',
          letterSpacing: '-0.01em',
        }}
      >
        {t(lang, 'rankingsTitle')}
      </h2>

      {/* Bump chart using SVG */}
      <div style={{ background: 'white', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <svg
          viewBox={`0 0 560 ${CHART_HEIGHT + 60}`}
          style={{ width: '100%', height: 'auto' }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background grid lines */}
          {RANK_POSITIONS.map((rank) => (
            <line
              key={rank}
              x1={40}
              y1={getY(rank)}
              x2={520}
              y2={getY(rank)}
              stroke="#F0F0F0"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          ))}

          {/* Rank labels (left) */}
          {RANK_POSITIONS.map((rank) => (
            <text
              key={rank}
              x={28}
              y={getY(rank) + 4}
              textAnchor="end"
              fontSize={11}
              fill="#999999"
              fontFamily="Outfit, sans-serif"
            >
              {rank}{lang === 'ko' ? '위' : `${rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'}`}
            </text>
          ))}

          {/* Year labels (bottom) */}
          {YEARS.map((year, idx) => (
            <text
              key={year}
              x={getX(idx, 560)}
              y={CHART_HEIGHT + 20}
              textAnchor="middle"
              fontSize={11}
              fill="#999999"
              fontFamily="Outfit, sans-serif"
            >
              {year}
            </text>
          ))}

          {/* Lines for each company */}
          {COMPANIES.map((company) => {
            const points = rankingData.map((yd, idx) => {
              const r = yd.rankings.find((r) => r.company === company);
              return { x: getX(idx, 560), y: getY(r?.rank || 5), rank: r?.rank || 5 };
            });

            const pathD = points
              .map((pt, i) => {
                if (i === 0) return `M ${pt.x} ${pt.y}`;
                const prev = points[i - 1];
                const cx = (prev.x + pt.x) / 2;
                return `C ${cx} ${prev.y} ${cx} ${pt.y} ${pt.x} ${pt.y}`;
              })
              .join(' ');

            const color = COMPANY_COLORS[company];

            return (
              <g key={company}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth={2.5}
                  opacity={0.85}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((pt, idx) => (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={14}
                      fill={color}
                      opacity={0.12}
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={8}
                      fill={color}
                      stroke="white"
                      strokeWidth={2}
                    />
                    <text
                      x={pt.x}
                      y={pt.y + 4}
                      textAnchor="middle"
                      fontSize={9}
                      fontWeight={700}
                      fill="white"
                      fontFamily="Outfit, sans-serif"
                    >
                      {pt.rank}
                    </text>
                  </g>
                ))}

                {/* Company name at right end */}
                <text
                  x={530}
                  y={points[points.length - 1].y + 4}
                  fontSize={11}
                  fill={color}
                  fontWeight={600}
                  fontFamily="Outfit, sans-serif"
                >
                  {company === 'Volkswagen' ? 'VW' : company}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #F0F0F0',
          }}
        >
          {COMPANIES.map((company) => (
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
      </div>
    </div>
  );
};
