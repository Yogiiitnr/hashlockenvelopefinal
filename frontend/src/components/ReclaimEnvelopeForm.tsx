import { useState } from 'react';

interface ReclaimEnvelopeFormProps {
  onSubmit: (envelopeId: number) => Promise<void>;
}

/**
 * Form component for reclaiming an expired envelope
 * Requires only the envelope ID
 */
export function ReclaimEnvelopeForm({ onSubmit }: ReclaimEnvelopeFormProps) {
  const [envelopeId, setEnvelopeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validate
    const id = parseInt(envelopeId);
    if (isNaN(id) || id < 0) {
      setError('Please enter a valid envelope ID');
      return;
    }

    setLoading(true);

    try {
      await onSubmit(id);

      // Success
      setEnvelopeId('');
      setSuccessMessage('Envelope reclaimed successfully! 💰');
    } catch (err: any) {
      console.error('Error reclaiming envelope:', err);
      setError(err.message || 'Failed to reclaim envelope');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-blue-500/20 border-2 border-blue-500/50 rounded-xl text-white fade-in">
        <p className="text-sm flex items-start">
          <span className="text-lg mr-2">ℹ️</span>
          <span>You can only reclaim envelopes that you created and that have expired without being claimed.</span>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl text-white scale-in flex items-start space-x-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-500/20 border-2 border-green-500/50 rounded-xl text-white scale-in flex items-start space-x-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-bold">Success!</p>
            <p className="text-sm mt-1">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Envelope ID */}
      <div className="fade-in" style={{animationDelay: '0.1s'}}>
        <label className="block text-sm font-semibold text-white mb-2 flex items-center">
          <span className="mr-2">🆔</span> Envelope ID *
        </label>
        <input
          type="number"
          min="0"
          value={envelopeId}
          onChange={(e) => setEnvelopeId(e.target.value)}
          placeholder="0"
          className="input-glass w-full px-4 py-3 rounded-xl transition-all duration-300"
          disabled={loading}
        />
        <p className="mt-2 text-xs text-white/60 flex items-center">
          <span className="mr-1">ℹ️</span>
          The ID of the expired envelope you want to reclaim
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-gradient w-full py-4 rounded-xl font-bold text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 scale-in"
        style={{animationDelay: '0.2s'}}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <span className="spinner mr-2"></span>
            Reclaiming Envelope...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <span className="mr-2">💰</span>
            Reclaim Envelope
          </span>
        )}
      </button>
    </form>
  );
}
