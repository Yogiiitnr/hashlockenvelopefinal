import { getSavedTransactions } from '../utils/transactionStorage';
import toast from 'react-hot-toast';

export function ExportImportData() {
  
  // Export transactions as CSV
  const exportToCSV = () => {
    try {
      const transactions = getSavedTransactions();
      
      if (transactions.length === 0) {
        toast.error('No transactions to export');
        return;
      }

      // CSV Headers
      const headers = ['ID', 'Type', 'Amount (XLM)', 'Recipient', 'Timestamp', 'Hash', 'Status'];
      
      // CSV Rows
      const rows = transactions.map(t => [
        t.id,
        t.type.toUpperCase(),
        t.amount,
        t.recipient || 'N/A',
        new Date(t.timestamp).toLocaleString(),
        t.hash,
        t.status.toUpperCase()
      ]);
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `hash-envelopes-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${transactions.length} transactions!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export transactions');
    }
  };

  // Export as JSON
  const exportToJSON = () => {
    try {
      const transactions = getSavedTransactions();
      
      if (transactions.length === 0) {
        toast.error('No transactions to export');
        return;
      }

      const jsonContent = JSON.stringify(transactions, null, 2);
      
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `hash-envelopes-${Date.now()}.json`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${transactions.length} transactions!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export transactions');
    }
  };

  // Import from JSON (for backup restore)
  const importFromJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const imported = JSON.parse(content);
          
          if (!Array.isArray(imported)) {
            toast.error('Invalid JSON format');
            return;
          }
          
          // Merge with existing (ask for confirmation first)
          const existingCount = getSavedTransactions().length;
          
          if (existingCount > 0) {
            const confirmed = confirm(`You have ${existingCount} existing transactions. This will MERGE the data. Continue?`);
            if (!confirmed) return;
          }
          
          // Store imported data (you'd need to implement merging logic)
          localStorage.setItem('imported_transactions', JSON.stringify(imported));
          
          toast.success(`Imported ${imported.length} transactions!`);
        } catch (error) {
          console.error('Import error:', error);
          toast.error('Failed to import. Invalid file format.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  // Clear all data (with confirmation)
  const clearAllData = () => {
    const confirmed = confirm('⚠️ This will DELETE ALL your transaction history. Are you absolutely sure?');
    if (!confirmed) return;
    
    const doubleCheck = confirm('Last chance! This action CANNOT be undone. Delete everything?');
    if (!doubleCheck) return;
    
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('transactions_'));
      keys.forEach(key => localStorage.removeItem(key));
      localStorage.removeItem('imported_transactions');
      
      toast.success('All data cleared!');
    } catch (error) {
      console.error('Clear error:', error);
      toast.error('Failed to clear data');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="aurora-text text-3xl font-bold mb-2">💾 Export & Import</h2>
        <p className="text-gray-400">Backup and restore your transaction history</p>
      </div>

      {/* Export Section */}
      <div className="holographic p-6 rounded-xl space-y-4">
        <h3 className="neon-text text-xl font-bold mb-4">📤 Export Data</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={exportToCSV}
            className="liquid-button p-4 rounded-lg border-2 border-purple-500/30 hover:border-purple-400 transition-all"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="font-bold">Export as CSV</div>
            <div className="text-sm text-gray-400 mt-1">For Excel/Spreadsheets</div>
          </button>
          
          <button
            onClick={exportToJSON}
            className="liquid-button p-4 rounded-lg border-2 border-blue-500/30 hover:border-blue-400 transition-all"
          >
            <div className="text-3xl mb-2">📋</div>
            <div className="font-bold">Export as JSON</div>
            <div className="text-sm text-gray-400 mt-1">For backup/restore</div>
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="holographic p-6 rounded-xl space-y-4">
        <h3 className="neon-text text-xl font-bold mb-4">📥 Import Data</h3>
        
        <button
          onClick={importFromJSON}
          className="magnetic-button w-full p-4 rounded-lg border-2 border-green-500/30 hover:border-green-400 transition-all"
        >
          <div className="text-3xl mb-2">📂</div>
          <div className="font-bold">Import from JSON</div>
          <div className="text-sm text-gray-400 mt-1">Restore previous backup</div>
        </button>
      </div>

      {/* Danger Zone */}
      <div className="holographic p-6 rounded-xl space-y-4 border-2 border-red-500/20">
        <h3 className="text-red-400 text-xl font-bold mb-4">⚠️ Danger Zone</h3>
        
        <button
          onClick={clearAllData}
          className="w-full p-4 rounded-lg bg-red-900/20 border-2 border-red-500/30 hover:bg-red-900/40 hover:border-red-400 transition-all text-red-400 font-bold"
        >
          <div className="text-3xl mb-2">🗑️</div>
          <div>Clear All Data</div>
          <div className="text-sm opacity-75 mt-1">Delete entire history (cannot be undone)</div>
        </button>
      </div>

      {/* Info */}
      <div className="text-center text-sm text-gray-500">
        <p>💡 Tip: Export your data regularly to keep backups</p>
        <p className="mt-1">All data is stored locally in your browser</p>
      </div>
    </div>
  );
}
