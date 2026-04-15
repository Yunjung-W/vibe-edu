import React from 'react';
import type { GeopoliticalEvent, Language, Category, Region } from '../types';
import { SEVERITY_COLORS, REGION_COLORS } from '../constants';
import { t, getRegionLabel, getCategoryLabel } from '../i18n';

interface EventTimelineProps {
  events: GeopoliticalEvent[];
  selectedEventId: string | null;
  selectedCategory: Category | 'all';
  onEventClick: (event: GeopoliticalEvent) => void;
  onCategoryChange: (category: Category | 'all') => void;
  lang: Language;
  yearRange: [number, number];
}

const CATEGORIES: (Category | 'all')[] = ['all', 'trade_policy', 'geopolitics', 'supply_chain', 'regulation', 'labor', 'pandemic'];

export const EventTimeline: React.FC<EventTimelineProps> = ({
  events,
  selectedEventId,
  selectedCategory,
  onEventClick,
  onCategoryChange,
  lang,
  yearRange,
}) => {
  const filteredEvents = events
    .filter((e) => {
      const year = parseInt(e.date.substring(0, 4));
      return year >= yearRange[0] && year <= yearRange[1];
    })
    .filter((e) => selectedCategory === 'all' || e.category === selectedCategory)
    .sort((a, b) => b.date.localeCompare(a.date));

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    return lang === 'ko' ? `${year}년 ${parseInt(month)}월` : `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('en-US', { month: 'short' })} ${year}`;
  };

  return (
    <div>
      {/* Title */}
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 500,
          color: 'var(--hyundai-dark)',
          marginBottom: '16px',
          letterSpacing: '-0.01em',
        }}
      >
        {t(lang, 'timelineTitle')}
      </h2>

      {/* Category tabs */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #E5E5E5',
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            style={{
              padding: '4px 12px',
              borderRadius: '100px',
              border: '1px solid',
              borderColor: selectedCategory === cat ? 'var(--hyundai-blue)' : '#E5E5E5',
              background: selectedCategory === cat ? 'var(--hyundai-blue)' : 'white',
              color: selectedCategory === cat ? 'white' : 'var(--hyundai-gray-dark)',
              fontSize: '12px',
              fontWeight: selectedCategory === cat ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
              whiteSpace: 'nowrap',
            }}
          >
            {getCategoryLabel(lang, cat)}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: '28px', maxHeight: '600px', overflowY: 'auto' }}>
        {/* Timeline vertical line */}
        <div className="timeline-line" />

        {filteredEvents.length === 0 && (
          <p style={{ fontSize: '14px', color: 'var(--hyundai-gray-mid)', padding: '20px 0' }}>
            {lang === 'ko' ? '표시할 이벤트가 없습니다.' : 'No events to display.'}
          </p>
        )}

        {filteredEvents.map((event, i) => {
          const isSelected = event.id === selectedEventId;
          const severityColor = SEVERITY_COLORS[event.severity];

          return (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              style={{
                position: 'relative',
                marginBottom: '16px',
                cursor: 'pointer',
                animationDelay: `${i * 0.05}s`,
              }}
              className="animate-fade-in-up"
            >
              {/* Timeline dot */}
              <div
                style={{
                  position: 'absolute',
                  left: '-22px',
                  top: '14px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: severityColor,
                  border: isSelected ? `3px solid ${severityColor}` : '3px solid white',
                  boxShadow: isSelected ? `0 0 0 3px ${severityColor}40` : '0 0 0 2px #E5E5E5',
                  zIndex: 1,
                  transition: 'all 0.3s',
                }}
              />

              {/* Card */}
              <div
                style={{
                  background: 'white',
                  border: isSelected ? `1px solid ${severityColor}` : '1px solid #F0F0F0',
                  padding: '14px 16px',
                  boxShadow: isSelected
                    ? `0 4px 16px ${severityColor}20`
                    : '0 1px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                  borderLeft: `4px solid ${severityColor}`,
                }}
                className="data-card"
              >
                {/* Date */}
                <p style={{ fontSize: '11px', color: 'var(--hyundai-gray-mid)', marginBottom: '4px' }}>
                  {formatDate(event.date)}
                </p>

                {/* Title */}
                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: 'var(--hyundai-dark)',
                    marginBottom: '6px',
                    lineHeight: 1.4,
                  }}
                >
                  {lang === 'ko' ? event.title : event.title_en}
                </p>

                {/* Description */}
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 300,
                    color: 'var(--hyundai-gray-dark)',
                    lineHeight: 1.6,
                    marginBottom: '10px',
                  }}
                >
                  {lang === 'ko' ? event.description : event.description_en}
                </p>

                {/* Badges row */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Severity badge */}
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '100px',
                      background: `${severityColor}15`,
                      color: severityColor,
                      fontWeight: 500,
                    }}
                  >
                    {t(lang, event.severity)}
                  </span>

                  {/* Region badges */}
                  {event.affected_regions.map((region: Region) => (
                    <span
                      key={region}
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
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
          );
        })}
      </div>
    </div>
  );
};
