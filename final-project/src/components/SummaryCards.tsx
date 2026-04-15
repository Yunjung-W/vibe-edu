import React from 'react';
import type { Language, Region, SalesRecord } from '../types';
import { REGION_COLORS } from '../constants';
import { computeRegionSummaries, formatNumber } from '../utils/dataUtils';
import { t, getRegionLabel } from '../i18n';

interface SummaryCardsProps {
  data: SalesRecord[];
  regions: Region[];
  lang: Language;
  endYear: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data, regions, lang, endYear }) => {
  const summaries = computeRegionSummaries(data, endYear, regions);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(regions.length, 4)}, 1fr)`,
        gap: '16px',
      }}
      className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    >
      {summaries.map((summary, i) => (
        <div
          key={summary.region}
          className="data-card animate-fade-in-up"
          style={{
            animationDelay: `${i * 0.1}s`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '20px 20px 16px' }}>
            {/* Label */}
            <p
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--hyundai-gray-mid)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '8px',
              }}
            >
              {getRegionLabel(lang, summary.region)}
            </p>

            {/* Sales number */}
            <p
              className="tabular-nums"
              style={{
                fontSize: '28px',
                fontWeight: 600,
                color: 'var(--hyundai-dark)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                marginBottom: '6px',
              }}
            >
              {formatNumber(Math.round(summary.totalSales / 10000))}
              <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--hyundai-gray-mid)', marginLeft: '4px' }}>
                {t(lang, 'unit')}
              </span>
            </p>

            {/* YoY */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: summary.yoyChange >= 0 ? 'var(--hyundai-positive)' : 'var(--hyundai-negative)',
                }}
              >
                {summary.yoyChange >= 0 ? '↑' : '↓'}{' '}
                {Math.abs(summary.yoyChange).toFixed(1)}%
              </span>
              <span style={{ fontSize: '12px', color: 'var(--hyundai-gray-mid)' }}>
                {t(lang, 'yoyGrowth')}
              </span>
            </div>

            {/* Top group */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                paddingTop: '10px',
                borderTop: '1px solid #F0F0F0',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--hyundai-gray-mid)' }}>
                {t(lang, 'topGroup')}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--hyundai-blue)',
                }}
              >
                {summary.topGroup}
              </span>
            </div>
          </div>

          {/* Bottom color bar */}
          <div
            style={{
              height: '4px',
              background: REGION_COLORS[summary.region],
            }}
          />
        </div>
      ))}
    </div>
  );
};
