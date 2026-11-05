import { DailyReadingPlan } from '../data/defaultSchedule';

export interface PrayerTimeSlot {
  id: 'morning' | 'midday' | 'evening';
  name: string;
  defaultTime: string; // '08:00', '12:00', '17:00'
  customTime?: string;
  readingType: string;
  enabled: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  slots: {
    morning: { time: string; enabled: boolean };
    midday: { time: string; enabled: boolean };
    evening: { time: string; enabled: boolean };
  };
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  slots: {
    morning: { time: '08:00', enabled: true },
    midday: { time: '12:00', enabled: true },
    evening: { time: '17:00', enabled: true }
  }
};

const STORAGE_KEY = 'daily_offering_notification_settings_v3';
const LAST_NOTIFIED_KEY = 'daily_offering_last_notified_record_v3';

export function loadNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save notification settings:', err);
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  return await Notification.requestPermission();
}

/**
 * Sends a silent visual notification for a prayer office with prayer scripture
 */
export function triggerPrayerNotification(
  officeId: 'morning' | 'midday' | 'evening',
  reading: DailyReadingPlan
): void {
  let title = '';
  let body = '';

  if (officeId === 'morning') {
    title = 'Daily Offering — Morning Prayer (8:00)';
    body = `Psalm for today: ${reading.morningPsalm}. "O Lord, open our lips, and our mouth shall proclaim your praise."`;
  } else if (officeId === 'midday') {
    title = 'Daily Offering — Midday Prayer (12:00)';
    body = `Proverbs for midday: ${reading.middayProverb}. Pause from labor for wisdom and discernment.`;
  } else {
    title = 'Daily Offering — Evening Prayer (17:00)';
    body = `Proverbs for evening: ${reading.eveningProverb}. Give thanks for the day and seek peace.`;
  }

  // Web Notification if permission granted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `daily-offering-${officeId}-${new Date().toDateString()}`,
        requireInteraction: true
      });
      notif.onclick = () => {
        window.focus();
        window.dispatchEvent(new CustomEvent('open-office', { detail: { officeId } }));
      };
    } catch (e) {
      console.warn('Browser notification creation error:', e);
    }
  }

  // In-app custom event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('prayer-time-alert', {
        detail: {
          officeId,
          title,
          body,
          timestamp: new Date().toISOString()
        }
      })
    );
  }
}

/**
 * Checks current time against scheduled slots and triggers notification if due
 */
export function checkAndTriggerScheduledNotifications(
  reading: DailyReadingPlan,
  settings: NotificationSettings
): void {
  if (!settings.enabled) return;

  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

  // Get last notified map to prevent duplicate alerts within same minute
  let lastNotified: Record<string, string> = {};
  try {
    const raw = localStorage.getItem(LAST_NOTIFIED_KEY);
    if (raw) lastNotified = JSON.parse(raw);
  } catch {
    lastNotified = {};
  }

  const checkSlot = (slotId: 'morning' | 'midday' | 'evening', timeSetting: string, enabled: boolean) => {
    if (!enabled) return;
    if (currentTimeStr === timeSetting) {
      const recordKey = `${todayKey}_${slotId}_${timeSetting}`;
      if (!lastNotified[recordKey]) {
        // Fire notification
        triggerPrayerNotification(slotId, reading);
        lastNotified[recordKey] = new Date().toISOString();
        localStorage.setItem(LAST_NOTIFIED_KEY, JSON.stringify(lastNotified));
      }
    }
  };

  checkSlot('morning', settings.slots.morning.time, settings.slots.morning.enabled);
  checkSlot('midday', settings.slots.midday.time, settings.slots.midday.enabled);
  checkSlot('evening', settings.slots.evening.time, settings.slots.evening.enabled);
}

/**
 * Calculate the next upcoming prayer time slot and remaining milliseconds
 */
export function getNextPrayerSlot(settings: NotificationSettings): {
  id: 'morning' | 'midday' | 'evening';
  name: string;
  targetTime: Date;
  timeString: string;
  diffMs: number;
} {
  const now = new Date();
  const slots: Array<{ id: 'morning' | 'midday' | 'evening'; name: string; timeStr: string; enabled: boolean }> = [
    { id: 'morning', name: 'Morning Psalm', timeStr: settings.slots.morning.time, enabled: settings.slots.morning.enabled },
    { id: 'midday', name: 'Midday Proverb', timeStr: settings.slots.midday.time, enabled: settings.slots.midday.enabled },
    { id: 'evening', name: 'Evening Proverb', timeStr: settings.slots.evening.time, enabled: settings.slots.evening.enabled },
  ];

  const enabledSlots = slots.filter((s) => s.enabled);
  if (enabledSlots.length === 0) {
    // Default to morning tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return {
      id: 'morning',
      name: 'Morning Psalm',
      targetTime: tomorrow,
      timeString: '08:00',
      diffMs: tomorrow.getTime() - now.getTime()
    };
  }

  const candidateDates: Array<{
    id: 'morning' | 'midday' | 'evening';
    name: string;
    targetTime: Date;
    timeString: string;
    diffMs: number;
  }> = [];

  for (const slot of enabledSlots) {
    const [h, m] = slot.timeStr.split(':').map(Number);
    const target = new Date(now);
    target.setHours(h, m, 0, 0);

    if (target.getTime() <= now.getTime()) {
      // Past for today, schedule for tomorrow
      target.setDate(target.getDate() + 1);
    }

    candidateDates.push({
      id: slot.id,
      name: slot.name,
      targetTime: target,
      timeString: slot.timeStr,
      diffMs: target.getTime() - now.getTime()
    });
  }

  candidateDates.sort((a, b) => a.diffMs - b.diffMs);
  return candidateDates[0];
}
