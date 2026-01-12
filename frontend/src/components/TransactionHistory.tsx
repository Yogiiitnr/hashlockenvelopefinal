import { useState, useEffect } from 'react';
import { useFreighter } from '../hooks/useFreighter';

interface Transaction {
  id: string;
  type: 'create' | 'claim' | 'reclaim';
  amount: string;
  recipient?: string;
  timestamp: number;
  hash: string;
  status: 'success' | 'pending' | 'failed';
}

export function TransactionHistory() {
  const { publicKey } = useFreighter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTransactionHistory = () => {
    setLoading(true);
    // Load from localStorage for now
    const saved = localStorage.getItem(`transactions_${publicKey}`);
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (publicKey) {
      loadTransactionHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  const getStatusBadge = (status: string) => {
    const classes = {
      success: 'bg-green-500/20 text-green-300 border-green-500/50',
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      failed: 'bg-red-500/20 text-red-300 border-red-500/50'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${classes[status as keyof typeof classes]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      create: '📨',
      claim: '🎁',
      reclaim: '↩️'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  if (!publicKey) {
    return (
      <div className="glass-card p-8 text-center holographic border-glow">
        <div className="text-6xl mb-4 breathe">🔒</div>
        <h3 className="text-xl font-bold mb-2 aurora-text">Connect Wallet</h3>
        <p className="text-white/80">Connect your wallet to view transaction history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-card p-8 text-center holographic">
        <div className="animate-spin text-6xl mb-4 levitate">⌛</div>
        <p className="text-white/80">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="glass-card p-8 text-center holographic border-glow">
        <div className="text-6xl mb-4 breathe">📭</div>
        <h3 className="text-xl font-bold mb-2 aurora-text">No Transactions Yet</h3>
        <p className="text-white/80">Your transaction history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold gradient-text aurora-text">Transaction History</h2>
        <button
          onClick={loadTransactionHistory}
          className="px-4 py-2 rounded-lg glass-card hover:scale-105 transition-transform liquid-button ripple-effect"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="glass-card p-4 hover:scale-[1.02] transition-all duration-300 holographic glass-reflection"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl levitate">{getTypeIcon(tx.type)}</span>
                <div>
                  <h4 className="font-bold capitalize neon-text">{tx.type} Envelope</h4>
                  <p className="text-sm text-white/60">
                    {new Date(tx.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              {getStatusBadge(tx.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-white/60 mb-1">Amount</p>
                <p className="font-mono font-bold aurora-text">{tx.amount} XLM</p>
              </div>
              {tx.recipient && (
                <div>
                  <p className="text-xs text-white/60 mb-1">Recipient</p>
                  <p className="font-mono text-sm truncate text-white/80">{tx.recipient}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-white/10">
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 ripple-effect"
              >
                🔍 View on Stellar Expert
              </a>
              <span className="text-xs text-gray-500">•</span>
              <button
                onClick={() => navigator.clipboard.writeText(tx.hash)}
                className="text-xs text-white/60 hover:text-white transition-colors ripple-effect"
              >
                📋 Copy Hash
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
