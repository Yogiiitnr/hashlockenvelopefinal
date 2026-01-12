import { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { getSavedTransactions } from '../utils/transactionStorage';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title);

export function EnvelopeAnalytics() {
  const transactions = getSavedTransactions();
  
  const stats = useMemo(() => {
    const created = transactions.filter(t => t.type === 'create');
    const claimed = transactions.filter(t => t.type === 'claim');
    const reclaimed = transactions.filter(t => t.type === 'reclaim');
    
    const totalCreated = created.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
    const totalClaimed = claimed.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
    const totalReclaimed = reclaimed.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
    
    return {
      created: created.length,
      claimed: claimed.length,
      reclaimed: reclaimed.length,
      totalCreated,
      totalClaimed,
      totalReclaimed,
      total: transactions.length,
      successRate: transactions.length > 0 
        ? ((transactions.filter(t => t.status === 'success').length / transactions.length) * 100).toFixed(1)
        : '0',
    };
  }, [transactions]);

  // Pie Chart - Transaction Types
  const pieData = {
    labels: ['Created', 'Claimed', 'Reclaimed'],
    datasets: [{
      data: [stats.created, stats.claimed, stats.reclaimed],
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)', // Purple
        'rgba(59, 130, 246, 0.8)',  // Blue
        'rgba(34, 197, 94, 0.8)',   // Green
      ],
      borderColor: [
        'rgba(147, 51, 234, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(34, 197, 94, 1)',
      ],
      borderWidth: 2,
    }],
  };

  // Bar Chart - Amount Distribution
  const barData = {
    labels: ['Created', 'Claimed', 'Reclaimed'],
    datasets: [{
      label: 'Total Amount (XLM)',
      data: [stats.totalCreated, stats.totalClaimed, stats.totalReclaimed],
      backgroundColor: [
        'rgba(147, 51, 234, 0.6)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(34, 197, 94, 0.6)',
      ],
      borderColor: [
        'rgba(147, 51, 234, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(34, 197, 94, 1)',
      ],
      borderWidth: 2,
    }],
  };

  // Line Chart - Transaction Timeline (last 30 days)
  const lineData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });
    
    const dailyCounts = last30Days.map(date => 
      transactions.filter(t => t.timestamp.startsWith(date)).length
    );
    
    return {
      labels: last30Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Transactions per Day',
        data: dailyCounts,
        fill: true,
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: 'rgba(147, 51, 234, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    };
  }, [transactions]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(147, 51, 234, 0.5)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="holographic breathe p-4 rounded-xl">
          <div className="text-sm text-gray-400">Total Transactions</div>
          <div className="aurora-text text-3xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="holographic breathe p-4 rounded-xl">
          <div className="text-sm text-gray-400">Created</div>
          <div className="text-purple-400 text-3xl font-bold mt-1">{stats.created}</div>
        </div>
        <div className="holographic breathe p-4 rounded-xl">
          <div className="text-sm text-gray-400">Claimed</div>
          <div className="text-blue-400 text-3xl font-bold mt-1">{stats.claimed}</div>
        </div>
        <div className="holographic breathe p-4 rounded-xl">
          <div className="text-sm text-gray-400">Success Rate</div>
          <div className="text-green-400 text-3xl font-bold mt-1">{stats.successRate}%</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="holographic p-6 rounded-xl">
          <h3 className="aurora-text text-xl font-bold mb-4">📊 Transaction Distribution</h3>
          <div className="h-64">
            <Pie data={pieData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { position: 'bottom' as const, labels: { color: '#e5e7eb' } } } }} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="holographic p-6 rounded-xl">
          <h3 className="aurora-text text-xl font-bold mb-4">💰 Amount Flow</h3>
          <div className="h-64">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Line Chart - Full Width */}
      <div className="holographic p-6 rounded-xl">
        <h3 className="aurora-text text-xl font-bold mb-4">📈 Activity Timeline (Last 30 Days)</h3>
        <div className="h-64">
          <Line data={lineData} options={chartOptions} />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="holographic border-glow p-4 rounded-xl text-center">
          <div className="text-2xl mb-2">💎</div>
          <div className="neon-text text-xl font-bold">{stats.totalCreated.toFixed(2)} XLM</div>
          <div className="text-sm text-gray-400 mt-1">Total Created</div>
        </div>
        <div className="holographic border-glow p-4 rounded-xl text-center">
          <div className="text-2xl mb-2">🎁</div>
          <div className="neon-text text-xl font-bold">{stats.totalClaimed.toFixed(2)} XLM</div>
          <div className="text-sm text-gray-400 mt-1">Total Claimed</div>
        </div>
        <div className="holographic border-glow p-4 rounded-xl text-center">
          <div className="text-2xl mb-2">♻️</div>
          <div className="neon-text text-xl font-bold">{stats.totalReclaimed.toFixed(2)} XLM</div>
          <div className="text-sm text-gray-400 mt-1">Total Reclaimed</div>
        </div>
      </div>
    </div>
  );
}
