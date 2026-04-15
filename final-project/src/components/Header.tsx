import React from 'react';
import type { Language } from '../types';
import { t } from '../i18n';

interface HeaderProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onLangChange }) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'white',
        borderBottom: '1px solid #E5E5E5',
        height: '72px',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 80px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        className="px-6 md:px-20"
      >
        {/* Left: Title */}
        <div>
          <h1
            style={{
              fontFamily: "'Outfit', 'Pretendard Variable', sans-serif",
              fontSize: '22px',
              fontWeight: 600,
              color: 'var(--hyundai-blue)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {t(lang, 'dashboardTitle')}
          </h1>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--hyundai-gray-dark)',
              fontWeight: 300,
              marginTop: '2px',
            }}
          >
            {t(lang, 'dashboardSubtitle')}
          </p>
        </div>

        {/* Right: Language toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onLangChange('ko')}
            style={{
              fontSize: '13px',
              fontWeight: lang === 'ko' ? 600 : 400,
              color: lang === 'ko' ? 'var(--hyundai-blue)' : 'var(--hyundai-gray-mid)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              transition: 'color 0.3s',
            }}
          >
            KR
          </button>
          <span style={{ color: '#E5E5E5', fontSize: '14px' }}>|</span>
          <button
            onClick={() => onLangChange('en')}
            style={{
              fontSize: '13px',
              fontWeight: lang === 'en' ? 600 : 400,
              color: lang === 'en' ? 'var(--hyundai-blue)' : 'var(--hyundai-gray-mid)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              transition: 'color 0.3s',
            }}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
};
