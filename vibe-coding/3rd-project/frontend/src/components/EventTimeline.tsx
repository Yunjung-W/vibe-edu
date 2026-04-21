import React, { useState } from 'react';
import { EventRecord, EventCategory, CATEGORY_LABELS, REGIONS, Language } from '../types';
import { translations } from '../i18n/translations';

interface EventTimelineProps {
  events: EventRecord[];
  lang: Language;
  onEventClick: (event: EventRecord) => void;
  highlightedEventId: string | null;
}

const SEVERITY_COLORS = {
  high: '#D32F2F',
  medium: '#F59E0B',
  low: '#999999',
};

const ALL_CATEGORIES: ('all' | EventCategory)[] = [
  'all',
  'trade_policy',
  'geopolitics',
  'supply_chain',
  'regulation',
  'labor',
  'pandemic',
];

function RegionBadge({ regionId, lang }: { regionId: string; lang: Language }) {
  const region = REGIONS.find((r) => r.id === regionId);
  if (!region) return null;
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 999,
        background: '#F4F4F4',
        color: '#60605B',
        fontSize: 11,
        fontFamily: 'Outfit, sans-serif',
        display: 'inline-block',
      }}
    >
      {lang === 'ko' ? region.label_ko : region.label_en}
    </span>
  );
}

function EventCard({
  event,
  lang,
  isHighlighted,
  onClick,
}: {
  event: EventRecord;
  lang: Language;
  isHighlighted: boolean;
  onClick: () => void;
}) {
  const t = translations[lang].events;
  const sevColor = SEVERITY_COLORS[event.severity];
  const title = lang === 'ko' ? event.title : event.title_en;
  const desc = lang === 'ko' ? event.description : event.description_en;

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        paddingLeft: 28,
        paddingBottom: 28,
        cursor: 'pointer',
      }}
    >
      {/* Timeline dot */}
      <div
        style={{
          position: 'absolute',
          left: -6,
          top: 4,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: sevColor,
          border: '2px solid #fff',
          boxShadow: `0 0 0 2px ${sevColor}30`,
          transition: 'transform 0.2s',
          transform: isHighlighted ? 'scale(1.3)' : 'scale(1)',
        }}
      />

      <div
        style={{
          background: isHighlighted ? '#FFF9F9' : '#FFFFFF',
          border: `1px solid ${isHighlighted ? sevColor + '40' : '#F0F0F0'}`,
          borderLeft: `4px solid ${sevColor}`,
          padding: '12px 16px',
          transition: 'all 0.2s',
          boxShadow: isHighlighted ? `0 2px 8px ${sevColor}20` : '0 1px 3px rgba(0,0,0,0.04)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = isHighlighted
            ? `0 2px 8px ${sevColor}20`
            : '0 1px 3px rgba(0,0,0,0.04)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontSize: 12,
              color: '#999',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {event.date}
          </span>
          <span
            style={{
              fontSize: 11,
              color: sevColor,
              fontWeight: 500,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {t.severity[event.severity]}
          </span>
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: '#000',
            marginBottom: 4,
            lineHeight: 1.4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 300,
            color: '#60605B',
            lineHeight: 1.7,
            marginBottom: 8,
          }}
        >
          {desc}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {event.affected_regions.map((r) => (
            <RegionBadge key={r} regionId={r} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EventTimeline({
  events,
  lang,
  onEventClick,
  highlightedEventId,
}: EventTimelineProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | EventCategory>('all');
  const t = translations[lang].events;

  const filtered = (activeCategory === 'all'
    ? events
    : events.filter((e) => e.category === activeCategory)
  ).slice().sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 500,
          color: '#000',
          fontFamily: 'Outfit, sans-serif',
          marginBottom: 20,
        }}
      >
        {t.title}
      </h2>

      {/* Category tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 28,
        }}
      >
        {ALL_CATEGORIES.map((cat) => {
          const label =
            cat === 'all'
              ? t.categories.all
              : t.categories[cat as EventCategory];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '4px 12px',
                borderRadius: 999,
                border: '1px solid',
                borderColor: activeCategory === cat ? '#002C5F' : '#E5E5E5',
                background: activeCategory === cat ? '#002C5F' : '#FFFFFF',
                color: activeCategory === cat ? '#FFFFFF' : '#60605B',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div
        style={{
          position: 'relative',
          paddingLeft: 20,
        }}
      >
        {/* Vertical line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 2,
            background: '#E5E5E5',
          }}
        />

        {filtered.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            lang={lang}
            isHighlighted={highlightedEventId === event.id}
            onClick={() => onEventClick(event)}
          />
        ))}

        {filtered.length === 0 && (
          <div style={{ fontSize: 14, color: '#999', padding: '20px 0' }}>
            {lang === 'ko' ? '해당 카테고리의 이벤트가 없습니다.' : 'No events in this category.'}
          </div>
        )}
      </div>
    </div>
  );
}
