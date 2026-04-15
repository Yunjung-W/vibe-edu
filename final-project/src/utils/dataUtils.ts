import type { SalesRecord, ChartDataPoint, YoYDataPoint, Region, Company, Quarter, ViewMode, RankingData } from '../types';
import { COMPANIES } from '../constants';

export function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR');
}

export function formatSalesUnit(n: number): string {
  return (n / 10000).toFixed(1);
}

const QUARTER_ORDER: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export function getPeriodKey(year: number, quarter: Quarter): string {
  return `${year} ${quarter}`;
}

export function getYearQuarterFromPeriod(period: string): { year: number; quarter: Quarter } {
  const [y, q] = period.split(' ');
  return { year: parseInt(y), quarter: q as Quarter };
}

export function filterSalesData(
  data: SalesRecord[],
  yearRange: [number, number],
  regions: Region[],
  companies: Company[]
): SalesRecord[] {
  return data.filter(
    (d) =>
      d.year >= yearRange[0] &&
      d.year <= yearRange[1] &&
      regions.includes(d.region) &&
      companies.includes(d.company)
  );
}

export function aggregateToChartData(
  data: SalesRecord[],
  viewMode: ViewMode,
  regions: Region[],
  companies: Company[]
): ChartDataPoint[] {
  if (viewMode === 'quarterly') {
    const periodMap = new Map<string, ChartDataPoint>();

    // Create all periods in range
    const years = [...new Set(data.map((d) => d.year))].sort();
    for (const year of years) {
      for (const q of QUARTER_ORDER) {
        const key = getPeriodKey(year, q);
        if (!periodMap.has(key)) {
          periodMap.set(key, { period: key, year, quarter: q });
        }
      }
    }

    // Aggregate sales by period + company
    for (const record of data) {
      if (!regions.includes(record.region)) continue;
      if (!companies.includes(record.company)) continue;
      const key = getPeriodKey(record.year, record.quarter);
      const point = periodMap.get(key);
      if (point) {
        point[record.company] = ((point[record.company] as number) || 0) + record.sales;
      }
    }

    return [...periodMap.values()].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return QUARTER_ORDER.indexOf(a.quarter!) - QUARTER_ORDER.indexOf(b.quarter!);
    });
  } else {
    // Annual aggregation
    const yearMap = new Map<number, ChartDataPoint>();

    const years = [...new Set(data.map((d) => d.year))].sort();
    for (const year of years) {
      yearMap.set(year, { period: String(year), year });
    }

    for (const record of data) {
      if (!regions.includes(record.region)) continue;
      if (!companies.includes(record.company)) continue;
      const point = yearMap.get(record.year);
      if (point) {
        point[record.company] = ((point[record.company] as number) || 0) + record.sales;
      }
    }

    return [...yearMap.values()].sort((a, b) => a.year - b.year);
  }
}

export function aggregateYoYData(
  data: SalesRecord[],
  viewMode: ViewMode,
  regions: Region[],
  companies: Company[]
): YoYDataPoint[] {
  // Build the chart data first
  const chartData = aggregateToChartData(data, viewMode, regions, companies);

  // Calculate YoY change from raw data
  if (viewMode === 'quarterly') {
    return chartData.map((point) => {
      const yoyPoint: YoYDataPoint = { period: point.period, year: point.year, quarter: point.quarter };

      for (const company of companies) {
        // find previous year same quarter records
        const filtered = data.filter(
          (d) =>
            d.company === company &&
            d.year === point.year - 1 &&
            d.quarter === point.quarter &&
            regions.includes(d.region)
        );
        const prevSales = filtered.reduce((sum, d) => sum + d.sales, 0);

        const currentFiltered = data.filter(
          (d) =>
            d.company === company &&
            d.year === point.year &&
            d.quarter === point.quarter &&
            regions.includes(d.region)
        );
        const currentSales = currentFiltered.reduce((sum, d) => sum + d.sales, 0);

        if (prevSales > 0 && currentSales > 0) {
          yoyPoint[company] = parseFloat((((currentSales - prevSales) / prevSales) * 100).toFixed(1));
        }
      }

      return yoyPoint;
    });
  } else {
    return chartData.map((point) => {
      const yoyPoint: YoYDataPoint = { period: point.period, year: point.year };

      for (const company of companies) {
        const prevFiltered = data.filter(
          (d) => d.company === company && d.year === point.year - 1 && regions.includes(d.region)
        );
        const prevSales = prevFiltered.reduce((sum, d) => sum + d.sales, 0);

        const currentFiltered = data.filter(
          (d) => d.company === company && d.year === point.year && regions.includes(d.region)
        );
        const currentSales = currentFiltered.reduce((sum, d) => sum + d.sales, 0);

        if (prevSales > 0 && currentSales > 0) {
          yoyPoint[company] = parseFloat((((currentSales - prevSales) / prevSales) * 100).toFixed(1));
        }
      }

      return yoyPoint;
    });
  }
}

export function computeRegionSummaries(
  data: SalesRecord[],
  year: number,
  regions: Region[]
) {
  return regions.map((region) => {
    const regionData = data.filter((d) => d.year === year && d.region === region);
    const prevData = data.filter((d) => d.year === year - 1 && d.region === region);

    const totalSales = regionData.reduce((sum, d) => sum + d.sales, 0);
    const prevSales = prevData.reduce((sum, d) => sum + d.sales, 0);
    const yoyChange = prevSales > 0 ? ((totalSales - prevSales) / prevSales) * 100 : 0;

    // Find top company
    const companySales: Record<string, number> = {};
    for (const record of regionData) {
      companySales[record.company] = (companySales[record.company] || 0) + record.sales;
    }
    const topGroup = (Object.entries(companySales).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Toyota') as Company;

    return { region, totalSales, yoyChange, topGroup };
  });
}

export function computeRankings(data: SalesRecord[], regions: Region[]): RankingData[] {
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  return years.map((year) => {
    const companySales: Record<string, number> = {};
    for (const company of COMPANIES) {
      companySales[company] = data
        .filter((d) => d.year === year && d.company === company && regions.includes(d.region))
        .reduce((sum, d) => sum + d.sales, 0);
    }

    const sorted = Object.entries(companySales)
      .sort((a, b) => b[1] - a[1])
      .map(([company, sales], idx) => ({
        company: company as Company,
        rank: idx + 1,
        sales,
      }));

    return { year, rankings: sorted };
  });
}

export function eventDateToIndex(
  dateStr: string,
  viewMode: ViewMode,
  yearRange: [number, number]
): string | null {
  const [yearStr, monthStr] = dateStr.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  if (year < yearRange[0] || year > yearRange[1]) return null;

  if (viewMode === 'quarterly') {
    let quarter: Quarter;
    if (month <= 3) quarter = 'Q1';
    else if (month <= 6) quarter = 'Q2';
    else if (month <= 9) quarter = 'Q3';
    else quarter = 'Q4';
    return getPeriodKey(year, quarter);
  } else {
    return String(year);
  }
}

export function downloadCSV(chartData: ChartDataPoint[], companies: Company[]) {
  const headers = ['Period', ...companies];
  const rows = chartData.map((d) => [
    d.period,
    ...companies.map((c) => d[c] ?? ''),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'auto_industry_sales.csv';
  a.click();
  URL.revokeObjectURL(url);
}
