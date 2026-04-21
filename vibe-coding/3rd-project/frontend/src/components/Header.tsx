import React from 'react';
import { useMetaInfo } from '../hooks/useMetaInfo';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface HeaderProps {
  lang: Language;
  onLangToggle: () => void;
}

function DataFreshnessIndicator({ lang }: { lang: Language }) {
  const { data: meta } = useMetaInfo();
  const t = translations[lang].meta;

  const isLive = meta?.source === 'live';
  const minutesAgo = meta?.lastUpdated
    ? Math.floor((Date.now() - new Date(meta.lastUpdated).getTime()) / 60000)
    : null;

  const tooltipText = meta?.lastUpdated
    ? `${t.tooltip}: ${new Date(meta.lastUpdated).toLocaleString()}`
    : '';

  return (
    <div className="flex items-center gap-2 group relative" title={tooltipText}>
      <span
        className="inline-block rounded-full transition-colors duration-300"
        style={{
          width: 8,
          height: 8,
          background: isLive ? '#00825A' : '#F59E0B',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 12,
          color: '#60605B',
          whiteSpace: 'nowrap',
          fontFamily: 'Outfit, sans-serif',
        }}
      >
        {isLive
          ? `${t.live} · ${minutesAgo !== null ? minutesAgo : '—'} ${t.updatedAgo}`
          : t.cached}
      </span>
      {tooltipText && (
        <div
          className="absolute bottom-full right-0 mb-2 px-3 py-2 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50"
          style={{
            background: '#000',
            color: '#fff',
            fontSize: 11,
          }}
        >
          {tooltipText}
        </div>
      )}
    </div>
  );
}

export default function Header({ lang, onLangToggle }: HeaderProps) {
  const t = translations[lang];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white"
      style={{ borderBottom: '1px solid #E5E5E5', height: 72 }}
    >
      <div
        className="mx-auto flex items-center justify-between h-full"
        style={{ maxWidth: 1440, paddingLeft: 80, paddingRight: 80 }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 20,
              fontWeight: 600,
              color: '#002C5F',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {t.header.title}
          </h1>
          <p style={{ fontSize: 13, color: '#60605B', fontWeight: 300, marginTop: 2 }}>
            {t.header.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <DataFreshnessIndicator lang={lang} />
          <div style={{ width: 1, height: 20, background: '#E5E5E5' }} />
          <button
            onClick={onLangToggle}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#002C5F',
              fontFamily: 'Outfit, sans-serif',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 4,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#F4F4F4';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
            }}
          >
            {t.header.langToggle}
          </button>
        </div>
      </div>
    </header>
  );
}
