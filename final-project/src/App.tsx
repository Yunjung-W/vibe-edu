import React, { useState, useMemo, useCallback } from 'react';
import type { FilterState, GeopoliticalEvent, Language, Category } from './types';
import { COMPANIES, REGIONS, MIN_YEAR, MAX_YEAR } from './constants';
import { filterSalesData, aggregateToChartData, aggregateYoYData, eventDateToIndex } from './utils/dataUtils';
import rawSalesData from './data/sales-data.json';
import rawEventsData from './data/events-data.json';
import type { SalesRecord } from './types';

import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { SummaryCards } from './components/SummaryCards';
import { MainChart } from './components/MainChart';
import { EventTimeline } from './components/EventTimeline';
import { RankingsChart } from './components/RankingsChart';
import { EventPopup } from './components/EventPopup';

const salesData = rawSalesData as SalesRecord[];
const eventsData = rawEventsData as GeopoliticalEvent[];

const initialFilters: FilterState = {
  yearRange: [MIN_YEAR, MAX_YEAR],
  regions: [...REGIONS],
  companies: [...COMPANIES],
  viewMode: 'quarterly',
  selectedCategory: 'all',
};

function App() {
  const [lang, setLang] = useState<Language>('ko');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [highlightedPeriod, setHighlightedPeriod] = useState<string | null>(null);
  const [popupEvent, setPopupEvent] = useState<GeopoliticalEvent | null>(null);

  // Filtered & aggregated chart data
  const filteredData = useMemo(
    () => filterSalesData(salesData, filters.yearRange, filters.regions, filters.companies),
    [filters.yearRange, filters.regions, filters.companies]
  );

  const chartData = useMemo(
    () => aggregateToChartData(filteredData, filters.viewMode, filters.regions, filters.companies),
    [filteredData, filters.viewMode, filters.regions, filters.companies]
  );

  const yoyData = useMemo(
    () => aggregateYoYData(salesData, filters.viewMode, filters.regions, filters.companies),
    [filters.viewMode, filters.regions, filters.companies]
  );

  // Filter events based on year range and selected regions
  const filteredEvents = useMemo(
    () =>
      eventsData.filter((ev) => {
        const year = parseInt(ev.date.substring(0, 4));
        if (year < filters.yearRange[0] || year > filters.yearRange[1]) return false;
        // Show events that affect at least one selected region
        return ev.affected_regions.some((r) => filters.regions.includes(r));
      }),
    [filters.yearRange, filters.regions]
  );

  const handleEventClick = useCallback(
    (event: GeopoliticalEvent) => {
      setSelectedEventId(event.id);
      setPopupEvent(event);

      // Highlight period in chart
      const period = eventDateToIndex(event.date, filters.viewMode, filters.yearRange);
      setHighlightedPeriod(period);
    },
    [filters.viewMode, filters.yearRange]
  );

  const handleCategoryChange = useCallback((category: Category | 'all') => {
    setFilters((prev) => ({ ...prev, selectedCategory: category }));
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setSelectedEventId(null);
    setHighlightedPeriod(null);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Header */}
      <Header lang={lang} onLangChange={setLang} />

      {/* Filter Bar */}
      <FilterBar filters={filters} onChange={handleFilterChange} lang={lang} />

      {/* Main content */}
      <main
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '48px 80px 80px',
        }}
        className="px-6 md:px-20"
      >
        {/* Summary Cards */}
        <section style={{ marginBottom: '40px' }}>
          <SummaryCards
            data={salesData}
            regions={filters.regions}
            lang={lang}
            endYear={filters.yearRange[1]}
          />
        </section>

        {/* Main Chart */}
        <section style={{ marginBottom: '48px' }}>
          <MainChart
            chartData={chartData}
            yoyData={yoyData}
            events={filteredEvents}
            companies={filters.companies}
            selectedEventId={selectedEventId}
            highlightedPeriod={highlightedPeriod}
            onEventClick={handleEventClick}
            lang={lang}
          />
        </section>

        {/* Bottom 2-column layout */}
        <section>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '3fr 2fr',
              gap: '32px',
              alignItems: 'start',
            }}
            className="grid-cols-1 lg:grid-cols-5"
          >
            {/* Left: Event Timeline (60%) */}
            <div>
              <EventTimeline
                events={filteredEvents}
                selectedEventId={selectedEventId}
                selectedCategory={filters.selectedCategory}
                onEventClick={handleEventClick}
                onCategoryChange={handleCategoryChange}
                lang={lang}
                yearRange={filters.yearRange}
              />
            </div>

            {/* Right: Rankings (40%) */}
            <div>
              <RankingsChart
                data={salesData}
                regions={filters.regions}
                lang={lang}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #E5E5E5', padding: '24px 80px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: 'var(--hyundai-gray-mid)' }}>
          Data sources may not reflect actual figures. For demonstration purposes only.
        </p>
      </footer>

      {/* Event Popup */}
      {popupEvent && (
        <EventPopup
          event={popupEvent}
          onClose={() => {
            setPopupEvent(null);
            setSelectedEventId(null);
            setHighlightedPeriod(null);
          }}
          lang={lang}
        />
      )}
    </div>
  );
}

export default App;
