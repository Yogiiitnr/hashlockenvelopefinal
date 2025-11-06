import { useState } from 'react';
import { hashSecret } from '../utils/crypto';

interface CreateEnvelopeFormProps {
  onSubmit: (data: EnvelopeFormData) => Promise<void>;
  userPublicKey?: string; // Reserved for future use
}

export interface EnvelopeFormData {
  beneficiary: string;
  amount: string;
  secret: string;
  secretHash: Uint8Array;
  unlockTime: number;
  expiryTime: number;
}

/**
 * Form component for creating a new envelope
 * Includes validation and secret hashing
 */
export function CreateEnvelopeForm({ onSubmit }: CreateEnvelopeFormProps) {
  const [beneficiary, setBeneficiary] = useState('');
  const [amount, setAmount] = useState('');
  const [secret, setSecret] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [unlockTime, setUnlockTime] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Validate form inputs
   */
  const validateForm = (): string | null => {
    // Validate beneficiary address (Stellar addresses start with G and are 56 chars)
    if (!beneficiary || beneficiary.length !== 56 || !beneficiary.startsWith('G')) {
      return 'Invalid beneficiary address. Must be a valid Stellar address.';
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      return 'Amount must be greater than 0';
    }

    // Validate secret
    if (!secret || secret.length < 8) {
      return 'Secret phrase must be at least 8 characters';
    }

    // Validate dates
    if (!unlockDate || !unlockTime) {
      return 'Please set an unlock date and time';
    }

    if (!expiryDate || !expiryTime) {
      return 'Please set an expiry date and time';
    }

    // Validate time logic
    const now = Date.now();
    const unlockTimestamp = new Date(`${unlockDate}T${unlockTime}`).getTime();
    const expiryTimestamp = new Date(`${expiryDate}T${expiryTime}`).getTime();

    if (unlockTimestamp <= now) {
      return 'Unlock time must be in the future';
    }

    if (expiryTimestamp <= unlockTimestamp) {
      return 'Expiry time must be after unlock time';
    }

    return null;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validate
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Hash the secret
      const secretHash = await hashSecret(secret);

      // Convert times to Unix timestamps (seconds)
      const unlockTimestamp = Math.floor(new Date(`${unlockDate}T${unlockTime}`).getTime() / 1000);
      const expiryTimestamp = Math.floor(new Date(`${expiryDate}T${expiryTime}`).getTime() / 1000);

      // Prepare data
      const formData: EnvelopeFormData = {
        beneficiary,
        amount,
        secret,
        secretHash,
        unlockTime: unlockTimestamp,
        expiryTime: expiryTimestamp,
      };

      // Submit
      await onSubmit(formData);

      // Success - clear form
      setBeneficiary('');
      setAmount('');
      setSecret('');
      setUnlockDate('');
      setUnlockTime('');
      setExpiryDate('');
      setExpiryTime('');
      setSuccessMessage('Envelope created successfully! 🎉');
    } catch (err: any) {
      console.error('Error creating envelope:', err);
      setError(err.message || 'Failed to create envelope');
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

      {/* Beneficiary Address */}
      <div className="fade-in">
        <label className="block text-sm font-semibold text-white mb-2 flex items-center">
          <span className="mr-2">👤</span> Beneficiary Address *
        </label>
        <input
          type="text"
          value={beneficiary}
          onChange={(e) => setBeneficiary(e.target.value)}
          placeholder="G... (56 characters)"
          className="input-glass w-full px-4 py-3 rounded-xl transition-all duration-300"
          disabled={loading}
        />
        <p className="mt-2 text-xs text-white/60 flex items-center">
          <span className="mr-1">ℹ️</span>
          The Stellar address that will be able to claim this envelope
        </p>
      </div>

      {/* Amount */}
      <div className="fade-in" style={{animationDelay: '0.1s'}}>
        <label className="block text-sm font-semibold text-white mb-2 flex items-center">
          <span className="mr-2">💰</span> Amount (XLM) *
        </label>
        <input
          type="number"
          step="0.0000001"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="10.5"
          className="input-glass w-full px-4 py-3 rounded-xl transition-all duration-300"
          disabled={loading}
        />
        <p className="mt-2 text-xs text-white/60 flex items-center">
          <span className="mr-1">ℹ️</span>
          Amount of XLM to lock in the envelope
        </p>
      </div>

      {/* Secret Phrase */}
      <div className="fade-in" style={{animationDelay: '0.2s'}}>
        <label className="block text-sm font-semibold text-white mb-2 flex items-center">
          <span className="mr-2">🔐</span> Secret Phrase *
        </label>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Enter a secret phrase (min 8 characters)"
          className="input-glass w-full px-4 py-3 rounded-xl transition-all duration-300"
          disabled={loading}
        />
        <p className="mt-2 text-xs text-white/60 flex items-center">
          <span className="mr-1">⚠️</span>
          The beneficiary will need this phrase to claim the envelope. Share it securely!
        </p>
      </div>

      {/* Unlock Date & Time */}
      <div className="fade-in" style={{animationDelay: '0.3s'}}>
        <label className="block text-sm font-semibold text-white mb-3 flex items-center">
          <span className="mr-2">🔓</span> Unlock Time *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/80 mb-2">Date</label>
            <input
              type="date"
              value={unlockDate}
              onChange={(e) => setUnlockDate(e.target.value)}
              className="input-glass w-full px-4 py-3 rounded-xl transition-all duration-300"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs text-white/80 mb-2">Time</label>
            <input
              type="time"
              value={unlockTime}
              onChange={(e) => setUnlockTime(e.target.value)}
              className="input-glass w-full px-4 py-3 rounded-xl transition-all duration-300"
              disabled={loading}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-white/60 flex items-center">
          <span className="mr-1">ℹ️</span>
          When the beneficiary can start claiming the envelope
        </p>
      </div>

      {/* Expiry Date & Time */}
      <div className="fade-in" style={{animationDelay: '0.4s'}}>
        <label className="block text-sm font-semibold text-white mb-3 flex items-center">
          <span className="mr-2">⏰</span> Expiry Time *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/80 mb-2">Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="input-glass w-full px-4 py-3 rounded-xl transition-all duration-300"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs text-white/80 mb-2">Time</label>
            <input
              type="time"
              value={expiryTime}
              onChange={(e) => setExpiryTime(e.target.value)}
              className="input-glass w-full px-4 py-3 rounded-xl transition-all duration-300"
              disabled={loading}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-white/60 flex items-center">
          <span className="mr-1">ℹ️</span>
          After this time, you can reclaim the funds if unclaimed
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-gradient w-full py-4 rounded-xl font-bold text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 scale-in"
        style={{animationDelay: '0.5s'}}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <span className="spinner mr-2"></span>
            Creating Envelope...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <span className="mr-2">📨</span>
            Create Envelope
          </span>
        )}
      </button>
    </form>
  );
}
