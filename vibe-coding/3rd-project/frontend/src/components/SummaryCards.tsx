import React from 'react';
import { SalesRecord, Region, REGIONS, REGION_COLORS, Language, COMPANY_COLORS } from '../types';
import { translations } from '../i18n/translations';

interface SummaryCardsProps {
  data: SalesRecord[];
  lang: Language;
  yearRange: [number, number];
}

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString();
}

function RegionCard({
  region,
  records,
  lang,
}: {
  region: typeof REGIONS[0];
  records: SalesRecord[];
  lang: Language;
}) {
  const t = translations[lang].summary;
  const color = REGION_COLORS[region.id];

  const hasEstimate = records.some((r) => r.is_estimate);

  // Total sales for this region in the range
  const totalSales = records.reduce((sum, r) => sum + r.sales, 0);

  // Average YoY (latest year only)
  const latestYear = Math.max(...records.map((r) => r.year), 0);
  const latestRecords = records.filter((r) => r.year === latestYear);
  const avgYoY = latestRecords.length > 0
    ? latestRecords.reduce((sum, r) => sum + r.yoy_change, 0) / latestRecords.length
    : 0;
  const latestIsEst = latestRecords.some((r) => r.is_estimate);

  // Top company by sales in range
  const byCompany: Record<string, number> = {};
  records.forEach((r) => {
    byCompany[r.company] = (byCompany[r.company] || 0) + r.sales;
  });
  const topCompany = Object.entries(byCompany).sort(([, a], [, b]) => b - a)[0]?.[0] || '—';

  const label = lang === 'ko' ? region.label_ko : region.label_en;

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        padding: '28px 28px 0',
        flex: 1,
        minWidth: 200,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            fontSize: 11,
            color: '#999999',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          {label}
        </span>
        {hasEstimate && (
          <span
            style={{
              fontSize: 10,
              background: '#FEF3C7',
              color: '#92400E',
              padding: '1px 6px',
              borderRadius: 999,
              fontWeight: 500,
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: 0,
              textTransform: 'none',
            }}
          >
            {lang === 'ko' ? '추정치 포함' : 'incl. estimates'}
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: 600,
          color: '#000',
          fontFamily: 'Outfit, sans-serif',
          fontVariantNumeric: 'tabular-nums',
          marginTop: 8,
          lineHeight: 1.1,
        }}
      >
        {formatNumber(totalSales)}
        <span style={{ fontSize: 14, fontWeight: 400, color: '#999', marginLeft: 4 }}>k</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 6,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: avgYoY >= 0 ? '#00825A' : '#D32F2F',
            fontFamily: 'Outfit, sans-serif',
            opacity: latestIsEst ? 0.75 : 1,
          }}
        >
          {avgYoY >= 0 ? '↑' : '↓'} {Math.abs(avgYoY).toFixed(1)}%
          {latestIsEst && (
            <span style={{ fontSize: 11, color: '#F59E0B', marginLeft: 3 }}>*</span>
          )}
        </span>
        <span style={{ fontSize: 12, color: '#999' }}>{t.yoyChange}</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          paddingBottom: 20,
        }}
      >
        <span style={{ fontSize: 12, color: '#999' }}>{t.topGroup}</span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 13,
            fontWeight: 500,
            color: '#000',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: COMPANY_COLORS[topCompany] || '#999',
              display: 'inline-block',
            }}
          />
          {topCompany}
        </span>
      </div>

      {/* Bottom color bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: color,
        }}
      />
    </div>
  );
}

export default function SummaryCards({ data, lang, yearRange }: SummaryCardsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
      }}
    >
      {REGIONS.map((region) => {
        const regionRecords = data.filter(
          (r) => r.region === region.id && r.year >= yearRange[0] && r.year <= yearRange[1]
        );
        return (
          <RegionCard
            key={region.id}
            region={region}
            records={regionRecords}
            lang={lang}
          />
        );
      })}
    </div>
  );
}
