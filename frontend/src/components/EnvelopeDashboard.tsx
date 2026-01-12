import { useState, useEffect } from 'react';
import { useFreighter } from '../hooks/useFreighter';

interface DashboardStats {
  totalEnvelopes: number;
  totalSent: string;
  totalReceived: string;
  pendingClaims: number;
  claimedEnvelopes: number;
  reclaimedEnvelopes: number;
}

export function EnvelopeDashboard() {
  const { publicKey } = useFreighter();
  const [stats, setStats] = useState<DashboardStats>({
    totalEnvelopes: 0,
    totalSent: '0',
    totalReceived: '0',
    pendingClaims: 0,
    claimedEnvelopes: 0,
    reclaimedEnvelopes: 0
  });

  const calculateStats = () => {
    const saved = localStorage.getItem(`transactions_${publicKey}`);
    if (!saved) return;

    const transactions = JSON.parse(saved);
    
    let totalSent = 0;
    let totalReceived = 0;
    let pending = 0;
    let claimed = 0;
    let reclaimed = 0;

    transactions.forEach((tx: { type: string; amount: string; status: string }) => {
      const amount = parseFloat(tx.amount);
      
      if (tx.type === 'create') {
        totalSent += amount;
        if (tx.status === 'pending') pending++;
      } else if (tx.type === 'claim') {
        totalReceived += amount;
        claimed++;
      } else if (tx.type === 'reclaim') {
        reclaimed++;
      }
    });

    setStats({
      totalEnvelopes: transactions.length,
      totalSent: totalSent.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      pendingClaims: pending,
      claimedEnvelopes: claimed,
      reclaimedEnvelopes: reclaimed
    });
  };

  useEffect(() => {
    if (publicKey) {
      calculateStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  const StatCard = ({ 
    icon, 
    label, 
    value, 
    gradient 
  }: { 
    icon: string; 
    label: string; 
    value: string | number; 
    gradient: string;
  }) => (
    <div className={`glass-card p-6 hover:scale-105 transition-all duration-300 holographic levitate rainbow-border ${gradient}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-4xl breathe">{icon}</span>
        <div className="text-right">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold gradient-text aurora-text">{value}</p>
        </div>
      </div>
    </div>
  );

  if (!publicKey) {
    return (
      <div className="glass-card p-8 text-center holographic border-glow">
        <div className="text-6xl mb-4 breathe pulse-ring">📊</div>
        <h3 className="text-xl font-bold mb-2 aurora-text">Dashboard Locked</h3>
        <p className="text-white/80">Connect your wallet to view statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold gradient-text aurora-text">📊 Dashboard</h2>
        <button
          onClick={calculateStats}
          className="px-4 py-2 rounded-lg glass-card hover:scale-105 transition-transform liquid-button ripple-effect"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon="📨"
          label="Total Envelopes"
          value={stats.totalEnvelopes}
          gradient="hover:shadow-purple-500/20"
        />
        <StatCard
          icon="💸"
          label="Total Sent"
          value={`${stats.totalSent} XLM`}
          gradient="hover:shadow-blue-500/20"
        />
        <StatCard
          icon="🎁"
          label="Total Received"
          value={`${stats.totalReceived} XLM`}
          gradient="hover:shadow-green-500/20"
        />
      </div>

      {/* Activity Stats */}
      <div className="glass-card p-6 holographic border-glow">
        <h3 className="text-xl font-bold mb-4 gradient-text aurora-text">Activity Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 ripple-effect glass-reflection">
            <div className="flex items-center gap-3">
              <span className="text-3xl levitate">⏳</span>
              <div>
                <p className="text-2xl font-bold neon-text">{stats.pendingClaims}</p>
                <p className="text-sm text-white/60">Pending Claims</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 ripple-effect glass-reflection">
            <div className="flex items-center gap-3">
              <span className="text-3xl levitate">✅</span>
              <div>
                <p className="text-2xl font-bold neon-text">{stats.claimedEnvelopes}</p>
                <p className="text-sm text-white/60">Claimed</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 ripple-effect glass-reflection">
            <div className="flex items-center gap-3">
              <span className="text-3xl levitate">↩️</span>
              <div>
                <p className="text-2xl font-bold neon-text">{stats.reclaimedEnvelopes}</p>
                <p className="text-sm text-white/60">Reclaimed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="glass-card p-6 holographic">
        <h3 className="text-xl font-bold mb-4 gradient-text aurora-text">💡 Insights</h3>
        <div className="space-y-3">
          {stats.totalEnvelopes === 0 && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 ripple-effect">
              <p className="text-sm text-white/80">🚀 Create your first hash-locked envelope to get started!</p>
            </div>
          )}
          
          {stats.pendingClaims > 0 && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 ripple-effect">
              <p className="text-sm text-white/80">
                ⏳ You have {stats.pendingClaims} pending {stats.pendingClaims === 1 ? 'envelope' : 'envelopes'} waiting to be claimed
              </p>
            </div>
          )}
          
          {parseFloat(stats.totalSent) > 0 && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 ripple-effect">
              <p className="text-sm text-white/80">
                💰 You've successfully sent {stats.totalSent} XLM through hash-locked envelopes
              </p>
            </div>
          )}

          {stats.totalEnvelopes >= 10 && (
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 ripple-effect">
              <p className="text-sm text-white/80">
                🏆 Achievement Unlocked: Envelope Master - 10+ transactions completed!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
