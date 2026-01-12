// Browser notification utility for envelope events

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

class EnvelopeNotificationManager {
  private permission: NotificationPermission = 'default';

  constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    const result = await Notification.requestPermission();
    this.permission = result;
    return result === 'granted';
  }

  private async sendNotification(options: NotificationOptions) {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/envelope-icon.png',
      badge: options.badge || '/envelope-badge.png',
      tag: options.tag,
      requireInteraction: false,
      silent: false
    });

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    // Handle click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  // Notification for successful envelope creation
  notifyEnvelopeCreated(amount: string, recipient: string) {
    this.sendNotification({
      title: '✅ Envelope Created!',
      body: `Successfully created envelope with ${amount} XLM for ${recipient.slice(0, 8)}...`,
      tag: 'envelope-created'
    });
  }

  // Notification for successful claim
  notifyEnvelopeClaimed(amount: string) {
    this.sendNotification({
      title: '🎁 Envelope Claimed!',
      body: `You received ${amount} XLM from an envelope!`,
      tag: 'envelope-claimed'
    });
  }

  // Notification for successful reclaim
  notifyEnvelopeReclaimed(amount: string) {
    this.sendNotification({
      title: '↩️ Envelope Reclaimed!',
      body: `Successfully reclaimed ${amount} XLM from your envelope`,
      tag: 'envelope-reclaimed'
    });
  }

  // Notification for wallet connection
  notifyWalletConnected(address: string) {
    this.sendNotification({
      title: '🔗 Wallet Connected',
      body: `Connected to ${address.slice(0, 8)}...${address.slice(-8)}`,
      tag: 'wallet-connected'
    });
  }

  // Notification for transaction error
  notifyError(message: string) {
    this.sendNotification({
      title: '❌ Transaction Failed',
      body: message,
      tag: 'transaction-error'
    });
  }

  // Notification for pending envelope reminder
  notifyPendingEnvelope(count: number) {
    this.sendNotification({
      title: '⏳ Pending Envelopes',
      body: `You have ${count} envelope${count > 1 ? 's' : ''} waiting to be claimed`,
      tag: 'pending-reminder'
    });
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Get current permission status
  getPermission(): NotificationPermission {
    return this.permission;
  }
}

// Export singleton instance
export const notificationManager = new EnvelopeNotificationManager();

// Auto-request permission on first use (optional)
export async function initializeNotifications() {
  if (notificationManager.isSupported()) {
    const granted = await notificationManager.requestPermission();
    if (granted) {
      console.log('✅ Notifications enabled');
    } else {
      console.log('⚠️ Notifications denied');
    }
  }
}
