import React from 'react';
import { Bell, FileSpreadsheet, BookOpen, Sun, Moon } from 'lucide-react';
import { IchthysWheelIcon } from './IchthysWheelIcon';

interface TopNavProps {
  activeTab: 'office' | 'schedule' | 'notifications';
  setActiveTab: (tab: 'office' | 'schedule' | 'notifications') => void;
  nextPrayerName: string;
  nextPrayerCountdown: string;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  nextPrayerName,
  nextPrayerCountdown,
  isDark,
  setIsDark,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#ECE4D6]/95 dark:bg-[#26282E]/95 backdrop-blur-md border-b border-[#DCD0BE] dark:border-[#3D414B] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text wordmark with Ichthys Wheel */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('office')}
            className="group flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1527] rounded-sm"
            title="Daily Offering Home"
          >
            <span className="w-7 h-7 rounded-full bg-[#8B1527]/10 dark:bg-[#E57380]/15 text-[#8B1527] dark:text-[#E57380] flex items-center justify-center border border-[#8B1527]/25 transition-transform group-hover:scale-105">
              <IchthysWheelIcon className="w-4 h-4" />
            </span>
            <span className="text-xl font-serif font-semibold tracking-tight text-[#2D251F] dark:text-[#E3E5EB] whitespace-nowrap">
              Daily Offering
            </span>
          </button>
        </div>

        {/* Zone 2: 3 single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => setActiveTab('office')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'office'
                ? 'text-[#8B1527] dark:text-[#E57380] font-semibold border-b-2 border-[#8B1527] dark:border-[#E57380] pb-0.5'
                : 'text-[#6B5E54] dark:text-[#9DA1AB] hover:text-[#2D251F] dark:hover:text-[#E3E5EB]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Offering</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'text-[#8B1527] dark:text-[#E57380] font-semibold border-b-2 border-[#8B1527] dark:border-[#E57380] pb-0.5'
                : 'text-[#6B5E54] dark:text-[#9DA1AB] hover:text-[#2D251F] dark:hover:text-[#E3E5EB]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel Schedule (365 Days)</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'text-[#8B1527] dark:text-[#E57380] font-semibold border-b-2 border-[#8B1527] dark:border-[#E57380] pb-0.5'
                : 'text-[#6B5E54] dark:text-[#9DA1AB] hover:text-[#2D251F] dark:hover:text-[#E3E5EB]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Theme Switcher) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsDark(!isDark)}
            title={isDark ? "Switch to warm sepia mode" : "Switch to soft dark gray mode"}
            aria-label="Toggle theme"
            className="p-2 text-[#2D251F] dark:text-[#E3E5EB] bg-[#E3D9C9] dark:bg-[#34373F] hover:bg-[#D9CEBC] dark:hover:bg-[#3D414B] border border-[#DCD0BE] dark:border-[#4B505C] rounded-lg transition-colors flex items-center justify-center shadow-xs cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#E57380]" /> : <Moon className="w-4 h-4 text-[#8B1527]" />}
          </button>
        </div>

      </div>

      {/* Mobile navigation tabs: Offering, Schedule, Notifications (visible on < md) */}
      <nav aria-label="Mobile Navigation" className="md:hidden border-t border-[#DCD0BE]/80 dark:border-[#3D414B]/80 bg-[#E8DFD0]/70 dark:bg-[#202227]/80 px-2 py-1.5 flex items-center justify-around gap-1.5">
        <button
          onClick={() => setActiveTab('office')}
          className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'office'
              ? 'bg-[#FAF6EE] dark:bg-[#2B2E35] text-[#8B1527] dark:text-[#E57380] font-semibold border border-[#8B1527]/30 dark:border-[#E57380]/40 shadow-xs'
              : 'text-[#6B5E54] dark:text-[#9DA1AB] hover:text-[#2D251F] dark:hover:text-[#E3E5EB]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span>Offering</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'schedule'
              ? 'bg-[#FAF6EE] dark:bg-[#2B2E35] text-[#8B1527] dark:text-[#E57380] font-semibold border border-[#8B1527]/30 dark:border-[#E57380]/40 shadow-xs'
              : 'text-[#6B5E54] dark:text-[#9DA1AB] hover:text-[#2D251F] dark:hover:text-[#E3E5EB]'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
          <span>Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'notifications'
              ? 'bg-[#FAF6EE] dark:bg-[#2B2E35] text-[#8B1527] dark:text-[#E57380] font-semibold border border-[#8B1527]/30 dark:border-[#E57380]/40 shadow-xs'
              : 'text-[#6B5E54] dark:text-[#9DA1AB] hover:text-[#2D251F] dark:hover:text-[#E3E5EB]'
          }`}
        >
          <Bell className="w-3.5 h-3.5 shrink-0" />
          <span>Notifications</span>
        </button>
      </nav>

      {/* Sub-bar next prayer status ticker */}
      <div className="bg-[#E7DFC0]/50 dark:bg-[#202227]/70 border-t border-[#DCD0BE]/60 dark:border-[#3D414B]/60 px-4 py-1.5 text-xs text-[#6B5E54] dark:text-[#9DA1AB]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-[#8B1527] dark:text-[#E57380]">Next Appointed Hour:</span>
            {nextPrayerName && !nextPrayerName.toLowerCase().includes('evening proverb') && (
              <>
                <span className="font-medium text-[#2D251F] dark:text-[#E3E5EB]">{nextPrayerName}</span>
                <span aria-hidden="true" className="text-[#C5B8A5] dark:text-[#4B505C]">·</span>
              </>
            )}
            <span className="font-mono tabular-nums text-[#6B5E54] dark:text-[#9DA1AB]">in {nextPrayerCountdown}</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span>Morning Offering</span>
            <span>·</span>
            <span>Midday Offering</span>
            <span>·</span>
            <span>Evening Offering</span>
          </div>
        </div>
      </div>
    </header>
  );
};
