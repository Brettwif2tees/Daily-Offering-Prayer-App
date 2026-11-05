import React, { useState, useRef, useMemo } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  Check,
  RefreshCw,
  Search,
  Save,
  ArrowRight,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { DailyReadingPlan, DayOneAnchor, resetScheduleToDefault, saveSchedule } from '../data/defaultSchedule';
import {
  parseExcelFile,
  parsePastedExcelText,
  convertRowsToSchedule,
  exportScheduleToExcel,
  ColumnMapping,
  ParsedSheetResult
} from '../utils/excelHandler';

interface ScheduleSheetModalProps {
  schedule: DailyReadingPlan[];
  onUpdateSchedule: (newSchedule: DailyReadingPlan[]) => void;
  currentDay: number;
  dayOneAnchor?: DayOneAnchor;
  onOpenDayOneModal?: () => void;
}

export const ScheduleSheetModal: React.FC<ScheduleSheetModalProps> = ({
  schedule,
  onUpdateSchedule,
  currentDay,
  dayOneAnchor,
  onOpenDayOneModal,
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'upload' | 'paste'>('view');
  const [editableSchedule, setEditableSchedule] = useState<DailyReadingPlan[]>(schedule);
  const [isSaved, setIsSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // File upload & parsing state
  const [dragActive, setDragActive] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedSheetResult | null>(null);
  const [customMapping, setCustomMapping] = useState<ColumnMapping | null>(null);
  const [previewSchedule, setPreviewSchedule] = useState<DailyReadingPlan[] | null>(null);
  const [pastedText, setPastedText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when schedule changes from outside
  React.useEffect(() => {
    setEditableSchedule(schedule);
  }, [schedule]);

  const handleCellChange = (index: number, field: keyof DailyReadingPlan, value: string | number) => {
    const updated = [...editableSchedule];
    updated[index] = { ...updated[index], [field]: value };
    setEditableSchedule(updated);
    setIsSaved(false);
  };

  const handleSaveChanges = () => {
    saveSchedule(editableSchedule);
    onUpdateSchedule(editableSchedule);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetToDefault = () => {
    if (window.confirm("Reset the reading schedule to the appointed 365-day plan from your Excel file?")) {
      const canonical = resetScheduleToDefault();
      setEditableSchedule(canonical);
      onUpdateSchedule(canonical);
    }
  };

  const handleFile = async (file: File) => {
    setParseError(null);
    try {
      const buffer = await file.arrayBuffer();
      const result = parseExcelFile(buffer);
      if (result.rawRows.length === 0) {
        throw new Error("No data rows found in this sheet.");
      }
      setParsedResult(result);
      setCustomMapping(result.suggestedMapping);
      const initialConverted = convertRowsToSchedule(result.rawRows, result.suggestedMapping);
      setPreviewSchedule(initialConverted);
    } catch (err: unknown) {
      console.error(err);
      setParseError(err instanceof Error ? err.message : "Failed to parse spreadsheet file.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePastedDataParse = () => {
    setParseError(null);
    try {
      const result = parsePastedExcelText(pastedText);
      if (result.rawRows.length === 0) {
        throw new Error("No data rows found in pasted text.");
      }
      setParsedResult(result);
      setCustomMapping(result.suggestedMapping);
      const converted = convertRowsToSchedule(result.rawRows, result.suggestedMapping);
      setPreviewSchedule(converted);
    } catch (err: unknown) {
      console.error(err);
      setParseError(err instanceof Error ? err.message : "Failed to parse pasted table rows.");
    }
  };

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    if (!customMapping || !parsedResult) return;
    const updatedMapping = { ...customMapping, [field]: value };
    setCustomMapping(updatedMapping);
    const updatedSchedule = convertRowsToSchedule(parsedResult.rawRows, updatedMapping);
    setPreviewSchedule(updatedSchedule);
  };

  const handleApplyImportedSchedule = () => {
    if (!previewSchedule || previewSchedule.length === 0) return;
    saveSchedule(previewSchedule);
    setEditableSchedule(previewSchedule);
    onUpdateSchedule(previewSchedule);
    setActiveTab('view');
    setParsedResult(null);
    setPreviewSchedule(null);
    setPastedText('');
  };

  // Filtered rows for fast searching
  const filteredSchedule = useMemo(() => {
    if (!searchQuery.trim()) return editableSchedule;
    const q = searchQuery.toLowerCase().trim();
    return editableSchedule.filter(
      (p) =>
        String(p.day).includes(q) ||
        p.morningPsalm.toLowerCase().includes(q) ||
        p.middayProverb.toLowerCase().includes(q) ||
        p.eveningProverb.toLowerCase().includes(q) ||
        p.theme.toLowerCase().includes(q)
    );
  }, [editableSchedule, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Tab Bar */}
      <div className="bg-[#FAF6EE] dark:bg-[#26282E] rounded-xl border border-[#DCD0BE] dark:border-[#3D414B] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8B1527] dark:text-[#E57380] font-serif">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>User Excel Plan (Psalm_and_Proverb_reading_plan)</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#2D251F] dark:text-[#E3E5EB] mt-0.5">
              Appointed Excel Readings (365 Days)
            </h2>
            <p className="text-xs text-[#6B5E54] dark:text-[#9DA1AB] mt-1 max-w-xl">
              The daily appointed Psalm is read across morning, midday, and evening offerings, with the appointed Proverbs added during midday and evening prayer. All 365 days from your Excel file are loaded and fully editable below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenDayOneModal && (
              <button
                onClick={onOpenDayOneModal}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-[#8B1527]/30 text-[#8B1527] dark:text-[#E57380] bg-[#F2D8DC] dark:bg-[#3D414B] hover:bg-[#EAC8CE] dark:hover:bg-[#464B56] transition-colors flex items-center gap-1.5"
                title="Change which date marks Day 1 of the reading year"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Day 1: <strong>{dayOneAnchor?.label || 'Jan 1'}</strong></span>
              </button>
            )}
            <button
              onClick={() => exportScheduleToExcel(editableSchedule, 'Psalm_and_Proverb_reading_plan.xlsx')}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-[#DCD0BE] dark:border-[#3D414B] bg-[#F3ECE1] dark:bg-[#2B2E35] hover:bg-[#EAE0D0] dark:hover:bg-[#34373F] text-[#2D251F] dark:text-[#E3E5EB] flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel (.xlsx)</span>
            </button>
            <button
              onClick={handleResetToDefault}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-[#DCD0BE] dark:border-[#3D414B] text-[#6B5E54] dark:text-[#9DA1AB] hover:text-[#2D251F] dark:hover:text-[#E3E5EB] transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to File</span>
            </button>
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#ECE2D2] dark:bg-[#34373F] rounded-lg mt-6 w-fit">
          <button
            onClick={() => setActiveTab('view')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'view'
                ? 'bg-[#FAF6EE] dark:bg-[#202227] text-[#2D251F] dark:text-[#E3E5EB] shadow-xs'
                : 'text-[#6B5E54] dark:text-[#9DA1AB] hover:text-[#2D251F] dark:hover:text-[#E3E5EB]'
            }`}
          >
            All 365 Days ({editableSchedule.length} Rows)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-[#FAF6EE] dark:bg-[#202227] text-[#2D251F] dark:text-[#E3E5EB] shadow-xs'
                : 'text-[#6B5E54] dark:text-[#9DA1AB] hover:text-[#2D251F] dark:hover:text-[#E3E5EB]'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload Another Excel</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'paste'
                ? 'bg-[#FAF6EE] dark:bg-[#202227] text-[#2D251F] dark:text-[#E3E5EB] shadow-xs'
                : 'text-[#6B5E54] dark:text-[#9DA1AB] hover:text-[#2D251F] dark:hover:text-[#E3E5EB]'
            }`}
          >
            Paste Excel Columns
          </button>
        </div>
      </div>

      {/* Tab 1: Current Schedule Table with Inline Editing */}
      {activeTab === 'view' && (
        <div className="bg-[#FAF6EE] dark:bg-[#26282E] rounded-xl border border-[#DCD0BE] dark:border-[#3D414B] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#DCD0BE] dark:border-[#3D414B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6B5E54] dark:text-[#9DA1AB]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search day # or reading..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#DCD0BE] dark:border-[#3D414B] bg-[#F3ECE1] dark:bg-[#202227] text-[#2D251F] dark:text-[#E3E5EB] focus:outline-none focus:border-[#8B1527]"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {isSaved && (
                <span className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
              <button
                onClick={handleSaveChanges}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#8B1527] dark:bg-[#9E1E34] text-white hover:bg-[#6F0F1E] transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Edits</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#ECE2D2] dark:bg-[#202227] sticky top-0 z-10 border-b border-[#DCD0BE] dark:border-[#3D414B] text-xs uppercase tracking-wider text-[#6B5E54] dark:text-[#9DA1AB]">
                <tr>
                  <th className="py-3 px-4 w-20">Day</th>
                  <th className="py-3 px-4 w-48">
                    <span className="text-[#8B1527] dark:text-[#E57380]">Appointed Psalm</span>
                    <span className="block text-[10px] lowercase text-[#6B5E54] dark:text-[#9DA1AB]">all offerings</span>
                  </th>
                  <th className="py-3 px-4 w-48">
                    <span className="text-[#2D251F] dark:text-[#E3E5EB]">Midday Proverb</span>
                    <span className="block text-[10px] lowercase text-[#6B5E54] dark:text-[#9DA1AB]">midday offering</span>
                  </th>
                  <th className="py-3 px-4 w-48">
                    <span className="text-[#2D251F] dark:text-[#E3E5EB]">Evening Proverb</span>
                    <span className="block text-[10px] lowercase text-[#6B5E54] dark:text-[#9DA1AB]">evening offering</span>
                  </th>
                  <th className="py-3 px-4">Theme & Devotion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCD0BE]/60 dark:divide-[#3D414B]/60">
                {filteredSchedule.map((plan) => {
                  const isCurrent = plan.day === currentDay;
                  const originalIndex = editableSchedule.findIndex((p) => p.day === plan.day);
                  return (
                    <tr
                      key={plan.day}
                      className={`hover:bg-[#EBDCC8]/40 dark:hover:bg-[#34373F]/40 transition-colors ${
                        isCurrent ? 'bg-[#EBDCC8]/70 dark:bg-[#34373F]/60' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 font-mono font-medium text-xs text-[#2D251F] dark:text-[#E3E5EB]">
                        {isCurrent ? (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-[#8B1527] text-white text-[10px] font-bold">
                            Day {plan.day}
                          </span>
                        ) : (
                          `Day ${plan.day}`
                        )}
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={plan.morningPsalm}
                          onChange={(e) => handleCellChange(originalIndex, 'morningPsalm', e.target.value)}
                          className="w-full bg-transparent px-2 py-1 rounded text-[#2D251F] dark:text-[#E3E5EB] font-serif border border-transparent hover:border-[#DCD0BE] dark:hover:border-[#4B505C] focus:border-[#8B1527] focus:bg-[#FAF6EE] dark:focus:bg-[#202227] text-sm"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={plan.middayProverb}
                          onChange={(e) => handleCellChange(originalIndex, 'middayProverb', e.target.value)}
                          className="w-full bg-transparent px-2 py-1 rounded text-[#2D251F] dark:text-[#E3E5EB] font-serif border border-transparent hover:border-[#DCD0BE] dark:hover:border-[#4B505C] focus:border-[#8B1527] focus:bg-[#FAF6EE] dark:focus:bg-[#202227] text-sm"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={plan.eveningProverb}
                          onChange={(e) => handleCellChange(originalIndex, 'eveningProverb', e.target.value)}
                          className="w-full bg-transparent px-2 py-1 rounded text-[#2D251F] dark:text-[#E3E5EB] font-serif border border-transparent hover:border-[#DCD0BE] dark:hover:border-[#4B505C] focus:border-[#8B1527] focus:bg-[#FAF6EE] dark:focus:bg-[#202227] text-sm"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={plan.theme}
                          onChange={(e) => handleCellChange(originalIndex, 'theme', e.target.value)}
                          className="w-full bg-transparent px-2 py-1 rounded text-[#6B5E54] dark:text-[#9DA1AB] italic border border-transparent hover:border-[#DCD0BE] dark:hover:border-[#4B505C] focus:border-[#8B1527] focus:bg-[#FAF6EE] dark:focus:bg-[#202227] text-xs"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Upload Excel File */}
      {activeTab === 'upload' && (
        <div className="bg-[#FAF6EE] dark:bg-[#26282E] rounded-xl border border-[#DCD0BE] dark:border-[#3D414B] p-6 shadow-xs space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-[#8B1527] bg-[#F2D8DC]/30 dark:bg-[#34373F]/40'
                : 'border-[#DCD0BE] dark:border-[#3D414B] hover:border-[#8B1527] bg-[#F9F5EC] dark:bg-[#202227]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-[#F2D8DC] dark:bg-[#3D414B] flex items-center justify-center text-[#8B1527] dark:text-[#E57380] mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-semibold text-[#2D251F] dark:text-[#E3E5EB] text-base">
              Drop another Excel (.xlsx, .xls) or CSV file here
            </h3>
            <p className="text-xs text-[#6B5E54] dark:text-[#9DA1AB] mt-1">
              Supports columns for Day, Morning Psalm, Midday Proverb, Evening Proverb, and Themes.
            </p>
          </div>

          {parseError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Column Mapping & Preview */}
          {parsedResult && customMapping && previewSchedule && (
            <div className="border border-[#DCD0BE] dark:border-[#3D414B] rounded-xl p-5 bg-[#F3ECE1] dark:bg-[#202227] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-semibold text-[#2D251F] dark:text-[#E3E5EB]">
                    Match Excel Sheet Columns ({parsedResult.rawRows.length} rows loaded)
                  </h4>
                  <p className="text-xs text-[#6B5E54] dark:text-[#9DA1AB]">
                    Verify which column corresponds to each daily reading office.
                  </p>
                </div>
                <button
                  onClick={handleApplyImportedSchedule}
                  className="px-4 py-2 bg-[#8B1527] text-white rounded-lg text-xs font-medium hover:bg-[#6F0F1E] transition-colors flex items-center gap-1.5"
                >
                  <span>Apply & Save Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#2D251F] dark:text-[#E3E5EB] mb-1">
                    Day / Date Column
                  </label>
                  <select
                    value={customMapping.dayCol}
                    onChange={(e) => handleMappingChange('dayCol', e.target.value)}
                    className="w-full text-xs p-2 rounded border border-[#DCD0BE] dark:border-[#3D414B] bg-[#FAF6EE] dark:bg-[#26282E] text-[#2D251F] dark:text-[#E3E5EB]"
                  >
                    {parsedResult.headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#2D251F] dark:text-[#E3E5EB] mb-1">
                    Morning Psalm Column (8:00)
                  </label>
                  <select
                    value={customMapping.psalmCol}
                    onChange={(e) => handleMappingChange('psalmCol', e.target.value)}
                    className="w-full text-xs p-2 rounded border border-[#DCD0BE] dark:border-[#3D414B] bg-[#FAF6EE] dark:bg-[#26282E] text-[#2D251F] dark:text-[#E3E5EB]"
                  >
                    {parsedResult.headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#2D251F] dark:text-[#E3E5EB] mb-1">
                    Midday Proverb Column (12:00)
                  </label>
                  <select
                    value={customMapping.middayProverbCol}
                    onChange={(e) => handleMappingChange('middayProverbCol', e.target.value)}
                    className="w-full text-xs p-2 rounded border border-[#DCD0BE] dark:border-[#3D414B] bg-[#FAF6EE] dark:bg-[#26282E] text-[#2D251F] dark:text-[#E3E5EB]"
                  >
                    {parsedResult.headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#2D251F] dark:text-[#E3E5EB] mb-1">
                    Evening Proverb Column (17:00)
                  </label>
                  <select
                    value={customMapping.eveningProverbCol}
                    onChange={(e) => handleMappingChange('eveningProverbCol', e.target.value)}
                    className="w-full text-xs p-2 rounded border border-[#DCD0BE] dark:border-[#3D414B] bg-[#FAF6EE] dark:bg-[#26282E] text-[#2D251F] dark:text-[#E3E5EB]"
                  >
                    {parsedResult.headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview Rows */}
              <div className="border border-[#DCD0BE] dark:border-[#3D414B] rounded-lg overflow-hidden max-h-48 overflow-y-auto bg-[#FAF6EE] dark:bg-[#26282E]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#ECE2D2] dark:bg-[#202227] text-[#6B5E54] dark:text-[#9DA1AB]">
                    <tr>
                      <th className="p-2">Day</th>
                      <th className="p-2">Morning Psalm</th>
                      <th className="p-2">Midday Proverb</th>
                      <th className="p-2">Evening Proverb</th>
                      <th className="p-2">Theme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCD0BE]/60 dark:divide-[#3D414B]/60">
                    {previewSchedule.slice(0, 5).map((p) => (
                      <tr key={p.day}>
                        <td className="p-2 font-mono">Day {p.day}</td>
                        <td className="p-2 font-serif">{p.morningPsalm}</td>
                        <td className="p-2 font-serif">{p.middayProverb}</td>
                        <td className="p-2 font-serif">{p.eveningProverb}</td>
                        <td className="p-2 text-[#6B5E54] dark:text-[#9DA1AB] italic">{p.theme}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Paste Direct Columns from Excel or Google Sheets */}
      {activeTab === 'paste' && (
        <div className="bg-[#FAF6EE] dark:bg-[#26282E] rounded-xl border border-[#DCD0BE] dark:border-[#3D414B] p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif font-semibold text-[#2D251F] dark:text-[#E3E5EB] text-base">
              Paste Spreadsheet Data
            </h3>
            <p className="text-xs text-[#6B5E54] dark:text-[#9DA1AB] mt-1">
              Select cells in Microsoft Excel or Google Sheets, copy (Ctrl+C), and paste directly below.
            </p>
          </div>

          <textarea
            rows={7}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={`Day\tPslam\tProverbs\t\n1\t1\t10v1\t10v2\n2\t2\t10v3\t10v4`}
            className="w-full text-xs font-mono p-3 rounded-lg border border-[#DCD0BE] dark:border-[#3D414B] bg-[#F3ECE1] dark:bg-[#202227] text-[#2D251F] dark:text-[#E3E5EB] focus:border-[#8B1527] focus:bg-[#FAF6EE] dark:focus:bg-[#26282E]"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#6B5E54] dark:text-[#9DA1AB]">Tab-separated or comma-separated rows</span>
            <button
              onClick={handlePastedDataParse}
              disabled={!pastedText.trim()}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-[#8B1527] text-white hover:bg-[#6F0F1E] transition-colors disabled:opacity-50"
            >
              Parse Pasted Data
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
