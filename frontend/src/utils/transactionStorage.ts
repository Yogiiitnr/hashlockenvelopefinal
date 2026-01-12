// Transaction storage utility

export interface Transaction {
  id: string;
  type: 'create' | 'claim' | 'reclaim';
  amount: string;
  recipient?: string;
  timestamp: string;
  hash: string;
  status: 'success' | 'pending' | 'failed';
}

// Helper function to save transactions (call this after each operation)
export function saveTransaction(walletAddress: string, transaction: Omit<Transaction, 'id'>) {
  const saved = localStorage.getItem(`transactions_${walletAddress}`);
  const transactions = saved ? JSON.parse(saved) : [];
  
  const newTransaction = {
    ...transaction,
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  transactions.unshift(newTransaction);
  
  // Keep only last 50 transactions
  if (transactions.length > 50) {
    transactions.pop();
  }
  
  localStorage.setItem(`transactions_${walletAddress}`, JSON.stringify(transactions));
}

// Get all saved transactions
export function getSavedTransactions(): Transaction[] {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('transactions_'));
    const allTransactions: Transaction[] = [];
    
    keys.forEach(key => {
      const saved = localStorage.getItem(key);
      if (saved) {
        const transactions = JSON.parse(saved);
        allTransactions.push(...transactions);
      }
    });
    
    // Sort by timestamp (newest first)
    return allTransactions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch {
    return [];
  }
}
