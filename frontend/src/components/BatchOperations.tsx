import { useState } from 'react';
import toast from 'react-hot-toast';

interface BatchEnvelope {
  id: string;
  recipient: string;
  amount: string;
  unlockTime: string;
  expiryTime: string;
  secretHash: string;
}

export function BatchOperations() {
  const [envelopes, setEnvelopes] = useState<BatchEnvelope[]>([
    {
      id: '1',
      recipient: '',
      amount: '100',
      unlockTime: '',
      expiryTime: '',
      secretHash: '',
    },
  ]);

  const addEnvelope = () => {
    const newId = String(envelopes.length + 1);
    setEnvelopes([
      ...envelopes,
      {
        id: newId,
        recipient: '',
        amount: '100',
        unlockTime: '',
        expiryTime: '',
        secretHash: '',
      },
    ]);
  };

  const removeEnvelope = (id: string) => {
    if (envelopes.length === 1) {
      toast.error('You must have at least one envelope');
      return;
    }
    setEnvelopes(envelopes.filter(e => e.id !== id));
  };

  const updateEnvelope = (id: string, field: keyof BatchEnvelope, value: string) => {
    setEnvelopes(envelopes.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const duplicateEnvelope = (id: string) => {
    const envelope = envelopes.find(e => e.id === id);
    if (!envelope) return;
    
    const newId = String(envelopes.length + 1);
    setEnvelopes([...envelopes, { ...envelope, id: newId }]);
    toast.success('Envelope duplicated!');
  };

  const applyToAll = (field: 'unlockTime' | 'expiryTime' | 'amount', value: string) => {
    setEnvelopes(envelopes.map(e => ({ ...e, [field]: value })));
    toast.success(`Applied ${field} to all envelopes!`);
  };

  const handleBatchCreate = async () => {
    // Validate all envelopes
    const invalid = envelopes.find(e => 
      !e.recipient || !e.amount || !e.unlockTime || !e.expiryTime || !e.secretHash
    );

    if (invalid) {
      toast.error(`Envelope #${invalid.id} is incomplete!`);
      return;
    }

    try {
      toast.loading(`Creating ${envelopes.length} envelopes...`);
      
      // Here you would integrate with your actual contract creation logic
      // For now, simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.dismiss();
      toast.success(`Successfully created ${envelopes.length} envelopes!`);
      
      // Reset to single envelope
      setEnvelopes([{
        id: '1',
        recipient: '',
        amount: '100',
        unlockTime: '',
        expiryTime: '',
        secretHash: '',
      }]);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to create batch envelopes');
      console.error(error);
    }
  };

  const totalAmount = envelopes.reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="aurora-text text-3xl font-bold mb-2">📦 Batch Operations</h2>
        <p className="text-gray-400">Create multiple envelopes at once</p>
      </div>

      {/* Summary Card */}
      <div className="holographic border-glow p-6 rounded-xl">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl mb-1">📨</div>
            <div className="aurora-text text-2xl font-bold">{envelopes.length}</div>
            <div className="text-sm text-gray-400">Envelopes</div>
          </div>
          <div>
            <div className="text-3xl mb-1">💰</div>
            <div className="neon-text text-2xl font-bold">{totalAmount.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Total XLM</div>
          </div>
          <div>
            <div className="text-3xl mb-1">⚡</div>
            <div className="text-green-400 text-2xl font-bold">{(totalAmount * 0.001).toFixed(4)}</div>
            <div className="text-sm text-gray-400">Est. Fees</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="holographic p-4 rounded-xl">
        <div className="text-sm text-gray-400 mb-3">🚀 Quick Apply to All:</div>
        <div className="grid md:grid-cols-3 gap-2">
          <button
            onClick={() => {
              const date = new Date();
              date.setDate(date.getDate() + 7);
              applyToAll('unlockTime', date.toISOString().slice(0, 16));
            }}
            className="magnetic-button px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-sm"
          >
            Unlock in 7 days
          </button>
          <button
            onClick={() => {
              const date = new Date();
              date.setMonth(date.getMonth() + 1);
              applyToAll('expiryTime', date.toISOString().slice(0, 16));
            }}
            className="magnetic-button px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-sm"
          >
            Expire in 1 month
          </button>
          <button
            onClick={() => applyToAll('amount', '100')}
            className="magnetic-button px-3 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-sm"
          >
            100 XLM each
          </button>
        </div>
      </div>

      {/* Envelopes List */}
      <div className="space-y-4">
        {envelopes.map((envelope, index) => (
          <div key={envelope.id} className="holographic ripple-effect p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between mb-3">
              <div className="aurora-text font-bold text-lg">Envelope #{index + 1}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => duplicateEnvelope(envelope.id)}
                  className="magnetic-button px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-sm"
                  title="Duplicate this envelope"
                >
                  📋 Clone
                </button>
                <button
                  onClick={() => removeEnvelope(envelope.id)}
                  className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-sm text-red-400"
                  title="Remove this envelope"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Recipient Address</label>
                <input
                  type="text"
                  value={envelope.recipient}
                  onChange={(e) => updateEnvelope(envelope.id, 'recipient', e.target.value)}
                  placeholder="GXXXXXXXXXXXXXXXXXXXXXX..."
                  className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Amount (XLM)</label>
                <input
                  type="number"
                  value={envelope.amount}
                  onChange={(e) => updateEnvelope(envelope.id, 'amount', e.target.value)}
                  placeholder="100"
                  className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Unlock Time</label>
                <input
                  type="datetime-local"
                  value={envelope.unlockTime}
                  onChange={(e) => updateEnvelope(envelope.id, 'unlockTime', e.target.value)}
                  className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Expiry Time</label>
                <input
                  type="datetime-local"
                  value={envelope.expiryTime}
                  onChange={(e) => updateEnvelope(envelope.id, 'expiryTime', e.target.value)}
                  className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 block mb-1">Secret Hash</label>
                <input
                  type="text"
                  value={envelope.secretHash}
                  onChange={(e) => updateEnvelope(envelope.id, 'secretHash', e.target.value)}
                  placeholder="Enter secret hash..."
                  className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={addEnvelope}
          className="liquid-button border-glow px-6 py-4 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border-2 border-purple-500/30 font-bold transition-all"
        >
          ➕ Add Another Envelope
        </button>

        <button
          onClick={handleBatchCreate}
          className="liquid-button border-glow px-6 py-4 rounded-xl bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/30 font-bold transition-all"
        >
          ✨ Create All Envelopes
        </button>
      </div>

      {/* Info */}
      <div className="holographic p-4 rounded-xl text-sm text-gray-400 text-center">
        <div className="mb-2">💡 <strong>Pro Tip:</strong> Use "Quick Apply" to set the same value for all envelopes at once!</div>
        <div>Each envelope will be created as a separate transaction. Estimated total time: ~{envelopes.length * 3}s</div>
      </div>
    </div>
  );
}
