/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TopNav } from './components/TopNav';
import { DailyTimeline } from './components/DailyTimeline';
import { OfficeView } from './components/OfficeView';
import { ScheduleSheetModal } from './components/ScheduleSheetModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { DayOneModal } from './components/DayOneModal';
import {
  DailyReadingPlan,
  DayOneAnchor,
  loadSavedSchedule,
  getReadingForDate,
  saveSchedule,
  loadDayOneAnchor,
  saveDayOneAnchor,
  calculatePlanDayIndex
} from './data/defaultSchedule';
import {
  NotificationSettings,
  loadNotificationSettings,
  saveNotificationSettings,
  checkAndTriggerScheduledNotifications,
  getNextPrayerSlot
} from './utils/notifications';
import { Bell, ArrowRight, X } from 'lucide-react';

const THEME_KEY = 'daily_offering_theme_preference';

export default function App() {
  // Navigation & View State (Devotional Journal removed per user request)
  const [activeTab, setActiveTab] = useState<'office' | 'schedule' | 'notifications'>('office');
  
  // Determine initial office based on current time
  const getInitialOffice = (): 'morning' | 'midday' | 'evening' => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    if (minutes < 12 * 60) return 'morning'; // Before 12:00
    if (minutes < 17 * 60) return 'midday';  // Between 12:00 and 17:00
    return 'evening';                        // After 17:00
  };

  const [activeOffice, setActiveOffice] = useState<'morning' | 'midday' | 'evening'>(getInitialOffice);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Schedule data & Day 1 Anchor state
  const [schedule, setSchedule] = useState<DailyReadingPlan[]>(loadSavedSchedule);
  const [dayOneAnchor, setDayOneAnchor] = useState<DayOneAnchor>(loadDayOneAnchor);
  const [isDayOneModalOpen, setIsDayOneModalOpen] = useState(false);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(loadNotificationSettings);

  // Dark mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Realtime Alert Modal for active prayer hours
  const [inAppAlert, setInAppAlert] = useState<{
    officeId: 'morning' | 'midday' | 'evening';
    title: string;
    body: string;
  } | null>(null);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDark]);

  // Current reading for selected date mapped via Day 1 anchor
  const currentReading = useMemo(() => {
    return getReadingForDate(currentDate, schedule, dayOneAnchor);
  }, [currentDate, schedule, dayOneAnchor]);

  // Next prayer slot and countdown calculation
  const [countdownString, setCountdownString] = useState('00m 00s');
  const [nextPrayerName, setNextPrayerName] = useState('Morning Psalm');

  const updateCountdown = useCallback(() => {
    const nextSlot = getNextPrayerSlot(notificationSettings);
    setNextPrayerName(nextSlot.name);

    const diff = Math.max(0, nextSlot.diffMs);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      setCountdownString(`${hours}h ${mins}m`);
    } else {
      setCountdownString(`${mins}m ${secs}s`);
    }
  }, [notificationSettings]);

  // Interval loop for background notifications & countdown
  useEffect(() => {
    updateCountdown();
    const interval = setInterval(() => {
      updateCountdown();
      const todayReading = getReadingForDate(new Date(), schedule, dayOneAnchor);
      checkAndTriggerScheduledNotifications(todayReading, notificationSettings);
    }, 15000);

    return () => clearInterval(interval);
  }, [updateCountdown, schedule, dayOneAnchor, notificationSettings]);

  // Listen to in-app custom event
  useEffect(() => {
    const handlePrayerAlert = (e: Event) => {
      const customEvent = e as CustomEvent<{
        officeId: 'morning' | 'midday' | 'evening';
        title: string;
        body: string;
      }>;
      if (customEvent.detail) {
        setInAppAlert(customEvent.detail);
      }
    };

    const handleOpenOffice = (e: Event) => {
      const customEvent = e as CustomEvent<{ officeId: 'morning' | 'midday' | 'evening' }>;
      if (customEvent.detail?.officeId) {
        setActiveOffice(customEvent.detail.officeId);
        setActiveTab('office');
      }
    };

    window.addEventListener('prayer-time-alert', handlePrayerAlert);
    window.addEventListener('open-office', handleOpenOffice);
    return () => {
      window.removeEventListener('prayer-time-alert', handlePrayerAlert);
      window.removeEventListener('open-office', handleOpenOffice);
    };
  }, []);

  const handleSaveDayOneAnchor = (anchor: DayOneAnchor) => {
    setDayOneAnchor(anchor);
    saveDayOneAnchor(anchor);
  };

  const planDayIndex = calculatePlanDayIndex(currentDate, dayOneAnchor);

  return (
    <div className="min-h-screen bg-[#F3ECE1] dark:bg-[#1E2024] text-[#2D251F] dark:text-[#E3E5EB] flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        nextPrayerName={nextPrayerName}
        nextPrayerCountdown={countdownString}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* In-App Prayer Notification Banner */}
        {inAppAlert && (
          <div className="mb-6 p-4 rounded-xl bg-[#8B1527] text-[#FAF6EE] dark:bg-[#2B2E35] dark:text-[#E3E5EB] shadow-md flex items-center justify-between gap-4 animate-fade-in border border-[#6F0F1E] dark:border-[#3D414B]">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-[#6F0F1E] dark:bg-[#34373F] text-white shrink-0">
                <Bell className="w-5 h-5 text-[#E57380]" />
              </span>
              <div>
                <h4 className="font-serif font-bold text-sm sm:text-base">
                  {inAppAlert.title}
                </h4>
                <p className="text-xs text-[#F2D6DC] dark:text-[#9DA1AB]">
                  {inAppAlert.body}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setActiveOffice(inAppAlert.officeId);
                  setActiveTab('office');
                  setInAppAlert(null);
                }}
                className="px-3 py-1.5 bg-[#FAF6EE] text-[#2D251F] hover:bg-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Enter Office</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setInAppAlert(null)}
                className="p-1.5 text-[#EBDCC8] hover:text-white"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Today's Appointed Readings & Liturgy */}
        {activeTab === 'office' && (
          <>
            <DailyTimeline
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              activeOffice={activeOffice}
              setActiveOffice={setActiveOffice}
              readingPlan={currentReading}
              dayOneAnchor={dayOneAnchor}
              onOpenDayOneModal={() => setIsDayOneModalOpen(true)}
            />

            <OfficeView
              office={activeOffice}
              readingPlan={currentReading}
              currentDate={currentDate}
              onOpenSchedule={() => setActiveTab('schedule')}
            />
          </>
        )}

        {/* Tab 2: Excel Schedule & Customization */}
        {activeTab === 'schedule' && (
          <ScheduleSheetModal
            schedule={schedule}
            onUpdateSchedule={(newSched) => {
              setSchedule(newSched);
              saveSchedule(newSched);
            }}
            currentDay={planDayIndex}
            dayOneAnchor={dayOneAnchor}
            onOpenDayOneModal={() => setIsDayOneModalOpen(true)}
          />
        )}

        {/* Tab 3: Notifications Configuration */}
        {activeTab === 'notifications' && (
          <NotificationSettingsModal
            settings={notificationSettings}
            onUpdateSettings={(newSettings) => {
              setNotificationSettings(newSettings);
              saveNotificationSettings(newSettings);
            }}
            currentReading={currentReading}
            nextPrayerCountdown={countdownString}
            nextPrayerName={nextPrayerName}
          />
        )}

      </main>

      {/* Day 1 Anchor Date Selection Modal */}
      <DayOneModal
        isOpen={isDayOneModalOpen}
        onClose={() => setIsDayOneModalOpen(false)}
        currentAnchor={dayOneAnchor}
        onSaveAnchor={handleSaveDayOneAnchor}
        schedule={schedule}
        currentDate={currentDate}
      />

      {/* Liturgical Editorial Footer */}
      <footer className="mt-auto border-t border-[#DCD0BE] dark:border-[#3D414B] bg-[#ECE4D6] dark:bg-[#26282E] py-6 text-xs text-[#6B5E54] dark:text-[#9DA1AB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="font-serif font-semibold text-[#2D251F] dark:text-[#E3E5EB]">Daily Offering</span>
            <span>·</span>
            <span>Appointed Psalm in All Offerings</span>
            <span>·</span>
            <span>Proverbs in Midday & Evening</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('schedule')}
              className="hover:text-[#2D251F] dark:hover:text-[#E3E5EB] underline"
            >
              Appointed Excel Plan (365 Days)
            </button>
            <button
              onClick={() => setIsDayOneModalOpen(true)}
              className="hover:text-[#2D251F] dark:hover:text-[#E3E5EB] underline"
            >
              Day 1 Anchor ({dayOneAnchor.label})
            </button>
            <span className="font-serif">Scripture: Christian Standard Bible (CSB)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
