import React, { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import SummaryCards from './components/SummaryCards';
import MainChart from './components/MainChart';
import EventTimeline from './components/EventTimeline';
import RankingsChart from './components/RankingsChart';
import { ChartSkeleton, CardSkeleton, TimelineSkeleton } from './components/LoadingSkeleton';
import { useSalesData } from './hooks/useSalesData';
import { useEventsData } from './hooks/useEventsData';
import { DashboardFilters, EventRecord, Language } from './types';
import { triggerRefresh } from './api/client';
import { translations } from './i18n/translations';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const DEFAULT_FILTERS: DashboardFilters = {
  yearRange: [2020, 2026],
  regions: [],
  companies: [],
  granularity: 'quarterly',
};

function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [lang, setLang] = useState<Language>('ko');
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [highlightedEventDate, setHighlightedEventDate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const qc = useQueryClient();
  const t = translations[lang];

  const { data: salesResponse, isLoading: salesLoading, error: salesError, refetch: refetchSales } = useSalesData(filters);
  const { data: eventsResponse, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useEventsData(filters);

  const salesData = salesResponse?.data || [];
  const eventsData = eventsResponse?.data || [];

  const handleEventClick = useCallback((event: EventRecord) => {
    setSelectedEvent((prev) => (prev?.id === event.id ? null : event));
    setHighlightedEventId((prev) => (prev === event.id ? null : event.id));
    setHighlightedEventDate((prev) => (prev === event.date ? null : event.date));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await triggerRefresh();
      setTimeout(() => {
        qc.invalidateQueries();
        setRefreshing(false);
      }, 2000);
    } catch {
      setRefreshing(false);
    }
  };

  const hasError = salesError && eventsError;

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      <Header lang={lang} onLangToggle={() => setLang((l) => (l === 'ko' ? 'en' : 'ko'))} />

      <div style={{ paddingTop: 72 }}>
        <FilterBar filters={filters} onFiltersChange={setFilters} lang={lang} />

        <main
          className="mx-auto"
          style={{ maxWidth: 1440, paddingLeft: 80, paddingRight: 80, paddingTop: 48, paddingBottom: 80 }}
        >
          {/* Error state */}
          {hasError && (
            <div
              style={{
                background: '#FFF5F5',
                border: '1px solid #FCA5A5',
                borderLeft: '4px solid #D32F2F',
                padding: '16px 20px',
                marginBottom: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 14, color: '#D32F2F' }}>{t.error}</span>
              <button
                onClick={() => { refetchSales(); refetchEvents(); }}
                style={{
                  padding: '6px 16px',
                  border: '1px solid #D32F2F',
                  background: 'transparent',
                  color: '#D32F2F',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                {t.retry}
              </button>
            </div>
          )}

          {/* Summary Cards */}
          <section style={{ marginBottom: 48 }}>
            {salesLoading ? (
              <div style={{ display: 'flex', gap: 24 }}>
                {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
              </div>
            ) : (
              <SummaryCards data={salesData} lang={lang} yearRange={filters.yearRange} />
            )}
          </section>

          {/* Main Chart */}
          <section style={{ marginBottom: 64 }}>
            {salesLoading ? (
              <ChartSkeleton />
            ) : (
              <MainChart
                salesData={salesData}
                eventsData={eventsData}
                filters={filters}
                lang={lang}
                onEventClick={handleEventClick}
                highlightedEventDate={highlightedEventDate}
              />
            )}
          </section>

          {/* Event popup */}
          {selectedEvent && (
            <div
              style={{
                position: 'fixed',
                bottom: 32,
                right: 32,
                width: 360,
                background: '#fff',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                padding: '20px',
                borderLeft: `4px solid ${selectedEvent.severity === 'high' ? '#D32F2F' : selectedEvent.severity === 'medium' ? '#F59E0B' : '#999'}`,
                zIndex: 1000,
                animation: 'slideIn 0.2s ease-out',
              }}
            >
              <style>{`@keyframes slideIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }`}</style>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#999', fontFamily: 'Outfit, sans-serif' }}>{selectedEvent.date}</span>
                <button
                  onClick={() => { setSelectedEvent(null); setHighlightedEventId(null); setHighlightedEventDate(null); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 16, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#000', marginBottom: 8 }}>
                {lang === 'ko' ? selectedEvent.title : selectedEvent.title_en}
              </div>
              <div style={{ fontSize: 13, color: '#60605B', lineHeight: 1.7, fontWeight: 300 }}>
                {lang === 'ko' ? selectedEvent.description : selectedEvent.description_en}
              </div>
            </div>
          )}

          {/* Bottom 2-col */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: '3fr 2fr',
              gap: 40,
              alignItems: 'start',
            }}
          >
            {/* Left: Event Timeline */}
            <div
              style={{
                background: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                padding: '40px',
              }}
            >
              {eventsLoading ? (
                <TimelineSkeleton />
              ) : (
                <EventTimeline
                  events={eventsData}
                  lang={lang}
                  onEventClick={handleEventClick}
                  highlightedEventId={highlightedEventId}
                />
              )}
            </div>

            {/* Right: Rankings */}
            <div
              style={{
                background: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                padding: '40px',
              }}
            >
              <RankingsChart data={salesData} yearRange={filters.yearRange} lang={lang} />
            </div>
          </section>

          {/* Dev refresh button */}
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                padding: '8px 20px',
                border: '1px solid #002C5F',
                background: 'transparent',
                color: '#002C5F',
                fontSize: 13,
                cursor: refreshing ? 'not-allowed' : 'pointer',
                opacity: refreshing ? 0.6 : 1,
                fontFamily: 'Outfit, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              {refreshing
                ? lang === 'ko' ? '수집 중...' : 'Collecting...'
                : lang === 'ko' ? '데이터 새로고침' : 'Refresh Data'}
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid #E5E5E5', padding: '24px 80px' }}>
          <div className="mx-auto" style={{ maxWidth: 1440 }}>
            <p style={{ fontSize: 12, color: '#999999', fontFamily: 'Outfit, sans-serif' }}>
              {t.footer.disclaimer}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
