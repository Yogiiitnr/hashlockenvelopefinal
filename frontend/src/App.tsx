import { useState } from 'react';
import toast from 'react-hot-toast';
import { useFreighter } from './hooks/useFreighter';
import { CreateEnvelopeForm } from './components/CreateEnvelopeForm';
import { ClaimEnvelopeForm } from './components/ClaimEnvelopeForm';
import { ReclaimEnvelopeForm } from './components/ReclaimEnvelopeForm';
import { TransactionHistory } from './components/TransactionHistory';
import { EnvelopeDashboard } from './components/EnvelopeDashboard';
import { QRCodeGenerator } from './components/QRCodeGenerator';
import { ThemeToggle } from './components/ThemeToggle';
import { DiagnosticOverlay } from './components/DiagnosticOverlay';
import { TemplateSelector } from './components/TemplateSelector';
import { EnvelopeAnalytics } from './components/EnvelopeAnalytics';
import { BatchOperations } from './components/BatchOperations';
import { ExportImportData } from './components/ExportImportData';
import { AdvancedSearch } from './components/AdvancedSearch';
import { EmailNotifications } from './components/EmailNotifications';
import type { EnvelopeFormData } from './components/CreateEnvelopeForm';
import { 
  createEnvelopeTransaction, 
  submitTransaction,
  claimEnvelopeTransaction,
  reclaimEnvelopeTransaction
} from './utils/stellar';
import { celebrateSuccess, celebrateFireworks } from './utils/confetti';
import { notificationManager } from './utils/notifications';
import { saveTransaction } from './utils/transactionStorage';

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

  const [manualMode, setManualMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'claim' | 'reclaim' | 'history' | 'dashboard' | 'templates' | 'analytics' | 'batch' | 'search' | 'export' | 'notifications'>('create');
  const [lastCreatedEnvelope, setLastCreatedEnvelope] = useState<{
    id: string;
    amount: string;
    recipient: string;
    hashPreimage: string;
  } | null>(null);
  const [templateDefaults, setTemplateDefaults] = useState<{
    amount: string;
    unlockTime: string;
    expiryTime: string;
    secretHint: string;
  } | null>(null);

  /**
   * Handle envelope creation
   */
  const handleCreateEnvelope = async (data: EnvelopeFormData) => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
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
        // Celebrate with confetti!
        celebrateSuccess();
        
        // Show toast notification
        toast.success(`Envelope created successfully! 🎉 TX: ${result.hash.slice(0, 8)}...`);
        
        // Browser notification
        notificationManager.notifyEnvelopeCreated(data.amount, data.beneficiary);
        
        // Save to transaction history
        saveTransaction(publicKey, {
          type: 'create',
          amount: data.amount,
          recipient: data.beneficiary,
          timestamp: new Date().toISOString(),
          hash: result.hash,
          status: 'success'
        });
        
        // Save for QR code generation
        setLastCreatedEnvelope({
          id: `${Date.now()}`,
          amount: data.amount,
          recipient: data.beneficiary,
          hashPreimage: '' // We don't store the actual preimage for security
        });
      } else {
        toast.error('Transaction submitted but status is unknown. Check Stellar Explorer.');
      }
    } catch (error: unknown) {
      console.error('Error creating envelope:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create envelope';
      toast.error(errorMessage);
      notificationManager.notifyError(errorMessage);
      throw error;
    }
  };

  /**
   * Handle envelope claim
   */
  const handleClaimEnvelope = async (envelopeId: number, secret: Uint8Array) => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
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
        // Celebrate with fireworks!
        celebrateFireworks();
        
        toast.success(`Envelope claimed! 🎉 TX: ${result.hash.slice(0, 8)}...`);
        notificationManager.notifyEnvelopeClaimed('Unknown'); // Amount would need to be fetched
        
        // Save to transaction history
        saveTransaction(publicKey, {
          type: 'claim',
          amount: 'Unknown', // Would need to fetch from contract
          timestamp: new Date().toISOString(),
          hash: result.hash,
          status: 'success'
        });
      } else {
        toast.error('Transaction submitted but status is unknown.');
      }
    } catch (error: unknown) {
      console.error('Error claiming envelope:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to claim envelope';
      toast.error(errorMessage);
      notificationManager.notifyError(errorMessage);
      throw error;
    }
  };

  /**
   * Handle envelope reclaim
   */
  const handleReclaimEnvelope = async (envelopeId: number) => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
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
        celebrateSuccess();
        toast.success(`Envelope reclaimed! 💰 TX: ${result.hash.slice(0, 8)}...`);
        notificationManager.notifyEnvelopeReclaimed('Unknown');
        
        // Save to transaction history
        saveTransaction(publicKey, {
          type: 'reclaim',
          amount: 'Unknown',
          timestamp: new Date().toISOString(),
          hash: result.hash,
          status: 'success'
        });
      } else {
        toast.error('Transaction submitted but status is unknown.');
      }
    } catch (error: unknown) {
      console.error('Error reclaiming envelope:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reclaim envelope';
      toast.error(errorMessage);
      notificationManager.notifyError(errorMessage);
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Header with Premium Glassmorphism */}
      <header className="glass-strong border-b border-white/10 sticky top-0 z-50 backdrop-blur-2xl border-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Logo & Title - ENHANCED */}
            <div className="flex items-center space-x-4 levitate">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl glow transform hover:rotate-12 transition-transform duration-300 holographic pulse-ring">
                <span className="text-4xl">📨</span>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-2xl tracking-tight aurora-text">
                  Hash-Locked Envelopes
                </h1>
                <p className="text-sm sm:text-base text-white/80 font-medium shimmer">✨ Secure Blockchain Inheritance System ✨</p>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-3">
              {!isFreighterInstalled && !manualMode ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href="https://freighter.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gradient px-8 py-3.5 rounded-2xl font-bold text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
                  >
                    ⬇️ Install Freighter
                  </a>
                  <button
                    onClick={() => setManualMode(true)}
                    className="px-6 py-3 text-sm border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 rounded-2xl transition-all duration-300 font-semibold"
                  >
                    I have Freighter
                  </button>
                </div>
              ) : connected ? (
                <div className="flex items-center gap-4">
                  <div className="glass px-6 py-3 rounded-2xl scale-in shadow-lg hover:shadow-xl transition-shadow duration-300 holographic">
                    <p className="text-xs text-white/60 mb-1 font-semibold">Connected Wallet</p>
                    <p className="text-base font-mono text-white font-bold tracking-wide neon-text">
                      {publicKey?.slice(0, 6)}...{publicKey?.slice(-6)}
                    </p>
                  </div>
                  <button
                    onClick={disconnect}
                    className="px-6 py-3 rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 hover:border-red-400/60 hover:text-red-200 transition-all duration-300 font-semibold shadow-lg ripple-effect"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connect}
                  disabled={walletLoading}
                  className="btn-gradient px-8 py-3.5 rounded-2xl font-bold text-white disabled:opacity-50 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 text-lg liquid-button ripple-effect"
                >
                  {walletLoading ? (
                    <span className="flex items-center gap-3">
                      <span className="spinner"></span>
                      Connecting...
                    </span>
                  ) : (
                    '🔗 Connect Wallet'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Wallet Error Message */}
          {walletError && (
            <div className="mt-6 p-5 bg-red-500/15 border-2 border-red-500/40 rounded-2xl text-white scale-in shadow-lg">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⚠️</div>
                <div className="flex-1">
                  <p className="font-bold text-xl mb-2">Wallet Connection Error</p>
                  <p className="text-base mb-3 text-white/90">{walletError}</p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Make sure Freighter is installed and enabled. Try clicking the extension icon and refreshing the page.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Freighter Not Detected */}
          {!isFreighterInstalled && manualMode && (
            <div className="mt-6 p-5 bg-yellow-500/15 border-2 border-yellow-500/40 rounded-2xl text-white scale-in shadow-lg">
              <p className="font-bold text-lg mb-3 flex items-center gap-2">
                <span>⚠️</span> Freighter Wallet Not Detected
              </p>
              <p className="text-sm mb-3 text-white/90">If you have Freighter installed, try these steps:</p>
              <ul className="text-sm ml-6 list-disc space-y-2 text-white/80">
                <li>Click the Freighter extension icon in your browser toolbar</li>
                <li>Ensure it's unlocked (enter your password if needed)</li>
                <li>Verify it's enabled for localhost</li>
                <li>Hard refresh this page (Ctrl+Shift+R or Cmd+Shift+R)</li>
                <li>Try disabling and re-enabling the extension</li>
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {!connected ? (
          <div className="glass rounded-3xl p-12 sm:p-16 text-center max-w-3xl mx-auto shadow-2xl scale-in hover:shadow-purple-500/30 transition-all duration-500 holographic border-glow">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl float glow breathe pulse-ring">
              <span className="text-7xl">🔐</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 shimmer leading-tight aurora-text">
              Welcome to Hash-Locked Envelopes
            </h2>
            <p className="text-white/90 text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
              Create secure, time-locked transfers on the Stellar blockchain. Lock XLM tokens with a secret phrase
              and enable beneficiaries to claim them at precisely the right moment.
            </p>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mb-12">
              <div className="glass p-6 rounded-2xl hover:bg-white/15 transition-all duration-300 fade-in group hover:scale-105 holographic ripple-effect">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 breathe">✅</div>
                <h3 className="font-bold text-white text-lg mb-2 aurora-text">Secure Inheritance</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Lock funds for future transfer with military-grade cryptographic security
                </p>
              </div>
              <div className="glass p-6 rounded-2xl hover:bg-white/15 transition-all duration-300 fade-in group hover:scale-105 holographic ripple-effect" style={{animationDelay: '0.1s'}}>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 breathe">⏰</div>
                <h3 className="font-bold text-white text-lg mb-2 aurora-text">Time-Locked</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Set precise unlock and expiry times for granular access control
                </p>
              </div>
              <div className="glass p-6 rounded-2xl hover:bg-white/15 transition-all duration-300 fade-in group hover:scale-105 holographic ripple-effect" style={{animationDelay: '0.2s'}}>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 breathe">🔑</div>
                <h3 className="font-bold text-white text-lg mb-2 aurora-text">Secret Protected</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  SHA-256 hashed secrets ensure only intended recipients can claim
                </p>
              </div>
            </div>

            {/* CTA Button */}
            {isFreighterInstalled ? (
              <button
                onClick={connect}
                disabled={walletLoading}
                className="btn-gradient px-12 py-5 rounded-2xl font-bold text-white text-xl disabled:opacity-50 shadow-2xl scale-in hover:scale-110 transition-transform duration-300"
              >
                {walletLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="spinner"></span>
                    Connecting to Freighter...
                  </span>
                ) : (
                  '🚀 Connect Freighter Wallet'
                )}
              </button>
            ) : (
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block btn-gradient px-12 py-5 rounded-2xl font-bold text-white text-xl shadow-2xl scale-in hover:scale-110 transition-transform duration-300"
              >
                💫 Install Freighter Wallet
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-10 fade-in">
            {/* Tab Navigation */}
            <div className="glass rounded-3xl p-3 flex flex-wrap gap-2 max-w-7xl mx-auto shadow-2xl border-glow">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 min-w-[110px] py-3 px-3 rounded-2xl font-bold transition-all duration-300 text-xs magnetic-button ripple-effect ${
                  activeTab === 'create'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-2xl scale-105 transform pulse-ring'
                    : 'text-white/70 hover:text-white hover:bg-white/10 holographic'
                }`}
              >
                <span className={activeTab === 'create' ? 'aurora-text' : ''}>📨 Create</span>
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex-1 min-w-[110px] py-3 px-3 rounded-2xl font-bold transition-all duration-300 text-xs magnetic-button ripple-effect ${
                  activeTab === 'templates'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-2xl scale-105 transform pulse-ring'
                    : 'text-white/70 hover:text-white hover:bg-white/10 holographic'
                }`}
              >
                <span className={activeTab === 'templates' ? 'aurora-text' : ''}>📋 Templates</span>
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`flex-1 min-w-[110px] py-3 px-3 rounded-2xl font-bold transition-all duration-300 text-xs magnetic-button ripple-effect ${
                  activeTab === 'batch'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-2xl scale-105 transform pulse-ring'
                    : 'text-white/70 hover:text-white hover:bg-white/10 holographic'
                }`}
              >
                <span className={activeTab === 'batch' ? 'aurora-text' : ''}>📦 Batch</span>
              </button>
              <button
                onClick={() => setActiveTab('claim')}
                className={`flex-1 min-w-[110px] py-3 px-3 rounded-2xl font-bold transition-all duration-300 text-xs magnetic-button ripple-effect ${
                  activeTab === 'claim'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-2xl scale-105 transform pulse-ring'
                    : 'text-white/70 hover:text-white hover:bg-white/10 holographic'
                }`}
              >
                <span className={activeTab === 'claim' ? 'aurora-text' : ''}>🎁 Claim</span>
              </button>
              <button
                onClick={() => setActiveTab('reclaim')}
                className={`flex-1 min-w-[110px] py-3 px-3 rounded-2xl font-bold transition-all duration-300 text-xs magnetic-button ripple-effect ${
                  activeTab === 'reclaim'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-2xl scale-105 transform pulse-ring'
                    : 'text-white/70 hover:text-white hover:bg-white/10 holographic'
                }`}
              >
                <span className={activeTab === 'reclaim' ? 'aurora-text' : ''}>💰 Reclaim</span>
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 min-w-[110px] py-3 px-3 rounded-2xl font-bold transition-all duration-300 text-xs magnetic-button ripple-effect ${
                  activeTab === 'search'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-2xl scale-105 transform pulse-ring'
                    : 'text-white/70 hover:text-white hover:bg-white/10 holographic'
                }`}
              >
                <span className={activeTab === 'search' ? 'aurora-text' : ''}>🔍 Search</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 min-w-[110px] py-3 px-3 rounded-2xl font-bold transition-all duration-300 text-xs magnetic-button ripple-effect ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-2xl scale-105 transform pulse-ring'
                    : 'text-white/70 hover:text-white hover:bg-white/10 holographic'
                }`}
              >
                <span className={activeTab === 'history' ? 'aurora-text' : ''}>📜 History</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 min-w-[110px] py-3 px-3 rounded-2xl font-bold transition-all duration-300 text-xs magnetic-button ripple-effect ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-2xl scale-105 transform pulse-ring'
                    : 'text-white/70 hover:text-white hover:bg-white/10 holographic'
                }`}
              >
                <span className={activeTab === 'analytics' ? 'aurora-text' : ''}>📈 Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 min-w-[110px] py-3 px-3 rounded-2xl font-bold transition-all duration-300 text-xs magnetic-button ripple-effect ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-2xl scale-105 transform pulse-ring'
                    : 'text-white/70 hover:text-white hover:bg-white/10 holographic'
                }`}
              >
                <span className={activeTab === 'dashboard' ? 'aurora-text' : ''}>📊 Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`flex-1 min-w-[110px] py-3 px-3 rounded-2xl font-bold transition-all duration-300 text-xs magnetic-button ripple-effect ${
                  activeTab === 'export'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-2xl scale-105 transform pulse-ring'
                    : 'text-white/70 hover:text-white hover:bg-white/10 holographic'
                }`}
              >
                <span className={activeTab === 'export' ? 'aurora-text' : ''}>💾 Export</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 min-w-[110px] py-3 px-3 rounded-2xl font-bold transition-all duration-300 text-xs magnetic-button ripple-effect ${
                  activeTab === 'notifications'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-2xl scale-105 transform pulse-ring'
                    : 'text-white/70 hover:text-white hover:bg-white/10 holographic'
                }`}
              >
                <span className={activeTab === 'notifications' ? 'aurora-text' : ''}>📧 Notify</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="max-w-3xl mx-auto">
              {activeTab === 'create' && (
                <div className="space-y-6">
                  <div className="glass rounded-3xl p-10 shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 scale-in envelope-card holographic border-glow">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg glow breathe pulse-ring">
                        <span className="text-4xl levitate">📨</span>
                      </div>
                      <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent aurora-text">
                        Create Hash-Locked Envelope
                      </h2>
                      <p className="text-white/80 mt-2 neon-text">Lock XLM with a secret phrase and time constraints</p>
                    </div>
                    <CreateEnvelopeForm 
                      onSubmit={handleCreateEnvelope} 
                      userPublicKey={publicKey!} 
                      templateDefaults={templateDefaults}
                      onTemplateUsed={() => setTemplateDefaults(null)}
                    />
                  </div>
                  
                  {/* QR Code Generator for last created envelope */}
                  {lastCreatedEnvelope && (
                    <QRCodeGenerator
                      envelopeId={lastCreatedEnvelope.id}
                      recipient={lastCreatedEnvelope.recipient}
                      amount={lastCreatedEnvelope.amount}
                      hashPreimage={lastCreatedEnvelope.hashPreimage}
                    />
                  )}
                </div>
              )}
              
              {activeTab === 'claim' && (
                <div className="glass rounded-3xl p-10 shadow-2xl hover:shadow-pink-500/30 transition-all duration-300 scale-in envelope-card holographic border-glow">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg glow breathe pulse-ring">
                      <span className="text-4xl levitate">🎁</span>
                    </div>
                    <h2 className="text-3xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent aurora-text">
                      Claim Your Envelope
                    </h2>
                    <p className="text-white/80 mt-2 neon-text">Unlock your funds with the secret phrase</p>
                  </div>
                  <ClaimEnvelopeForm onSubmit={handleClaimEnvelope} />
                </div>
              )}
              
              {activeTab === 'reclaim' && (
                <div className="glass rounded-3xl p-10 shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 scale-in envelope-card holographic border-glow">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg glow breathe pulse-ring">
                      <span className="text-4xl levitate">💰</span>
                    </div>
                    <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent aurora-text">
                      Reclaim Expired Envelope
                    </h2>
                    <p className="text-white/80 mt-2 neon-text">Retrieve unclaimed funds after expiry</p>
                  </div>
                  <ReclaimEnvelopeForm onSubmit={handleReclaimEnvelope} />
                </div>
              )}
              
              {activeTab === 'history' && (
                <div className="scale-in">
                  <TransactionHistory />
                </div>
              )}
              
              {activeTab === 'dashboard' && (
                <div className="scale-in">
                  <EnvelopeDashboard />
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="scale-in">
                  <TemplateSelector 
                    onSelectTemplate={(defaults) => {
                      setTemplateDefaults(defaults);
                      setActiveTab('create');
                      toast.success('Template applied! Fill in the remaining fields.');
                    }}
                  />
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="scale-in">
                  <EnvelopeAnalytics />
                </div>
              )}

              {activeTab === 'batch' && (
                <div className="scale-in">
                  <BatchOperations />
                </div>
              )}

              {activeTab === 'search' && (
                <div className="scale-in">
                  <AdvancedSearch />
                </div>
              )}

              {activeTab === 'export' && (
                <div className="scale-in">
                  <ExportImportData />
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="scale-in">
                  <EmailNotifications />
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="glass rounded-3xl p-10 max-w-3xl mx-auto shadow-2xl fade-in hover:bg-white/12 transition-all duration-300 holographic border-glow">
              <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <span className="text-3xl breathe">📖</span> <span className="aurora-text">How It Works</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 hover:bg-white/5 p-4 rounded-xl transition-all duration-200 group ripple-effect">
                  <span className="text-3xl group-hover:scale-125 transition-transform duration-300 levitate">1️⃣</span>
                  <div>
                    <strong className="text-white text-lg block mb-1 neon-text">Create Envelope</strong>
                    <p className="text-white/80 leading-relaxed">
                      Lock XLM with a beneficiary address, secret phrase, unlock time, and expiry time.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 hover:bg-white/5 p-4 rounded-xl transition-all duration-200 group ripple-effect">
                  <span className="text-3xl group-hover:scale-125 transition-transform duration-300 levitate">2️⃣</span>
                  <div>
                    <strong className="text-white text-lg block mb-1 neon-text">Share Securely</strong>
                    <p className="text-white/80 leading-relaxed">
                      Share the envelope ID and secret phrase with your beneficiary through a secure, private channel.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 hover:bg-white/5 p-4 rounded-xl transition-all duration-200 group ripple-effect">
                  <span className="text-3xl group-hover:scale-125 transition-transform duration-300 levitate">3️⃣</span>
                  <div>
                    <strong className="text-white text-lg block mb-1 neon-text">Claim Funds</strong>
                    <p className="text-white/80 leading-relaxed">
                      Beneficiary can claim after unlock time by providing the correct secret phrase.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 hover:bg-white/5 p-4 rounded-xl transition-all duration-200 group ripple-effect">
                  <span className="text-3xl group-hover:scale-125 transition-transform duration-300 levitate">4️⃣</span>
                  <div>
                    <strong className="text-white text-lg block mb-1 neon-text">Reclaim if Unclaimed</strong>
                    <p className="text-white/80 leading-relaxed">
                      If funds remain unclaimed after expiry, the creator can reclaim them safely.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="glass p-4 rounded-xl holographic">
                  <p className="text-xs text-white/60 font-mono break-all">
                    <strong className="text-white/90 block mb-2 text-sm aurora-text">Smart Contract Address:</strong> 
                    CC56K3NLC3LBFI62NKHTTFWODIFVNFHBNP3EFGDWEWVLPW5XGEUDM52G
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <strong className="text-white/90 text-sm">Network:</strong>
                    <span className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-lg text-green-400 text-xs font-bold">
                      Stellar Testnet
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-strong border-t border-white/10 py-8 mt-auto backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/80 flex items-center justify-center gap-2 text-lg font-semibold">
            <span>⚡</span>
            <span>Built on Stellar Blockchain</span>
            <span>•</span>
            <span>🚀 Powered by Soroban Smart Contracts</span>
          </p>
          <p className="text-white/50 text-sm mt-3 flex items-center justify-center gap-2">
            <span>🧪</span>
            <span>Testnet Deployment • For Educational & Demonstration Purposes</span>
          </p>
        </div>
      </footer>

      {/* Diagnostic Overlay - Remove after confirming effects work */}
      <DiagnosticOverlay />
    </div>
  );
}

export default App;
