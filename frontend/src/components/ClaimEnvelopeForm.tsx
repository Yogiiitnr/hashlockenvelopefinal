import { useState } from 'react';

interface ClaimEnvelopeFormProps {
  onSubmit: (envelopeId: number, secret: Uint8Array) => Promise<void>;
}

/**
 * Form component for claiming an envelope
 * Requires envelope ID and the secret phrase
 */
export function ClaimEnvelopeForm({ onSubmit }: ClaimEnvelopeFormProps) {
  const [envelopeId, setEnvelopeId] = useState('');
  const [secret, setSecret] = useState('');
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

    if (!secret || secret.length < 8) {
      setError('Secret phrase must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Convert secret to bytes (contract will hash it internally)
      const encoder = new TextEncoder();
      const secretBytes = encoder.encode(secret);

      // Submit with raw secret bytes (not hashed!)
      await onSubmit(id, secretBytes);

      // Success
      setEnvelopeId('');
      setSecret('');
      setSuccessMessage('Envelope claimed successfully! 🎉');
    } catch (err: any) {
      console.error('Error claiming envelope:', err);
      setError(err.message || 'Failed to claim envelope');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Info Banner */}
      <div className="p-4 bg-purple-500/20 border-2 border-purple-500/50 rounded-xl text-white fade-in">
        <p className="text-sm flex items-start">
          <span className="text-lg mr-2">💡</span>
          <span>Enter the envelope ID and secret phrase provided by the creator to claim your funds.</span>
        </p>
      </div>

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
          The ID of the envelope you want to claim
        </p>
      </div>

      {/* Secret Phrase */}
      <div className="fade-in" style={{animationDelay: '0.2s'}}>
        <label className="block text-sm font-semibold text-white mb-2 flex items-center">
          <span className="mr-2">🔑</span> Secret Phrase *
        </label>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Enter the secret phrase"
          className="input-glass w-full px-4 py-3 rounded-xl transition-all duration-300"
          disabled={loading}
        />
        <p className="mt-2 text-xs text-white/60 flex items-center">
          <span className="mr-1">ℹ️</span>
          The secret phrase provided by the envelope creator
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-gradient w-full py-4 rounded-xl font-bold text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 scale-in"
        style={{animationDelay: '0.3s'}}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <span className="spinner mr-2"></span>
            Claiming Envelope...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <span className="mr-2">🎁</span>
            Claim Envelope
          </span>
        )}
      </button>
    </form>
  );
}
