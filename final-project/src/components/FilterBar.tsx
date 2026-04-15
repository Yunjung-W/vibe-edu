import React from 'react';
import type { FilterState, Region, Company, Language } from '../types';
import { COMPANIES, REGIONS, COMPANY_COLORS, REGION_COLORS } from '../constants';
import { t, getRegionLabel } from '../i18n';
import { MIN_YEAR, MAX_YEAR } from '../constants';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  lang: Language;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, lang }) => {
  const toggleRegion = (region: Region) => {
    const newRegions = filters.regions.includes(region)
      ? filters.regions.filter((r) => r !== region)
      : [...filters.regions, region];
    if (newRegions.length === 0) return;
    onChange({ ...filters, regions: newRegions });
  };

  const toggleCompany = (company: Company) => {
    const newCompanies = filters.companies.includes(company)
      ? filters.companies.filter((c) => c !== company)
      : [...filters.companies, company];
    if (newCompanies.length === 0) return;
    onChange({ ...filters, companies: newCompanies });
  };

  const allRegionsSelected = filters.regions.length === REGIONS.length;
  const allCompaniesSelected = filters.companies.length === COMPANIES.length;

  const toggleAllRegions = () => {
    onChange({
      ...filters,
      regions: allRegionsSelected ? [REGIONS[0]] : [...REGIONS],
    });
  };

  const toggleAllCompanies = () => {
    onChange({
      ...filters,
      companies: allCompaniesSelected ? [COMPANIES[0]] : [...COMPANIES],
    });
  };

  return (
    <div style={{ background: '#F4F4F4', padding: '16px 0' }}>
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
        className="px-6 md:px-20"
      >
        {/* Row 1: Year range + View mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Period */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--hyundai-gray-mid)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
              {t(lang, 'period')}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hyundai-blue)', minWidth: '32px' }}>
                {filters.yearRange[0]}
              </span>
              <div style={{ position: 'relative', width: '160px' }}>
                <input
                  type="range"
                  min={MIN_YEAR}
                  max={MAX_YEAR}
                  value={filters.yearRange[0]}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val < filters.yearRange[1]) {
                      onChange({ ...filters, yearRange: [val, filters.yearRange[1]] });
                    }
                  }}
                  className="range-slider"
                  style={{ width: '80px' }}
                />
                <input
                  type="range"
                  min={MIN_YEAR}
                  max={MAX_YEAR}
                  value={filters.yearRange[1]}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val > filters.yearRange[0]) {
                      onChange({ ...filters, yearRange: [filters.yearRange[0], val] });
                    }
                  }}
                  className="range-slider"
                  style={{ width: '80px' }}
                />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hyundai-blue)', minWidth: '32px' }}>
                {filters.yearRange[1]}
              </span>
            </div>
          </div>

          {/* Divider */}
          <span style={{ color: '#BFBAAF', fontSize: '16px' }}>|</span>

          {/* View mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--hyundai-gray-mid)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t(lang, 'viewMode')}
            </span>
            <button
              className={`pill-btn ${filters.viewMode === 'quarterly' ? 'active' : ''}`}
              onClick={() => onChange({ ...filters, viewMode: 'quarterly' })}
            >
              {t(lang, 'quarterly')}
            </button>
            <button
              className={`pill-btn ${filters.viewMode === 'annual' ? 'active' : ''}`}
              onClick={() => onChange({ ...filters, viewMode: 'annual' })}
            >
              {t(lang, 'annual')}
            </button>
          </div>
        </div>

        {/* Row 2: Region + Company filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Region */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--hyundai-gray-mid)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t(lang, 'region')}
            </span>
            <button className={`pill-btn ${allRegionsSelected ? 'active' : ''}`} onClick={toggleAllRegions}>
              {t(lang, 'all')}
            </button>
            {REGIONS.map((region) => (
              <button
                key={region}
                className={`pill-btn ${filters.regions.includes(region) && !allRegionsSelected ? 'active' : ''}`}
                onClick={() => toggleRegion(region)}
                style={
                  filters.regions.includes(region) && !allRegionsSelected
                    ? { background: REGION_COLORS[region], borderColor: REGION_COLORS[region], color: 'white' }
                    : {}
                }
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: REGION_COLORS[region],
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {getRegionLabel(lang, region)}
              </button>
            ))}
          </div>

          {/* Divider */}
          <span style={{ color: '#BFBAAF', fontSize: '16px' }}>|</span>

          {/* Company */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--hyundai-gray-mid)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t(lang, 'company')}
            </span>
            <button className={`pill-btn ${allCompaniesSelected ? 'active' : ''}`} onClick={toggleAllCompanies}>
              {t(lang, 'all')}
            </button>
            {COMPANIES.map((company) => (
              <button
                key={company}
                className={`pill-btn ${filters.companies.includes(company) && !allCompaniesSelected ? 'active' : ''}`}
                onClick={() => toggleCompany(company)}
                style={
                  filters.companies.includes(company) && !allCompaniesSelected
                    ? { background: COMPANY_COLORS[company], borderColor: COMPANY_COLORS[company], color: 'white' }
                    : {}
                }
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: COMPANY_COLORS[company],
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {company}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
