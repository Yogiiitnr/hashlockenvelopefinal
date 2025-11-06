import { useState } from 'react';
import { useFreighter } from './hooks/useFreighter';
import { CreateEnvelopeForm } from './components/CreateEnvelopeForm';
import { ClaimEnvelopeForm } from './components/ClaimEnvelopeForm';
import { ReclaimEnvelopeForm } from './components/ReclaimEnvelopeForm';
import type { EnvelopeFormData } from './components/CreateEnvelopeForm';
import { 
  createEnvelopeTransaction, 
  submitTransaction,
  claimEnvelopeTransaction,
  reclaimEnvelopeTransaction
} from './utils/stellar';

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
  const [activeTab, setActiveTab] = useState<'create' | 'claim' | 'reclaim'>('create');

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

      // Submit the transaction to the network
      console.log('Submitting transaction to Stellar Testnet...');
      const result = await submitTransaction(signedXdr);
      
      console.log('Transaction result:', result);
      
      if (result.status === 'SUCCESS') {
        showNotification('success', `Envelope created successfully! 🎉 TX: ${result.hash.slice(0, 8)}...`);
      } else {
        showNotification('error', 'Transaction submitted but status is unknown. Check Stellar Explorer.');
      }
    } catch (error: any) {
      console.error('Error creating envelope:', error);
      showNotification('error', error.message || 'Failed to create envelope');
      throw error;
    }
  };

  /**
   * Handle envelope claim
   */
  const handleClaimEnvelope = async (envelopeId: number, secret: Uint8Array) => {
    if (!publicKey) {
      showNotification('error', 'Please connect your wallet first');
      return;
    }

    try {
      // Build the transaction
      const xdr = await claimEnvelopeTransaction(envelopeId, secret, publicKey);

      // Sign with Freighter
      const signedXdr = await signTransaction(xdr);

      // Submit the transaction to the network
      console.log('Submitting claim transaction...');
      const result = await submitTransaction(signedXdr);
      
      console.log('Claim result:', result);
      
      if (result.status === 'SUCCESS') {
        showNotification('success', `Envelope claimed! 🎉 TX: ${result.hash.slice(0, 8)}...`);
      } else {
        showNotification('error', 'Transaction submitted but status is unknown.');
      }
    } catch (error: any) {
      console.error('Error claiming envelope:', error);
      showNotification('error', error.message || 'Failed to claim envelope');
      throw error;
    }
  };

  /**
   * Handle envelope reclaim
   */
  const handleReclaimEnvelope = async (envelopeId: number) => {
    if (!publicKey) {
      showNotification('error', 'Please connect your wallet first');
      return;
    }

    try {
      // Build the transaction
      const xdr = await reclaimEnvelopeTransaction(envelopeId, publicKey);

      // Sign with Freighter
      const signedXdr = await signTransaction(xdr);

      // Submit the transaction to the network
      console.log('Submitting reclaim transaction...');
      const result = await submitTransaction(signedXdr);
      
      console.log('Reclaim result:', result);
      
      if (result.status === 'SUCCESS') {
        showNotification('success', `Envelope reclaimed! 💰 TX: ${result.hash.slice(0, 8)}...`);
      } else {
        showNotification('error', 'Transaction submitted but status is unknown.');
      }
    } catch (error: any) {
      console.error('Error reclaiming envelope:', error);
      showNotification('error', error.message || 'Failed to reclaim envelope');
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* Header */}
      <header className="glass-strong border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 float">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg glow">
                <span className="text-3xl">📨</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">Hash-Locked Envelopes</h1>
                <p className="text-xs sm:text-sm text-white/80">Secure Blockchain Inheritance System</p>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {!isFreighterInstalled && !manualMode ? (
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <a
                    href="https://freighter.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gradient px-6 py-3 rounded-xl font-semibold text-white shadow-lg"
                  >
                    ⬇️ Install Freighter Wallet
                  </a>
                  <button
                    onClick={() => setManualMode(true)}
                    className="px-4 py-2 text-sm border-2 border-white/40 text-white hover:bg-white/10 rounded-xl transition"
                  >
                    I have Freighter
                  </button>
                </div>
              ) : connected ? (
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="glass px-4 py-2.5 rounded-xl scale-in">
                    <p className="text-xs text-white/70 mb-0.5">Connected</p>
                    <p className="text-sm font-mono text-white font-semibold">
                      {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
                    </p>
                  </div>
                  <button
                    onClick={disconnect}
                    className="px-4 py-2.5 rounded-xl border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all duration-300"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connect}
                  disabled={walletLoading}
                  className="btn-gradient px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-50 shadow-lg"
                >
                  {walletLoading ? (
                    <span className="flex items-center">
                      <span className="spinner mr-2"></span>
                      Connecting...
                    </span>
                  ) : (
                    '🔗 Connect Wallet'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Wallet Error */}
          {walletError && (
            <div className="mt-4 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl text-white scale-in">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-semibold text-lg">Wallet Connection Error</p>
                  <p className="text-sm mt-1">{walletError}</p>
                  <p className="text-xs mt-2 text-white/70">
                    Make sure Freighter is installed and enabled for this site. Try clicking the extension icon and refreshing.
                  </p>
                </div>
              </div>
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
                  Debug: Freighter Extension = {isFreighterInstalled ? 'Installed' : 'Not found'}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {!connected ? (
          <div className="glass rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-2xl scale-in">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg float glow">
              <span className="text-5xl">🔐</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 shimmer">Welcome to Hash-Locked Envelopes</h2>
            <p className="text-white/80 text-lg mb-8">
              Create secure time-locked transfers on the Stellar blockchain. Lock XLM tokens with a secret phrase
              and let your beneficiaries claim them at a specific time.
            </p>
            <div className="space-y-4 text-left max-w-md mx-auto mb-8">
              <div className="flex items-start space-x-3 fade-in">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-white">Secure Inheritance</h3>
                  <p className="text-white/70 text-sm">Lock funds for future transfer with cryptographic security</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 fade-in" style={{animationDelay: '0.1s'}}>
                <span className="text-2xl">⏰</span>
                <div>
                  <h3 className="font-semibold text-white">Time-Locked</h3>
                  <p className="text-white/70 text-sm">Set unlock and expiry times for controlled access</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 fade-in" style={{animationDelay: '0.2s'}}>
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
                className="btn-gradient px-8 py-4 rounded-xl font-semibold text-white text-lg disabled:opacity-50 shadow-lg scale-in hover:scale-110 transition-transform duration-300"
              >
                {walletLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="spinner mr-2"></span>
                    Connecting...
                  </span>
                ) : (
                  'Connect Freighter Wallet'
                )}
              </button>
            ) : (
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block btn-gradient px-8 py-4 rounded-xl font-semibold text-white text-lg shadow-lg scale-in hover:scale-110 transition-transform duration-300"
              >
                Install Freighter Wallet
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-8 fade-in">
            {/* Tab Navigation */}
            <div className="glass rounded-2xl p-2 flex space-x-2 max-w-2xl mx-auto shadow-xl">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'create'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                📨 Create Envelope
              </button>
              <button
                onClick={() => setActiveTab('claim')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'claim'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                🎁 Claim Envelope
              </button>
              <button
                onClick={() => setActiveTab('reclaim')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'reclaim'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                💰 Reclaim Expired
              </button>
            </div>

            {/* Tab Content */}
            <div className="max-w-2xl mx-auto">
              {activeTab === 'create' && (
                <div className="glass rounded-2xl p-8 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 scale-in">
                  <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Create Hash-Locked Envelope
                  </h2>
                  <CreateEnvelopeForm onSubmit={handleCreateEnvelope} userPublicKey={publicKey!} />
                </div>
              )}
              
              {activeTab === 'claim' && (
                <div className="glass rounded-2xl p-8 shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 scale-in">
                  <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Claim Your Envelope
                  </h2>
                  <ClaimEnvelopeForm onSubmit={handleClaimEnvelope} />
                </div>
              )}
              
              {activeTab === 'reclaim' && (
                <div className="glass rounded-2xl p-8 shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 scale-in">
                  <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Reclaim Expired Envelope
                  </h2>
                  <ReclaimEnvelopeForm onSubmit={handleReclaimEnvelope} />
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="glass rounded-2xl p-8 max-w-2xl mx-auto shadow-xl fade-in">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📖</span> How It Works
              </h3>
              <div className="space-y-3 text-white/80 text-sm">
                <div className="flex items-start space-x-3 hover:bg-white/5 p-3 rounded-lg transition-colors duration-200">
                  <span className="text-lg">1️⃣</span>
                  <div>
                    <strong className="text-white">Create:</strong> Lock XLM with a beneficiary address, secret phrase, unlock time, and expiry time.
                  </div>
                </div>
                <div className="flex items-start space-x-3 hover:bg-white/5 p-3 rounded-lg transition-colors duration-200">
                  <span className="text-lg">2️⃣</span>
                  <div>
                    <strong className="text-white">Share:</strong> Give the envelope ID and secret phrase to your beneficiary through a secure channel.
                  </div>
                </div>
                <div className="flex items-start space-x-3 hover:bg-white/5 p-3 rounded-lg transition-colors duration-200">
                  <span className="text-lg">3️⃣</span>
                  <div>
                    <strong className="text-white">Claim:</strong> Beneficiary can claim after the unlock time using the correct secret phrase.
                  </div>
                </div>
                <div className="flex items-start space-x-3 hover:bg-white/5 p-3 rounded-lg transition-colors duration-200">
                  <span className="text-lg">4️⃣</span>
                  <div>
                    <strong className="text-white">Reclaim:</strong> If unclaimed after expiry, you can reclaim your funds.
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-xs text-white/60 font-mono break-all">
                  <strong className="text-white/80">Contract Address:</strong> CC56K3NLC3LBFI62NKHTTFWODIFVNFHBNP3EFGDWEWVLPW5XGEUDM52G
                </p>
                <p className="text-xs text-white/60 mt-2">
                  <strong className="text-white/80">Network:</strong> <span className="text-green-400">Stellar Testnet</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-strong border-t border-white/20 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/70 flex items-center justify-center space-x-2">
            <span>⚡</span>
            <span>Built on Stellar Blockchain</span>
            <span>•</span>
            <span>🚀 Powered by Soroban Smart Contracts</span>
          </p>
          <p className="text-white/50 text-sm mt-2 flex items-center justify-center space-x-2">
            <span>🧪</span>
            <span>Testnet Deployment • For Educational Purposes</span>
          </p>
        </div>
      </footer>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 glass-strong rounded-xl p-4 shadow-2xl scale-in ${
            notification.type === 'success' 
              ? 'border-green-500/50 glow-green' 
              : 'border-red-500/50 glow-red'
          } border-2 max-w-md z-50`}
        >
          <div className="flex items-start space-x-3">
            <span className="text-2xl">{notification.type === 'success' ? '✅' : '❌'}</span>
            <div>
              <p className="text-white font-bold text-lg">
                {notification.type === 'success' ? 'Success!' : 'Error'}
              </p>
              <p className="text-white/90 text-sm mt-1">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
