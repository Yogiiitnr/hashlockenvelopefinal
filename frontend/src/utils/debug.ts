import * as StellarSdk from '@stellar/stellar-sdk';
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from './contract';

const server = new StellarSdk.SorobanRpc.Server(NETWORK_CONFIG.rpcUrl);

/**
 * Debug function to check envelope details
 */
export async function debugEnvelope(envelopeId: number) {
  try {
    console.log('=== Debugging Envelope ===');
    console.log('Envelope ID:', envelopeId);
    console.log('Contract:', CONTRACT_ADDRESS);
    
    const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
    
    // Build a read-only call to get envelope
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
    
    console.log('Simulation result:', result);
    
    if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(result)) {
      console.log('✅ Envelope exists!');
      const envelope = result.result?.retval;
      console.log('Envelope data:', envelope);
      
      // Try to parse the envelope structure
      if (envelope) {
        console.log('Raw envelope:', envelope);
      }
      
      return envelope;
    } else if (StellarSdk.SorobanRpc.Api.isSimulationError(result)) {
      console.log('❌ Envelope query failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error debugging envelope:', error);
    return null;
  }
}

/**
 * Get the next envelope ID from the contract
 */
export async function getNextEnvelopeId() {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
    
    const tx = new StellarSdk.TransactionBuilder(
      new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0'),
      {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_CONFIG.networkPassphrase,
      }
    )
      .addOperation(
        contract.call('get_next_id')
      )
      .setTimeout(30)
      .build();
    
    const result = await server.simulateTransaction(tx);
    
    if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(result)) {
      const nextId = result.result?.retval;
      console.log('Next envelope ID will be:', nextId);
      return nextId;
    }
  } catch (error) {
    console.error('Error getting next ID:', error);
  }
}
