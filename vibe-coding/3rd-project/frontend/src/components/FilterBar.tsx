import React from 'react';
import { DashboardFilters, Region, REGIONS, COMPANIES, COMPANY_COLORS, Language } from '../types';
import { translations } from '../i18n/translations';

interface FilterBarProps {
  filters: DashboardFilters;
  onFiltersChange: (f: DashboardFilters) => void;
  lang: Language;
}

function PillButton({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 14px',
        borderRadius: 999,
        border: `1px solid ${active ? (color || '#002C5F') : '#E5E5E5'}`,
        background: active ? (color || '#002C5F') : '#FFFFFF',
        color: active ? '#FFFFFF' : '#60605B',
        fontSize: 13,
        fontWeight: 400,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        fontFamily: 'Outfit, sans-serif',
      }}
    >
      {children}
    </button>
  );
}

export default function FilterBar({ filters, onFiltersChange, lang }: FilterBarProps) {
  const t = translations[lang].filters;
  const regionT = translations[lang].regions;

  const toggleRegion = (r: Region) => {
    const exists = filters.regions.includes(r);
    const next = exists
      ? filters.regions.filter((x) => x !== r)
      : [...filters.regions, r];
    onFiltersChange({ ...filters, regions: next });
  };

  const toggleCompany = (c: string) => {
    const exists = filters.companies.includes(c);
    const next = exists
      ? filters.companies.filter((x) => x !== c)
      : [...filters.companies, c];
    onFiltersChange({ ...filters, companies: next });
  };

  return (
    <div
      style={{
        background: '#F4F4F4',
        borderBottom: '1px solid #E5E5E5',
        position: 'sticky',
        top: 72,
        zIndex: 40,
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: 1440,
          paddingLeft: 80,
          paddingRight: 80,
          paddingTop: 16,
          paddingBottom: 16,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
        }}
      >
        {/* Period slider */}
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 12, color: '#999', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t.period}
          </span>
          <div className="flex items-center gap-2">
            <select
              value={filters.yearRange[0]}
              onChange={(e) => onFiltersChange({ ...filters, yearRange: [+e.target.value, filters.yearRange[1]] })}
              style={{
                fontSize: 13,
                padding: '4px 8px',
                border: '1px solid #E5E5E5',
                borderRadius: 4,
                background: '#fff',
                color: '#000',
                cursor: 'pointer',
              }}
            >
              {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span style={{ fontSize: 13, color: '#999' }}>–</span>
            <select
              value={filters.yearRange[1]}
              onChange={(e) => onFiltersChange({ ...filters, yearRange: [filters.yearRange[0], +e.target.value] })}
              style={{
                fontSize: 13,
                padding: '4px 8px',
                border: '1px solid #E5E5E5',
                borderRadius: 4,
                background: '#fff',
                color: '#000',
                cursor: 'pointer',
              }}
            >
              {[2020, 2021, 2022, 2023, 2024, 2025, 2026].filter((y) => y >= filters.yearRange[0]).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ width: 1, height: 20, background: '#BFBAAF' }} />

        {/* Region filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: 12, color: '#999', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t.region}
          </span>
          <PillButton
            active={filters.regions.length === 0}
            onClick={() => onFiltersChange({ ...filters, regions: [] })}
          >
            {t.all}
          </PillButton>
          {REGIONS.map((r) => (
            <PillButton
              key={r.id}
              active={filters.regions.includes(r.id)}
              onClick={() => toggleRegion(r.id)}
            >
              {lang === 'ko' ? r.label_ko : r.label_en}
            </PillButton>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: '#BFBAAF' }} />

        {/* Company filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: 12, color: '#999', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t.company}
          </span>
          <PillButton
            active={filters.companies.length === 0}
            onClick={() => onFiltersChange({ ...filters, companies: [] })}
          >
            {t.all}
          </PillButton>
          {COMPANIES.map((c) => (
            <PillButton
              key={c}
              active={filters.companies.includes(c)}
              onClick={() => toggleCompany(c)}
              color={COMPANY_COLORS[c]}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: COMPANY_COLORS[c],
                  display: 'inline-block',
                  flexShrink: 0,
                  ...(filters.companies.includes(c) ? { background: '#fff' } : {}),
                }}
              />
              {c}
            </PillButton>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: '#BFBAAF' }} />

        {/* Granularity toggle */}
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 12, color: '#999', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t.granularity}
          </span>
          <div
            style={{
              display: 'flex',
              borderRadius: 999,
              border: '1px solid #E5E5E5',
              overflow: 'hidden',
              background: '#fff',
            }}
          >
            {(['quarterly', 'annual'] as const).map((g) => (
              <button
                key={g}
                onClick={() => onFiltersChange({ ...filters, granularity: g })}
                style={{
                  padding: '5px 14px',
                  fontSize: 13,
                  border: 'none',
                  background: filters.granularity === g ? '#002C5F' : 'transparent',
                  color: filters.granularity === g ? '#fff' : '#60605B',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                {g === 'quarterly' ? t.quarterly : t.annual}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
