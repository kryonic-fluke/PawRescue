import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface NotificationOptions {
  email?: string;
  phoneNumber?: string;
  subject?: string;
  message: string;
  notificationType?: string;
}

interface SoundPreference {
  notificationSound: string;
  customSoundUrl: string;
}

interface NotificationResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export function useNotifications() {
  const [sending, setSending] = useState(false);

  const sendEmailNotification = useCallback(async (options: NotificationOptions) => {
    if (!options.email) {
      toast.error('Email address is required');
      return { success: false, error: 'Email required' };
    }

    setSending(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/email-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientEmail: options.email,
          subject: options.subject || 'PawRescue Notification',
          message: options.message,
          notificationType: options.notificationType || 'general'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email notification');
      }

      const result = await response.json();
      toast.success('Email notification sent successfully!');
      // Show browser notification and play sound (based on user preference)
      try {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(options.subject || 'PawRescue', { body: options.message.slice(0, 200) });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(perm => {
              if (perm === 'granted') new Notification(options.subject || 'PawRescue', { body: options.message.slice(0, 200) });
            });
          }
        }
        // Play according to settings
        const soundPrefRaw = localStorage.getItem('settings_notifications');
        let soundPref: SoundPreference = { notificationSound: 'beep', customSoundUrl: '' };
        try { if (soundPrefRaw) soundPref = JSON.parse(soundPrefRaw); } catch { }
        const playSound = async () => {
          try {
            const sound = soundPref.notificationSound || 'beep';
            const url = soundPref.customSoundUrl || '';
            if (sound === 'custom' && url) {
              const a = new Audio(url);
              a.play().catch(() => { });
              return;
            }

            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const g = ctx.createGain();
            g.gain.value = 0.05;
            g.connect(ctx.destination);

            if (sound === 'chime') {
              const freqs = [880, 1100, 1320];
              let t = ctx.currentTime;
              for (const f of freqs) {
                const o = ctx.createOscillator();
                o.type = 'triangle'; o.frequency.value = f;
                o.connect(g);
                o.start(t);
                o.stop(t + 0.12);
                t += 0.12;
              }
            } else {
              const o = ctx.createOscillator();
              o.type = 'sine'; o.frequency.value = 880;
              o.connect(g); o.start(); o.stop(ctx.currentTime + 0.15);
            }
          } catch (e) { /* ignore */ }
        };
        playSound();
      } catch (e) { /* ignore notification errors */ }
      return { success: true, data: result };
    } catch (error: unknown) {
      console.error('Email notification error:', error);
      toast.error('Failed to send email notification');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    } finally {
      setSending(false);
    }
  }, []);

  const sendSMSNotification = useCallback(async (options: NotificationOptions) => {
    if (!options.phoneNumber) {
      toast.error('Phone number is required');
      return { success: false, error: 'Phone number required' };
    }

    setSending(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phoneNumber: options.phoneNumber,
          message: options.message,
          notificationType: options.notificationType || 'general'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS notification');
      }

      const result = await response.json();

      if (result.demo) {
        toast.info('SMS notification queued (Demo Mode)');
      } else {
        toast.success('SMS sent successfully!');
      }
      // browser notification and sound for sms as well
      try {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('SMS Notification', { body: options.message.slice(0, 200) });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(perm => {
              if (perm === 'granted') new Notification('SMS Notification', { body: options.message.slice(0, 200) });
            });
          }
        }

        const soundPrefRaw = localStorage.getItem('settings_notifications');
        let soundPref: SoundPreference = { notificationSound: 'beep', customSoundUrl: '' };
        try { if (soundPrefRaw) soundPref = JSON.parse(soundPrefRaw); } catch { }
        const playSound = async () => {
          try {
            const sound = soundPref.notificationSound || 'beep';
            const url = soundPref.customSoundUrl || '';
            if (sound === 'custom' && url) {
              const a = new Audio(url);
              a.play().catch(() => { });
              return;
            }

            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const g = ctx.createGain();
            g.gain.value = 0.04;
            g.connect(ctx.destination);

            if (sound === 'chime') {
              const freqs = [660, 880];
              let t = ctx.currentTime;
              for (const f of freqs) {
                const o = ctx.createOscillator();
                o.type = 'sine'; o.frequency.value = f;
                o.connect(g);
                o.start(t);
                o.stop(t + 0.12);
                t += 0.12;
              }
            } else {
              const o = ctx.createOscillator();
              o.type = 'square'; o.frequency.value = 660;
              o.connect(g); o.start(); o.stop(ctx.currentTime + 0.12);
            }
          } catch (e) { /* ignore */ }
        };
        playSound();
      } catch (e) { /* ignore notification errors */ }

      return { success: true, data: result };
    } catch (error: unknown) {
      console.error('SMS notification error:', error);
      toast.error('Failed to send SMS notification');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    } finally {
      setSending(false);
    }
  }, []);

  const sendNotification = useCallback(async (options: NotificationOptions) => {
    const results = {
      email: null as NotificationResult | null,
      sms: null as NotificationResult | null
    };

    // Send email if email provided
    if (options.email) {
      results.email = await sendEmailNotification(options);
    }

    // Send SMS if phone number provided
    if (options.phoneNumber) {
      results.sms = await sendSMSNotification(options);
    }

    const allSuccessful =
      (!options.email || results.email?.success) &&
      (!options.phoneNumber || results.sms?.success);

    return {
      success: allSuccessful,
      results
    };
  }, [sendEmailNotification, sendSMSNotification]);

  return {
    sendEmailNotification,
    sendSMSNotification,
    sendNotification,
    sending
  };
}
