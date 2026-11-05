import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Play,
  RotateCcw,
  Clock
} from 'lucide-react';
import {
  NotificationSettings,
  requestNotificationPermission,
  triggerPrayerNotification,
  saveNotificationSettings
} from '../utils/notifications';
import { DailyReadingPlan } from '../data/defaultSchedule';

interface NotificationSettingsModalProps {
  settings: NotificationSettings;
  onUpdateSettings: (settings: NotificationSettings) => void;
  currentReading: DailyReadingPlan;
  nextPrayerCountdown: string;
  nextPrayerName: string;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  settings,
  onUpdateSettings,
  currentReading,
  nextPrayerCountdown,
  nextPrayerName,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
  };

  const handleToggleSlot = (slot: 'morning' | 'midday' | 'evening') => {
    const updated = {
      ...settings,
      slots: {
        ...settings.slots,
        [slot]: {
          ...settings.slots[slot],
          enabled: !settings.slots[slot].enabled
        }
      }
    };
    onUpdateSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleTimeChange = (slot: 'morning' | 'midday' | 'evening', time: string) => {
    const updated = {
      ...settings,
      slots: {
        ...settings.slots,
        [slot]: {
          ...settings.slots[slot],
          time
        }
      }
    };
    onUpdateSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleResetToStrictTimes = () => {
    const updated: NotificationSettings = {
      enabled: true,
      slots: {
        morning: { time: '08:00', enabled: true },
        midday: { time: '12:00', enabled: true },
        evening: { time: '17:00', enabled: true }
      }
    };
    onUpdateSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleTestNotification = (office: 'morning' | 'midday' | 'evening') => {
    triggerPrayerNotification(office, currentReading);
    setTestSent(office);
    setTimeout(() => setTestSent(null), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Card */}
      <div className="bg-[#FAF6EE] dark:bg-[#26282E] rounded-xl border border-[#DCD0BE] dark:border-[#3D414B] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8B1527] dark:text-[#E57380] font-serif">
              <Bell className="w-3.5 h-3.5" />
              <span>Prayer Reminders</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#2D251F] dark:text-[#E3E5EB] mt-0.5">
              Scheduled Daily Notifications
            </h2>
            <p className="text-xs text-[#6B5E54] dark:text-[#9DA1AB] mt-1 max-w-xl">
              Daily Offering alerts you automatically at the appointed hours: <strong className="font-semibold text-[#2D251F] dark:text-[#E3E5EB]">8:00 AM</strong> for the morning Psalm (read by itself), <strong className="font-semibold text-[#2D251F] dark:text-[#E3E5EB]">12:00 PM</strong> for midday Proverbs, and <strong className="font-semibold text-[#2D251F] dark:text-[#E3E5EB]">17:00 PM</strong> for evening Proverbs.
            </p>
          </div>

          <button
            onClick={handleResetToStrictTimes}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-[#DCD0BE] dark:border-[#3D414B] bg-[#F3ECE1] dark:bg-[#2B2E35] hover:bg-[#EAE0D0] dark:hover:bg-[#34373F] text-[#2D251F] dark:text-[#E3E5EB] flex items-center gap-1.5 self-start sm:self-center transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to 8:00 / 12:00 / 17:00</span>
          </button>
        </div>

        {/* Permission status box */}
        <div className="mt-6 p-4 rounded-xl border border-[#DCD0BE] dark:border-[#3D414B] bg-[#F3ECE1] dark:bg-[#202227] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {permission === 'granted' ? (
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#F2D8DC] dark:bg-[#3D414B] text-[#8B1527] dark:text-[#E57380] flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="text-sm font-semibold text-[#2D251F] dark:text-[#E3E5EB]">
                {permission === 'granted'
                  ? 'Browser Notifications are Active'
                  : permission === 'denied'
                  ? 'Notifications are blocked in browser settings'
                  : 'Enable Browser Prayer Notifications'}
              </div>
              <div className="text-xs text-[#6B5E54] dark:text-[#9DA1AB]">
                {permission === 'granted'
                  ? 'You will receive notifications at 8:00, 12:00, and 17:00 when prayer hour arrives.'
                  : 'Click below so your device can alert you at the appointed times.'}
              </div>
            </div>
          </div>

          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 bg-[#8B1527] text-white rounded-lg text-xs font-medium hover:bg-[#6F0F1E] transition-colors whitespace-nowrap"
            >
              Allow Notifications
            </button>
          )}
        </div>
      </div>

      {/* 3 Prayer Slots Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Morning 8:00 */}
        <div className="bg-[#FAF6EE] dark:bg-[#26282E] rounded-xl border border-[#DCD0BE] dark:border-[#3D414B] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-serif uppercase tracking-widest text-[#8B1527] dark:text-[#E57380]">
                Morning Offering
              </span>
              <input
                type="checkbox"
                checked={settings.slots.morning.enabled}
                onChange={() => handleToggleSlot('morning')}
                className="rounded text-[#8B1527] focus:ring-[#8B1527]"
              />
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#6B5E54] dark:text-[#9DA1AB]" />
              <input
                type="time"
                value={settings.slots.morning.time}
                onChange={(e) => handleTimeChange('morning', e.target.value)}
                className="font-mono text-xl font-bold text-[#2D251F] dark:text-[#E3E5EB] bg-transparent border-b border-[#DCD0BE] dark:border-[#3D414B] focus:border-[#8B1527] focus:outline-none"
              />
            </div>

            <p className="text-xs text-[#6B5E54] dark:text-[#9DA1AB]">
              <strong className="text-[#2D251F] dark:text-[#E3E5EB]">Psalm read alone</strong> ({currentReading.morningPsalm})
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DCD0BE]/60 dark:border-[#3D414B]/60">
            <button
              onClick={() => handleTestNotification('morning')}
              className="w-full py-1.5 px-3 rounded-lg border border-[#DCD0BE] dark:border-[#3D414B] hover:bg-[#F3ECE1] dark:hover:bg-[#34373F] text-xs font-medium text-[#2D251F] dark:text-[#E3E5EB] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3 h-3 text-[#8B1527] dark:text-[#E57380]" />
              <span>Test 8:00 Notification</span>
            </button>
          </div>
        </div>

        {/* Midday 12:00 */}
        <div className="bg-[#FAF6EE] dark:bg-[#26282E] rounded-xl border border-[#DCD0BE] dark:border-[#3D414B] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-serif uppercase tracking-widest text-[#8B1527] dark:text-[#E57380]">
                Midday Offering
              </span>
              <input
                type="checkbox"
                checked={settings.slots.midday.enabled}
                onChange={() => handleToggleSlot('midday')}
                className="rounded text-[#8B1527] focus:ring-[#8B1527]"
              />
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#6B5E54] dark:text-[#9DA1AB]" />
              <input
                type="time"
                value={settings.slots.midday.time}
                onChange={(e) => handleTimeChange('midday', e.target.value)}
                className="font-mono text-xl font-bold text-[#2D251F] dark:text-[#E3E5EB] bg-transparent border-b border-[#DCD0BE] dark:border-[#3D414B] focus:border-[#8B1527] focus:outline-none"
              />
            </div>

            <p className="text-xs text-[#6B5E54] dark:text-[#9DA1AB]">
              <strong className="text-[#2D251F] dark:text-[#E3E5EB]">Proverbs midday</strong> ({currentReading.middayProverb || 'Stillness'})
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DCD0BE]/60 dark:border-[#3D414B]/60">
            <button
              onClick={() => handleTestNotification('midday')}
              className="w-full py-1.5 px-3 rounded-lg border border-[#DCD0BE] dark:border-[#3D414B] hover:bg-[#F3ECE1] dark:hover:bg-[#34373F] text-xs font-medium text-[#2D251F] dark:text-[#E3E5EB] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3 h-3 text-[#8B1527] dark:text-[#E57380]" />
              <span>Test 12:00 Notification</span>
            </button>
          </div>
        </div>

        {/* Evening 17:00 */}
        <div className="bg-[#FAF6EE] dark:bg-[#26282E] rounded-xl border border-[#DCD0BE] dark:border-[#3D414B] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-serif uppercase tracking-widest text-[#8B1527] dark:text-[#E57380]">
                Evening Offering
              </span>
              <input
                type="checkbox"
                checked={settings.slots.evening.enabled}
                onChange={() => handleToggleSlot('evening')}
                className="rounded text-[#8B1527] focus:ring-[#8B1527]"
              />
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#6B5E54] dark:text-[#9DA1AB]" />
              <input
                type="time"
                value={settings.slots.evening.time}
                onChange={(e) => handleTimeChange('evening', e.target.value)}
                className="font-mono text-xl font-bold text-[#2D251F] dark:text-[#E3E5EB] bg-transparent border-b border-[#DCD0BE] dark:border-[#3D414B] focus:border-[#8B1527] focus:outline-none"
              />
            </div>

            <p className="text-xs text-[#6B5E54] dark:text-[#9DA1AB]">
              <strong className="text-[#2D251F] dark:text-[#E3E5EB]">Proverbs evening</strong> ({currentReading.eveningProverb || 'Repose'})
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DCD0BE]/60 dark:border-[#3D414B]/60">
            <button
              onClick={() => handleTestNotification('evening')}
              className="w-full py-1.5 px-3 rounded-lg border border-[#DCD0BE] dark:border-[#3D414B] hover:bg-[#F3ECE1] dark:hover:bg-[#34373F] text-xs font-medium text-[#2D251F] dark:text-[#E3E5EB] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3 h-3 text-[#8B1527] dark:text-[#E57380]" />
              <span>Test 17:00 Notification</span>
            </button>
          </div>
        </div>

      </div>

      {testSent && (
        <div className="p-3 bg-[#F2D8DC] dark:bg-[#3D414B] border border-[#DCD0BE] dark:border-[#4B505C] text-center text-xs text-[#8B1527] dark:text-[#E57380] rounded-lg">
          Test notification sent for {testSent.toUpperCase()} office!
        </div>
      )}

    </div>
  );
};
