import { useState } from 'react';
import { hashSecret } from '../utils/crypto';

interface CreateEnvelopeFormProps {
  onSubmit: (data: EnvelopeFormData) => Promise<void>;
  userPublicKey: string;
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
export function CreateEnvelopeForm({ onSubmit, userPublicKey }: CreateEnvelopeFormProps) {
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
    <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-white">Create New Envelope</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-white">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Beneficiary Address */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Beneficiary Address *
          </label>
          <input
            type="text"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
            placeholder="G... (56 characters)"
            className="input-glass w-full px-4 py-3 rounded-lg"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-white/60">
            The Stellar address that will be able to claim this envelope
          </p>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Amount (XLM) *
          </label>
          <input
            type="number"
            step="0.0000001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10.5"
            className="input-glass w-full px-4 py-3 rounded-lg"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-white/60">
            Amount of XLM to lock in the envelope
          </p>
        </div>

        {/* Secret Phrase */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Secret Phrase *
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter a secret phrase (min 8 characters)"
            className="input-glass w-full px-4 py-3 rounded-lg"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-white/60">
            The beneficiary will need this phrase to claim the envelope. Share it securely!
          </p>
        </div>

        {/* Unlock Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Unlock Date *
            </label>
            <input
              type="date"
              value={unlockDate}
              onChange={(e) => setUnlockDate(e.target.value)}
              className="input-glass w-full px-4 py-3 rounded-lg"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Unlock Time *
            </label>
            <input
              type="time"
              value={unlockTime}
              onChange={(e) => setUnlockTime(e.target.value)}
              className="input-glass w-full px-4 py-3 rounded-lg"
              disabled={loading}
            />
          </div>
        </div>
        <p className="text-xs text-white/60 -mt-4">
          When the beneficiary can start claiming the envelope
        </p>

        {/* Expiry Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Expiry Date *
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="input-glass w-full px-4 py-3 rounded-lg"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Expiry Time *
            </label>
            <input
              type="time"
              value={expiryTime}
              onChange={(e) => setExpiryTime(e.target.value)}
              className="input-glass w-full px-4 py-3 rounded-lg"
              disabled={loading}
            />
          </div>
        </div>
        <p className="text-xs text-white/60 -mt-4">
          After this time, you can reclaim the funds if unclaimed
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-gradient w-full py-4 rounded-lg font-semibold text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="spinner mr-2"></span>
              Creating Envelope...
            </span>
          ) : (
            'Create Envelope'
          )}
        </button>
      </form>
    </div>
  );
}
