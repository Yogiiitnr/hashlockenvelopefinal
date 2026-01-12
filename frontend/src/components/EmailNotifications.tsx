import { useState } from 'react';
import toast from 'react-hot-toast';

interface NotificationSettings {
  email: string;
  notifyOnCreate: boolean;
  notifyOnClaim: boolean;
  notifyOnExpiry: boolean;
  notifyBeforeUnlock: boolean;
  hoursBeforeUnlock: number;
}

export function EmailNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notification_settings');
    return saved ? JSON.parse(saved) : {
      email: '',
      notifyOnCreate: true,
      notifyOnClaim: true,
      notifyOnExpiry: true,
      notifyBeforeUnlock: true,
      hoursBeforeUnlock: 24,
    };
  });

  const [isEnabled, setIsEnabled] = useState(() => {
    return localStorage.getItem('notifications_enabled') === 'true';
  });

  const handleSave = () => {
    if (isEnabled && !settings.email) {
      toast.error('Please enter an email address');
      return;
    }

    if (isEnabled && !settings.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    localStorage.setItem('notification_settings', JSON.stringify(settings));
    localStorage.setItem('notifications_enabled', String(isEnabled));
    
    toast.success('Notification settings saved!');
  };

  const handleTest = () => {
    if (!settings.email) {
      toast.error('Please enter an email address first');
      return;
    }

    // Simulate sending test email
    toast.loading('Sending test notification...', { duration: 1500 });
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Test notification sent to ${settings.email}!`, {
        icon: '📧',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="aurora-text text-3xl font-bold mb-2">📧 Email Notifications</h2>
        <p className="text-gray-400">Get alerts about your envelopes</p>
      </div>

      {/* Master Toggle */}
      <div className="holographic border-glow p-6 rounded-xl text-center">
        <div className="flex items-center justify-center gap-4">
          <span className="text-gray-400 font-medium">Notifications</span>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`
              relative w-16 h-8 rounded-full transition-all duration-300
              ${isEnabled ? 'bg-green-500' : 'bg-gray-600'}
            `}
          >
            <div
              className={`
                absolute top-1 w-6 h-6 rounded-full bg-white transition-transform duration-300
                ${isEnabled ? 'translate-x-9' : 'translate-x-1'}
              `}
            />
          </button>
          <span className={`font-bold ${isEnabled ? 'text-green-400' : 'text-gray-500'}`}>
            {isEnabled ? 'ENABLED' : 'DISABLED'}
          </span>
        </div>
        {!isEnabled && (
          <div className="mt-3 text-sm text-yellow-400">
            ⚠️ Notifications are currently disabled
          </div>
        )}
      </div>

      {/* Email Input */}
      <div className={`holographic p-6 rounded-xl ${!isEnabled && 'opacity-50 pointer-events-none'}`}>
        <h3 className="neon-text text-xl font-bold mb-4">📬 Email Address</h3>
        <input
          type="email"
          value={settings.email}
          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
          placeholder="your.email@example.com"
          className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
          disabled={!isEnabled}
        />
        <div className="mt-2 text-sm text-gray-400">
          We'll send notifications to this email address
        </div>
      </div>

      {/* Notification Types */}
      <div className={`holographic p-6 rounded-xl space-y-4 ${!isEnabled && 'opacity-50 pointer-events-none'}`}>
        <h3 className="neon-text text-xl font-bold mb-4">🔔 Notification Types</h3>

        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={settings.notifyOnCreate}
            onChange={(e) => setSettings({ ...settings, notifyOnCreate: e.target.checked })}
            className="w-5 h-5 rounded border-purple-500/30 text-purple-500 focus:ring-purple-500"
            disabled={!isEnabled}
          />
          <div className="flex-1">
            <div className="font-medium">✨ Envelope Created</div>
            <div className="text-sm text-gray-400">When you successfully create a new envelope</div>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={settings.notifyOnClaim}
            onChange={(e) => setSettings({ ...settings, notifyOnClaim: e.target.checked })}
            className="w-5 h-5 rounded border-purple-500/30 text-purple-500 focus:ring-purple-500"
            disabled={!isEnabled}
          />
          <div className="flex-1">
            <div className="font-medium">🎁 Envelope Claimed</div>
            <div className="text-sm text-gray-400">When someone claims your envelope</div>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={settings.notifyOnExpiry}
            onChange={(e) => setSettings({ ...settings, notifyOnExpiry: e.target.checked })}
            className="w-5 h-5 rounded border-purple-500/30 text-purple-500 focus:ring-purple-500"
            disabled={!isEnabled}
          />
          <div className="flex-1">
            <div className="font-medium">⏰ Envelope Expired</div>
            <div className="text-sm text-gray-400">When an envelope reaches its expiry time</div>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={settings.notifyBeforeUnlock}
            onChange={(e) => setSettings({ ...settings, notifyBeforeUnlock: e.target.checked })}
            className="w-5 h-5 rounded border-purple-500/30 text-purple-500 focus:ring-purple-500"
            disabled={!isEnabled}
          />
          <div className="flex-1">
            <div className="font-medium">🔓 Unlock Reminder</div>
            <div className="text-sm text-gray-400">Remind before envelope unlocks</div>
          </div>
        </label>

        {settings.notifyBeforeUnlock && (
          <div className="ml-11 mt-2">
            <label className="text-sm text-gray-400 block mb-2">Remind me (hours before unlock):</label>
            <input
              type="number"
              value={settings.hoursBeforeUnlock}
              onChange={(e) => setSettings({ ...settings, hoursBeforeUnlock: parseInt(e.target.value) || 24 })}
              min="1"
              max="168"
              className="w-32 bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              disabled={!isEnabled}
            />
          </div>
        )}
      </div>

      {/* Example Preview */}
      <div className="holographic p-6 rounded-xl">
        <h3 className="neon-text text-xl font-bold mb-4">📨 Example Email</h3>
        <div className="bg-gray-900/50 p-4 rounded-lg border border-purple-500/20 font-mono text-sm">
          <div className="text-gray-400 mb-2">From: notifications@hashlocked.stellar</div>
          <div className="text-gray-400 mb-2">To: {settings.email || 'your.email@example.com'}</div>
          <div className="text-gray-400 mb-4">Subject: <span className="text-white">🎁 Your Hash-Locked Envelope Was Claimed!</span></div>
          <div className="border-t border-gray-700 pt-4 text-gray-300">
            <p>Hello,</p>
            <p className="mt-2">Great news! Your envelope has been successfully claimed.</p>
            <p className="mt-2"><strong>Details:</strong></p>
            <ul className="ml-4 mt-1 space-y-1">
              <li>Amount: <span className="text-green-400">100 XLM</span></li>
              <li>Claimed by: GXXXXXXX...XXXXXXX</li>
              <li>Transaction: <span className="text-blue-400 underline">View on Stellar Expert</span></li>
            </ul>
            <p className="mt-4 text-gray-400 text-xs">
              You're receiving this because you enabled notifications in Hash-Locked Envelopes.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={handleTest}
          className="magnetic-button px-6 py-4 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500/30 font-bold transition-all"
          disabled={!isEnabled}
        >
          📧 Send Test Email
        </button>

        <button
          onClick={handleSave}
          className="liquid-button border-glow px-6 py-4 rounded-xl bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/30 font-bold transition-all"
        >
          💾 Save Settings
        </button>
      </div>

      {/* Info */}
      <div className="holographic p-4 rounded-xl text-sm text-gray-400 text-center">
        <div className="mb-1">💡 <strong>Note:</strong> This is a demo feature</div>
        <div>In production, email notifications would be sent via a backend service</div>
      </div>
    </div>
  );
}
