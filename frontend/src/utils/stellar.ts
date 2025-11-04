import * as StellarSdk from '@stellar/stellar-sdk';
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from './contract';

// Initialize Stellar Server
const server = new StellarSdk.SorobanRpc.Server(NETWORK_CONFIG.rpcUrl);

/**
 * Get account details from Stellar
 * @param publicKey - The public key of the account
 * @returns Promise with account data
 */
export async function getAccount(publicKey: string) {
  try {
    const account = await server.getAccount(publicKey);
    return account;
  } catch (error) {
    console.error('Error fetching account:', error);
    throw new Error('Failed to fetch account. Make sure the account is funded on Testnet.');
  }
}

/**
 * Build and sign a transaction for creating an envelope
 * @param params - Envelope creation parameters
 * @returns Signed transaction XDR
 */
export async function createEnvelopeTransaction(params: {
  owner: string;
  beneficiary: string;
  amount: string;
  secretHash: Uint8Array;
  unlockTime: number;
  expiryTime: number;
}) {
  try {
    // Get the account
    const account = await getAccount(params.owner);
    
    // Convert amount to stroops (1 XLM = 10,000,000 stroops)
    const amountInStroops = Math.floor(parseFloat(params.amount) * 10_000_000);
    
    // Build the contract call
    const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
    
    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_CONFIG.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'create_envelope',
          StellarSdk.nativeToScVal(params.owner, { type: 'address' }),
          StellarSdk.nativeToScVal(params.beneficiary, { type: 'address' }),
          StellarSdk.nativeToScVal(amountInStroops, { type: 'i128' }),
          StellarSdk.nativeToScVal(params.secretHash, { type: 'bytes' }),
          StellarSdk.nativeToScVal(params.unlockTime, { type: 'u64' }),
          StellarSdk.nativeToScVal(params.expiryTime, { type: 'u64' })
        )
      )
      .setTimeout(30)
      .build();
    
    return transaction.toXDR();
  } catch (error) {
    console.error('Error building transaction:', error);
    throw error;
  }
}

/**
 * Build transaction for claiming an envelope
 * @param envelopeId - The ID of the envelope
 * @param secret - The secret phrase as bytes
 * @param beneficiary - Beneficiary's public key
 * @returns Signed transaction XDR
 */
export async function claimEnvelopeTransaction(
  envelopeId: number,
  secret: Uint8Array,
  beneficiary: string
) {
  try {
    const account = await getAccount(beneficiary);
    const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_CONFIG.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'claim',
          StellarSdk.nativeToScVal(envelopeId, { type: 'u64' }),
          StellarSdk.nativeToScVal(secret, { type: 'bytes' })
        )
      )
      .setTimeout(30)
      .build();
    
    return transaction.toXDR();
  } catch (error) {
    console.error('Error building claim transaction:', error);
    throw error;
  }
}

/**
 * Build transaction for reclaiming an expired envelope
 * @param envelopeId - The ID of the envelope
 * @param owner - Owner's public key
 * @returns Signed transaction XDR
 */
export async function reclaimEnvelopeTransaction(
  envelopeId: number,
  owner: string
) {
  try {
    const account = await getAccount(owner);
    const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_CONFIG.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'reclaim',
          StellarSdk.nativeToScVal(envelopeId, { type: 'u64' })
        )
      )
      .setTimeout(30)
      .build();
    
    return transaction.toXDR();
  } catch (error) {
    console.error('Error building reclaim transaction:', error);
    throw error;
  }
}

/**
 * Get envelope details from the contract
 * @param envelopeId - The ID of the envelope
 * @returns Envelope data
 */
export async function getEnvelope(envelopeId: number) {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
    
    // Build a read-only call
    const tx = new StellarSdk.TransactionBuilder(
      new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0'),
      {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_CONFIG.networkPassphrase,
      }
    )
      .addOperation(
        contract.call(
          'get_envelope',
          StellarSdk.nativeToScVal(envelopeId, { type: 'u64' })
        )
      )
      .setTimeout(30)
      .build();
    
    const result = await server.simulateTransaction(tx);
    
    if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(result)) {
      return result.result?.retval;
    }
    
    throw new Error('Failed to fetch envelope');
  } catch (error) {
    console.error('Error fetching envelope:', error);
    throw error;
  }
}
