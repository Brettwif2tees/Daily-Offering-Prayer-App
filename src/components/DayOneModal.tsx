import React, { useState } from 'react';
import { Calendar, Check, RotateCcw, X, Sparkles, Compass } from 'lucide-react';
import {
  DayOneAnchor,
  DailyReadingPlan,
  DEFAULT_DAY_ONE_ANCHOR,
  getDayOfYear,
  calculatePlanDayIndex
} from '../data/defaultSchedule';

interface DayOneModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAnchor: DayOneAnchor;
  onSaveAnchor: (anchor: DayOneAnchor) => void;
  schedule: DailyReadingPlan[];
  currentDate: Date;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const DayOneModal: React.FC<DayOneModalProps> = ({
  isOpen,
  onClose,
  currentAnchor,
  onSaveAnchor,
  schedule,
  currentDate,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(currentAnchor.month);
  const [selectedDay, setSelectedDay] = useState<number>(currentAnchor.day);

  if (!isOpen) return null;

  const maxDays = DAYS_IN_MONTH[selectedMonth] || 31;
  const safeDay = Math.min(selectedDay, maxDays);

  const curYear = currentDate.getFullYear();
  const testAnchor: DayOneAnchor = {
    month: selectedMonth,
    day: safeDay,
    label: `${MONTH_NAMES[selectedMonth]} ${safeDay}`
  };

  const anchorCalendarDay = getDayOfYear(new Date(curYear, selectedMonth, safeDay));
  const planDayForToday = calculatePlanDayIndex(currentDate, testAnchor);
  const readingForToday = schedule.find((item) => item.day === planDayForToday) || schedule[0];

  const todayMonth = currentDate.getMonth();
  const todayDay = currentDate.getDate();

  const handleSetPreset = (month: number, day: number) => {
    setSelectedMonth(month);
    setSelectedDay(day);
  };

  const handleSave = () => {
    onSaveAnchor(testAnchor);
    onClose();
  };

  const handleReset = () => {
    onSaveAnchor(DEFAULT_DAY_ONE_ANCHOR);
    setSelectedMonth(DEFAULT_DAY_ONE_ANCHOR.month);
    setSelectedDay(DEFAULT_DAY_ONE_ANCHOR.day);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-one-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-[#FAF6EE] dark:bg-[#26282E] border border-[#DCD0BE] dark:border-[#3D414B] rounded-2xl shadow-xl max-w-xl w-full p-6 sm:p-8 text-[#2D251F] dark:text-[#E3E5EB] max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#DCD0BE] dark:border-[#3D414B]">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#F2D8DC] dark:bg-[#34373F] text-[#8B1527] dark:text-[#E57380]">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h2 id="day-one-title" className="text-xl sm:text-2xl font-serif font-bold text-[#2D251F] dark:text-[#E3E5EB]">
                Appointed Day 1 Anchor
              </h2>
              <p className="text-xs sm:text-sm text-[#6B5E54] dark:text-[#9DA1AB]">
                Choose which calendar day marks Day 1 of your 365-day reading plan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#6B5E54] hover:text-[#2D251F] dark:text-[#9DA1AB] dark:hover:text-[#E3E5EB] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-5">
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#8B1527] dark:text-[#E57380] mb-2 font-serif">
            Quick Start Anchors
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleSetPreset(todayMonth, todayDay)}
              className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                selectedMonth === todayMonth && safeDay === todayDay
                  ? 'border-[#8B1527] dark:border-[#E57380] bg-[#F2D8DC] dark:bg-[#3D414B] font-semibold text-[#8B1527] dark:text-[#E57380] shadow-xs'
                  : 'border-[#DCD0BE] dark:border-[#3D414B] bg-[#F4EFE6] dark:bg-[#202227] hover:bg-[#EAE0D0] text-[#2D251F] dark:text-[#E3E5EB]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8B1527] dark:text-[#E57380]" />
                <span className="font-semibold">Today</span>
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                {MONTH_NAMES[todayMonth].slice(0, 3)} {todayDay}
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSetPreset(0, 1)}
              className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                selectedMonth === 0 && safeDay === 1
                  ? 'border-[#8B1527] dark:border-[#E57380] bg-[#F2D8DC] dark:bg-[#3D414B] font-semibold text-[#8B1527] dark:text-[#E57380] shadow-xs'
                  : 'border-[#DCD0BE] dark:border-[#3D414B] bg-[#F4EFE6] dark:bg-[#202227] hover:bg-[#EAE0D0] text-[#2D251F] dark:text-[#E3E5EB]'
              }`}
            >
              <span className="font-semibold block">January 1</span>
              <span className="text-[11px] opacity-80">Calendar Year</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetPreset(11, 1)}
              className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                selectedMonth === 11 && safeDay === 1
                  ? 'border-[#8B1527] dark:border-[#E57380] bg-[#F2D8DC] dark:bg-[#3D414B] font-semibold text-[#8B1527] dark:text-[#E57380] shadow-xs'
                  : 'border-[#DCD0BE] dark:border-[#3D414B] bg-[#F4EFE6] dark:bg-[#202227] hover:bg-[#EAE0D0] text-[#2D251F] dark:text-[#E3E5EB]'
              }`}
            >
              <span className="font-semibold block">December 1</span>
              <span className="text-[11px] opacity-80">Advent Season</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetPreset(8, 1)}
              className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                selectedMonth === 8 && safeDay === 1
                  ? 'border-[#8B1527] dark:border-[#E57380] bg-[#F2D8DC] dark:bg-[#3D414B] font-semibold text-[#8B1527] dark:text-[#E57380] shadow-xs'
                  : 'border-[#DCD0BE] dark:border-[#3D414B] bg-[#F4EFE6] dark:bg-[#202227] hover:bg-[#EAE0D0] text-[#2D251F] dark:text-[#E3E5EB]'
              }`}
            >
              <span className="font-semibold block">September 1</span>
              <span className="text-[11px] opacity-80">Ecclesiastical</span>
            </button>
          </div>
        </div>

        {/* Custom Calendar Pickers */}
        <div className="mt-5 p-4 rounded-xl bg-[#F4EFE6] dark:bg-[#202227] border border-[#DCD0BE] dark:border-[#3D414B]">
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#8B1527] dark:text-[#E57380] mb-3 font-serif">
            Select Custom Calendar Date for Day 1
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#6B5E54] dark:text-[#9DA1AB] mb-1">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  const m = parseInt(e.target.value, 10);
                  setSelectedMonth(m);
                  if (selectedDay > DAYS_IN_MONTH[m]) {
                    setSelectedDay(DAYS_IN_MONTH[m]);
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-[#DCD0BE] dark:border-[#4B505C] bg-[#FAF6EE] dark:bg-[#2B2E35] text-[#2D251F] dark:text-[#E3E5EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1527]"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#6B5E54] dark:text-[#9DA1AB] mb-1">
                Day of Month
              </label>
              <select
                value={safeDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg border border-[#DCD0BE] dark:border-[#4B505C] bg-[#FAF6EE] dark:bg-[#2B2E35] text-[#2D251F] dark:text-[#E3E5EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1527]"
              >
                {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[#6B5E54] dark:text-[#9DA1AB]">
            <span>Anchor calendar day: <strong>Day {anchorCalendarDay}</strong> of the standard year</span>
            <span>Plan length: <strong>365 Days</strong></span>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="mt-5 p-4 rounded-xl bg-[#EAE0D0] dark:bg-[#2B2E35] border border-[#DCD0BE] dark:border-[#3D414B]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8B1527] dark:text-[#E57380] mb-2 font-serif">
            <Compass className="w-3.5 h-3.5" />
            <span>Reading Plan Preview with this Anchor</span>
          </div>

          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1 border-b border-[#DCD0BE]/60 dark:border-[#3D414B]/60">
              <span className="text-[#6B5E54] dark:text-[#9DA1AB]">Day 1 will start on:</span>
              <strong className="font-serif text-[#2D251F] dark:text-[#E3E5EB]">
                {MONTH_NAMES[selectedMonth]} {safeDay}
              </strong>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#DCD0BE]/60 dark:border-[#3D414B]/60">
              <span className="text-[#6B5E54] dark:text-[#9DA1AB]">Today ({currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}) will be:</span>
              <strong className="font-serif text-[#8B1527] dark:text-[#E57380]">
                Day {planDayForToday} of 365
              </strong>
            </div>

            <div className="pt-2 text-xs text-[#2D251F] dark:text-[#E3E5EB]">
              <span className="text-[#6B5E54] dark:text-[#9DA1AB]">Today's Appointed Readings:</span>
              <div className="mt-1 font-serif">
                • Morning Offering: <strong>Psalm {readingForToday.morningPsalm}</strong>
                <br />
                • Midday Offering: <strong>Psalm {readingForToday.morningPsalm} · Proverbs {readingForToday.middayProverb}</strong>
                <br />
                • Evening Offering: <strong>Psalm {readingForToday.morningPsalm} · Proverbs {readingForToday.eveningProverb}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-[#DCD0BE] dark:border-[#3D414B] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[#DCD0BE] dark:border-[#4B505C] bg-[#FAF6EE] dark:bg-[#202227] hover:bg-[#EAE0D0] dark:hover:bg-[#34373F] text-xs font-medium text-[#6B5E54] dark:text-[#9DA1AB] flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to January 1</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-[#DCD0BE] dark:border-[#4B505C] text-xs font-medium text-[#2D251F] dark:text-[#E3E5EB] hover:bg-[#EAE0D0] dark:hover:bg-[#34373F] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-[#8B1527] dark:bg-[#9E1E34] text-white hover:bg-[#6F0F1E] dark:hover:bg-[#851627] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Apply Day 1 Anchor</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
