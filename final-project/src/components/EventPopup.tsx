import React from 'react';
import type { GeopoliticalEvent, Language, Region } from '../types';
import { SEVERITY_COLORS, REGION_COLORS } from '../constants';
import { t, getRegionLabel } from '../i18n';
import { X } from 'lucide-react';

interface EventPopupProps {
  event: GeopoliticalEvent;
  onClose: () => void;
  lang: Language;
}

export const EventPopup: React.FC<EventPopupProps> = ({ event, onClose, lang }) => {
  const severityColor = SEVERITY_COLORS[event.severity];

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    return lang === 'ko'
      ? `${year}년 ${parseInt(month)}월`
      : `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('en-US', { month: 'long' })} ${year}`;
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        {/* Left color bar */}
        <div style={{ display: 'flex' }}>
          <div style={{ width: '4px', background: severityColor, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            {/* Header */}
            <div
              style={{
                padding: '20px 20px 16px',
                borderBottom: '1px solid #F0F0F0',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <p style={{ fontSize: '11px', color: 'var(--hyundai-gray-mid)', marginBottom: '6px' }}>
                  {formatDate(event.date)}
                </p>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--hyundai-dark)',
                    lineHeight: 1.3,
                  }}
                >
                  {lang === 'ko' ? event.title : event.title_en}
                </h3>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: 'var(--hyundai-gray-mid)',
                  flexShrink: 0,
                  transition: 'color 0.2s',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px' }}>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 300,
                  color: 'var(--hyundai-gray-dark)',
                  lineHeight: 1.7,
                  marginBottom: '20px',
                }}
              >
                {lang === 'ko' ? event.description : event.description_en}
              </p>

              {/* Metadata */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Severity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--hyundai-gray-mid)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      minWidth: '80px',
                    }}
                  >
                    {lang === 'ko' ? '심각도' : 'Severity'}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      padding: '3px 10px',
                      borderRadius: '100px',
                      background: `${severityColor}15`,
                      color: severityColor,
                      fontWeight: 600,
                    }}
                  >
                    {t(lang, event.severity)}
                  </span>
                </div>

                {/* Category */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--hyundai-gray-mid)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      minWidth: '80px',
                    }}
                  >
                    {lang === 'ko' ? '카테고리' : 'Category'}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      padding: '3px 10px',
                      borderRadius: '100px',
                      background: '#F4F4F4',
                      color: 'var(--hyundai-gray-dark)',
                    }}
                  >
                    {lang === 'ko'
                      ? { pandemic: '팬데믹', trade_policy: '무역정책', geopolitics: '지정학', supply_chain: '공급망', regulation: '규제', labor: '노동' }[event.category]
                      : { pandemic: 'Pandemic', trade_policy: 'Trade Policy', geopolitics: 'Geopolitics', supply_chain: 'Supply Chain', regulation: 'Regulation', labor: 'Labor' }[event.category]}
                  </span>
                </div>

                {/* Regions */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--hyundai-gray-mid)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      minWidth: '80px',
                      paddingTop: '4px',
                    }}
                  >
                    {t(lang, 'affectedRegions')}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {event.affected_regions.map((region: Region) => (
                      <span
                        key={region}
                        style={{
                          fontSize: '12px',
                          padding: '3px 10px',
                          borderRadius: '100px',
                          background: '#F4F4F4',
                          color: 'var(--hyundai-gray-dark)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: REGION_COLORS[region],
                            display: 'inline-block',
                          }}
                        />
                        {getRegionLabel(lang, region)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
