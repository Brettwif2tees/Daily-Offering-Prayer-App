import * as XLSX from 'xlsx';
import { DailyReadingPlan, DEFAULT_31_DAY_SCHEDULE } from '../data/defaultSchedule';

export interface ColumnMapping {
  dayCol: string;
  psalmCol: string;
  middayProverbCol: string;
  eveningProverbCol: string;
  themeCol?: string;
  notesCol?: string;
}

export interface ParsedSheetResult {
  sheetNames: string[];
  activeSheet: string;
  headers: string[];
  rawRows: Array<Record<string, unknown>>;
  suggestedMapping: ColumnMapping;
}

/**
 * Parses an ArrayBuffer from an uploaded .xlsx or .xls or .csv file
 */
export function parseExcelFile(data: ArrayBuffer): ParsedSheetResult {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  const activeSheet = sheetNames[0] || 'Sheet1';
  const worksheet = workbook.Sheets[activeSheet];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

  // Extract all column headers from first rows
  const headerSet = new Set<string>();
  rawRows.forEach((row) => {
    Object.keys(row).forEach((k) => headerSet.add(k));
  });
  const headers = Array.from(headerSet);

  const suggestedMapping = detectColumnMapping(headers);

  return {
    sheetNames,
    activeSheet,
    headers,
    rawRows,
    suggestedMapping
  };
}

/**
 * Intelligent header fuzzy matching
 */
export function detectColumnMapping(headers: string[]): ColumnMapping {
  const findMatch = (patterns: RegExp[]): string => {
    for (const pattern of patterns) {
      const match = headers.find((h) => pattern.test(h.trim()));
      if (match) return match;
    }
    return '';
  };

  const dayCol = findMatch([
    /^day$/i,
    /^day\s*of\s*month$/i,
    /^date$/i,
    /^day\s*#$/i,
    /day/i,
    /date/i,
    /^no\.?$/i,
    /^index$/i
  ]) || headers[0] || '';

  const psalmCol = findMatch([
    /^morning\s*psalm/i,
    /appointed\s*psalm/i,
    /psalm/i,
    /morning/i
  ]) || headers[1] || '';

  const middayProverbCol = findMatch([
    /^midday\s*proverb/i,
    /midday\s*reading/i,
    /noon\s*proverb/i,
    /midday/i,
    /proverb.*1/i,
    /proverb/i
  ]) || headers[2] || '';

  const eveningProverbCol = findMatch([
    /^evening\s*proverb/i,
    /evening\s*reading/i,
    /night\s*proverb/i,
    /evening/i,
    /proverb.*2/i,
    /proverb/i
  ]) || (headers[3] || middayProverbCol);

  const themeCol = findMatch([
    /theme/i,
    /title/i,
    /focus/i,
    /meditation/i
  ]);

  const notesCol = findMatch([
    /notes?/i,
    /reflection/i,
    /verse/i,
    /comment/i
  ]);

  return {
    dayCol,
    psalmCol,
    middayProverbCol,
    eveningProverbCol,
    themeCol: themeCol || undefined,
    notesCol: notesCol || undefined
  };
}

/**
 * Converts parsed raw rows into a clean DailyReadingPlan array
 */
export function convertRowsToSchedule(
  rows: Array<Record<string, unknown>>,
  mapping: ColumnMapping
): DailyReadingPlan[] {
  const plans: DailyReadingPlan[] = [];

  rows.forEach((row, idx) => {
    const rawDay = row[mapping.dayCol];
    let dayNum = idx + 1;

    if (typeof rawDay === 'number') {
      dayNum = rawDay;
    } else if (typeof rawDay === 'string') {
      const numMatch = rawDay.match(/\d+/);
      if (numMatch) {
        dayNum = parseInt(numMatch[0], 10);
      }
    }

    const morningPsalm = String(row[mapping.psalmCol] || `Psalm ${dayNum}`).trim();
    const middayProverb = String(row[mapping.middayProverbCol] || `Proverbs ${dayNum}:1-16`).trim();
    const eveningProverb = String(row[mapping.eveningProverbCol] || `Proverbs ${dayNum}:17-33`).trim();

    const theme = mapping.themeCol && row[mapping.themeCol]
      ? String(row[mapping.themeCol]).trim()
      : `Day ${dayNum} Offering`;

    const notes = mapping.notesCol && row[mapping.notesCol]
      ? String(row[mapping.notesCol]).trim()
      : undefined;

    plans.push({
      day: dayNum,
      label: `Day ${dayNum}`,
      theme,
      morningPsalm,
      middayProverb,
      eveningProverb,
      notes
    });
  });

  return plans.length > 0 ? plans : DEFAULT_31_DAY_SCHEDULE;
}

/**
 * Generates and triggers download of an .xlsx spreadsheet of the current schedule
 */
export function exportScheduleToExcel(schedule: DailyReadingPlan[], filename = 'Daily_Offering_Reading_Schedule.xlsx'): void {
  const rows = schedule.map((p) => ({
    'Day': p.day,
    'Morning Psalm (8:00)': p.morningPsalm,
    'Midday Proverb (11:45)': p.middayProverb,
    'Evening Proverb (17:00)': p.eveningProverb,
    'Theme / Contemplation': p.theme,
    'Notes / Reflection': p.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Offering Plan');

  // Column widths
  worksheet['!cols'] = [
    { wch: 8 },  // Day
    { wch: 22 }, // Morning Psalm
    { wch: 24 }, // Midday Proverb
    { wch: 24 }, // Evening Proverb
    { wch: 38 }, // Theme
    { wch: 50 }, // Notes
  ];

  XLSX.writeFile(workbook, filename);
}

/**
 * Parses tab-delimited or comma-delimited text copied directly from an Excel spreadsheet
 */
export function parsePastedExcelText(text: string): ParsedSheetResult {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) {
    throw new Error('Pasted content is empty');
  }

  // Determine separator (tab or comma)
  const firstLine = lines[0];
  const isTab = firstLine.includes('\t');
  const separator = isTab ? '\t' : ',';

  const rawHeaders = firstLine.split(separator).map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows: Array<Record<string, unknown>> = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(separator).map((c) => c.trim().replace(/^"|"$/g, ''));
    const rowObj: Record<string, unknown> = {};
    rawHeaders.forEach((h, hIdx) => {
      rowObj[h] = cells[hIdx] ?? '';
    });
    rows.push(rowObj);
  }

  return {
    sheetNames: ['Pasted Sheet'],
    activeSheet: 'Pasted Sheet',
    headers: rawHeaders,
    rawRows: rows,
    suggestedMapping: detectColumnMapping(rawHeaders)
  };
}
