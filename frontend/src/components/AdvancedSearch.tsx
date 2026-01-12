import { useState, useMemo } from 'react';
import { getSavedTransactions } from '../utils/transactionStorage';
import type { Transaction } from '../utils/transactionStorage';

export function AdvancedSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'create' | 'claim' | 'reclaim'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<'all' | '24h' | '7d' | '30d' | 'custom'>('all');

  const transactions = getSavedTransactions();

  const filteredAndSorted = useMemo(() => {
    let result = [...transactions];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.id.toLowerCase().includes(term) ||
        t.hash.toLowerCase().includes(term) ||
        t.recipient?.toLowerCase().includes(term) ||
        t.amount.includes(term)
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(t => t.status === filterStatus);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date().getTime();
      const ranges: Record<string, number> = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };
      
      const rangeMs = ranges[dateRange];
      if (rangeMs) {
        result = result.filter(t => {
          const txTime = new Date(t.timestamp).getTime();
          return (now - txTime) <= rangeMs;
        });
      }
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'amount':
          comparison = parseFloat(a.amount) - parseFloat(b.amount);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, filterType, filterStatus, dateRange, sortBy, sortOrder]);

  const stats = useMemo(() => ({
    total: filteredAndSorted.length,
    totalAmount: filteredAndSorted.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0),
    byType: {
      create: filteredAndSorted.filter(t => t.type === 'create').length,
      claim: filteredAndSorted.filter(t => t.type === 'claim').length,
      reclaim: filteredAndSorted.filter(t => t.type === 'reclaim').length,
    },
  }), [filteredAndSorted]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="aurora-text text-3xl font-bold mb-2">🔍 Advanced Search</h2>
        <p className="text-gray-400">Find and filter your transactions</p>
      </div>

      {/* Search Bar */}
      <div className="holographic p-4 rounded-xl">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔎 Search by ID, hash, recipient, or amount..."
          className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Type Filter */}
        <div className="holographic p-4 rounded-xl">
          <label className="text-sm text-gray-400 mb-2 block">Transaction Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Types</option>
            <option value="create">✨ Create</option>
            <option value="claim">🎁 Claim</option>
            <option value="reclaim">♻️ Reclaim</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="holographic p-4 rounded-xl">
          <label className="text-sm text-gray-400 mb-2 block">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Status</option>
            <option value="success">✅ Success</option>
            <option value="pending">⏳ Pending</option>
            <option value="failed">❌ Failed</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="holographic p-4 rounded-xl">
          <label className="text-sm text-gray-400 mb-2 block">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        {/* Sort */}
        <div className="holographic p-4 rounded-xl">
          <label className="text-sm text-gray-400 mb-2 block">Sort By</label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="flex-1 bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="type">Type</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="magnetic-button px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="holographic breathe p-4 rounded-xl text-center">
          <div className="aurora-text text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-400 mt-1">Results</div>
        </div>
        <div className="holographic breathe p-4 rounded-xl text-center">
          <div className="neon-text text-2xl font-bold">{stats.totalAmount.toFixed(2)}</div>
          <div className="text-sm text-gray-400 mt-1">Total XLM</div>
        </div>
        <div className="holographic breathe p-4 rounded-xl text-center">
          <div className="text-purple-400 text-2xl font-bold">{stats.byType.create}</div>
          <div className="text-sm text-gray-400 mt-1">Created</div>
        </div>
        <div className="holographic breathe p-4 rounded-xl text-center">
          <div className="text-blue-400 text-2xl font-bold">{stats.byType.claim}</div>
          <div className="text-sm text-gray-400 mt-1">Claimed</div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filteredAndSorted.length === 0 ? (
          <div className="holographic p-8 rounded-xl text-center text-gray-500">
            <div className="text-5xl mb-4">🔍</div>
            <div>No transactions found matching your criteria</div>
          </div>
        ) : (
          filteredAndSorted.map((tx: Transaction) => (
            <div key={tx.id} className="holographic ripple-effect p-4 rounded-xl hover:scale-[1.02] transition-transform">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {tx.type === 'create' ? '✨' : tx.type === 'claim' ? '🎁' : '♻️'}
                    </span>
                    <span className="aurora-text font-bold">{tx.type.toUpperCase()}</span>
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${tx.status === 'success' ? 'bg-green-500/20 text-green-400' : ''}
                      ${tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                      ${tx.status === 'failed' ? 'bg-red-500/20 text-red-400' : ''}
                    `}>
                      {tx.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Amount:</span>
                      <span className="neon-text font-bold">{tx.amount} XLM</span>
                    </div>
                    {tx.recipient && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Recipient:</span>
                        <span className="text-purple-400 font-mono text-xs">{tx.recipient.slice(0, 8)}...{tx.recipient.slice(-8)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Date:</span>
                      <span className="text-gray-400">{new Date(tx.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Hash:</span>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-mono text-xs underline"
                      >
                        {tx.hash.slice(0, 12)}...
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
