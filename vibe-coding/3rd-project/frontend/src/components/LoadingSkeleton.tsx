import React from 'react';

function SkeletonBlock({ width = '100%', height = 20, style = {} }: { width?: string | number; height?: number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, #F4F4F4 25%, #EAEAEA 50%, #F4F4F4 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 2,
        ...style,
      }}
    />
  );
}

export function ChartSkeleton() {
  return (
    <div style={{ background: '#fff', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <SkeletonBlock height={28} width="30%" style={{ marginBottom: 24 }} />
      <SkeletonBlock height={320} />
      <SkeletonBlock height={80} style={{ marginTop: 8 }} />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 200,
        background: '#fff',
        padding: '28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <SkeletonBlock height={12} width="40%" />
      <SkeletonBlock height={36} width="70%" />
      <SkeletonBlock height={16} width="50%" />
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ paddingLeft: 28, paddingBottom: 20 }}>
          <SkeletonBlock height={100} />
        </div>
      ))}
    </div>
  );
}
