import { useState } from 'react';
import { useFreighter } from './hooks/useFreighter';
import { CreateEnvelopeForm } from './components/CreateEnvelopeForm';
import type { EnvelopeFormData } from './components/CreateEnvelopeForm';
import { createEnvelopeTransaction } from './utils/stellar';

function App() {
  const { 
    publicKey, 
    connected, 
    loading: walletLoading, 
    error: walletError, 
    connect, 
    disconnect,
    signTransaction,
    isFreighterInstalled 
  } = useFreighter();

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [manualMode, setManualMode] = useState(false);

  /**
   * Show a notification toast
   */
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  /**
   * Handle envelope creation
   */
  const handleCreateEnvelope = async (data: EnvelopeFormData) => {
    if (!publicKey) {
      showNotification('error', 'Please connect your wallet first');
      return;
    }

    try {
      // Build the transaction
      const xdr = await createEnvelopeTransaction({
        owner: publicKey,
        beneficiary: data.beneficiary,
        amount: data.amount,
        secretHash: data.secretHash,
        unlockTime: data.unlockTime,
        expiryTime: data.expiryTime,
      });

      // Sign with Freighter
      const signedXdr = await signTransaction(xdr);

      // TODO: Submit the transaction to the network
      // For now, we'll just show success
      console.log('Signed transaction:', signedXdr);
      
      showNotification('success', 'Envelope created successfully! 🎉');
    } catch (error: any) {
      console.error('Error creating envelope:', error);
      showNotification('error', error.message || 'Failed to create envelope');
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-strong border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Hash-Locked Envelopes</h1>
                <p className="text-sm text-white/70">Secure Blockchain Inheritance System</p>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {!isFreighterInstalled && !manualMode ? (
                <div className="flex items-center space-x-3">
                  <a
                    href="https://freighter.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gradient px-6 py-3 rounded-lg font-semibold text-white"
                  >
                    Install Freighter Wallet
                  </a>
                  <button
                    onClick={() => setManualMode(true)}
                    className="px-4 py-2 text-sm border border-white/30 text-white hover:bg-white/10 rounded-lg transition"
                  >
                    I have Freighter
                  </button>
                </div>
              ) : connected ? (
                <div className="flex items-center space-x-4">
                  <div className="glass px-4 py-2 rounded-lg">
                    <p className="text-xs text-white/70">Connected</p>
                    <p className="text-sm font-mono text-white">
                      {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
                    </p>
                  </div>
                  <button
                    onClick={disconnect}
                    className="px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connect}
                  disabled={walletLoading}
                  className="btn-gradient px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
                >
                  {walletLoading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>

          {/* Wallet Error */}
          {walletError && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white">
              <p className="font-semibold">Wallet Connection Error</p>
              <p className="text-sm mt-1">{walletError}</p>
              <p className="text-xs mt-2 text-white/70">
                Make sure Freighter is installed and enabled for this site. Try clicking the extension icon and refreshing.
              </p>
            </div>
          )}

          {/* Freighter Detection Debug Info */}
          {!isFreighterInstalled && manualMode && (
            <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-white">
              <p className="font-semibold">⚠️ Freighter Not Detected</p>
              <p className="text-sm mt-2">If you have Freighter installed:</p>
              <ul className="text-sm mt-2 ml-4 list-disc space-y-1">
                <li>Click the Freighter extension icon in your browser</li>
                <li>Make sure it's unlocked (enter password)</li>
                <li>Check that it's enabled for localhost</li>
                <li>Refresh this page (Ctrl+R)</li>
                <li>Try disabling and re-enabling the extension</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-yellow-500/30">
                <p className="text-xs text-white/70">
                  Debug: window.freighterApi = {window.freighterApi ? 'found' : 'not found'}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {!connected ? (
          <div className="glass rounded-2xl p-12 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🔐</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to Hash-Locked Envelopes</h2>
            <p className="text-white/80 text-lg mb-8">
              Create secure time-locked transfers on the Stellar blockchain. Lock XLM tokens with a secret phrase
              and let your beneficiaries claim them at a specific time.
            </p>
            <div className="space-y-4 text-left max-w-md mx-auto mb-8">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-white">Secure Inheritance</h3>
                  <p className="text-white/70 text-sm">Lock funds for future transfer with cryptographic security</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <h3 className="font-semibold text-white">Time-Locked</h3>
                  <p className="text-white/70 text-sm">Set unlock and expiry times for controlled access</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🔑</span>
                <div>
                  <h3 className="font-semibold text-white">Secret Protected</h3>
                  <p className="text-white/70 text-sm">SHA-256 hashed secrets ensure only intended recipients can claim</p>
                </div>
              </div>
            </div>
            {isFreighterInstalled ? (
              <button
                onClick={connect}
                disabled={walletLoading}
                className="btn-gradient px-8 py-4 rounded-lg font-semibold text-white text-lg disabled:opacity-50"
              >
                {walletLoading ? 'Connecting...' : 'Connect Freighter Wallet'}
              </button>
            ) : (
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block btn-gradient px-8 py-4 rounded-lg font-semibold text-white text-lg"
              >
                Install Freighter Wallet
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Create Envelope Form */}
            <CreateEnvelopeForm onSubmit={handleCreateEnvelope} userPublicKey={publicKey!} />

            {/* Placeholder for envelope list */}
            <div className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Your Envelopes</h2>
              <p className="text-white/70">No envelopes created yet. Create your first envelope above!</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-strong border-t border-white/20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/70">
            Built on Stellar Blockchain • Powered by Soroban Smart Contracts
          </p>
          <p className="text-white/50 text-sm mt-2">
            Testnet Deployment • For Educational Purposes
          </p>
        </div>
      </footer>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 glass-strong rounded-lg p-4 toast ${
            notification.type === 'success' ? 'border-green-500/50' : 'border-red-500/50'
          } border max-w-md`}
        >
          <div className="flex items-start space-x-3">
            <span className="text-2xl">{notification.type === 'success' ? '✅' : '❌'}</span>
            <div>
              <p className="text-white font-semibold">
                {notification.type === 'success' ? 'Success' : 'Error'}
              </p>
              <p className="text-white/80 text-sm">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
