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
 * Submit a signed transaction to the Stellar network
 * @param signedXdr - The signed transaction XDR string
 * @returns Transaction hash and status
 */
export async function submitTransaction(signedXdr: string) {
  try {
    // Parse the signed transaction
    const transaction = StellarSdk.TransactionBuilder.fromXDR(
      signedXdr,
      NETWORK_CONFIG.networkPassphrase
    ) as StellarSdk.Transaction;

    // Submit to the network
    console.log('Submitting transaction to network...');
    const response = await server.sendTransaction(transaction);

    console.log('Transaction submitted:', response);

    // Check initial response status
    if (response.status === 'ERROR') {
      console.error('Transaction submission error:', response);
      throw new Error('Transaction was rejected by the network');
    }

    // For PENDING transactions, poll for confirmation
    if (response.status === 'PENDING') {
      console.log('Transaction pending, waiting for confirmation...');
      
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const getResponse = await server.getTransaction(response.hash);
          
          console.log(`Polling attempt ${attempts + 1}:`, getResponse.status);
          
          if (getResponse.status === StellarSdk.SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
            console.log('Transaction confirmed!');
            return {
              hash: response.hash,
              status: 'SUCCESS',
              result: getResponse
            };
          } else if (getResponse.status === StellarSdk.SorobanRpc.Api.GetTransactionStatus.FAILED) {
            console.error('Transaction failed:', getResponse);
            throw new Error('Transaction failed on the network');
          }
          // If NOT_FOUND, continue polling
        } catch (pollError: any) {
          // If we get an error while polling, log it but continue trying
          console.log(`Polling error (attempt ${attempts + 1}):`, pollError.message);
        }
        
        attempts++;
      }
      
      // If we've exhausted attempts but transaction was submitted, return pending
      console.warn('Transaction status unknown after polling');
      return {
        hash: response.hash,
        status: 'PENDING',
        result: response
      };
    }

    // For any other status
    return {
      hash: response.hash,
      status: response.status,
      result: response
    };
  } catch (error: any) {
    console.error('Error submitting transaction:', error);
    throw new Error(error.message || 'Failed to submit transaction to network');
  }
}

/**
 * Build and simulate a transaction for creating an envelope
 * @param params - Envelope creation parameters
 * @returns Prepared transaction XDR ready for signing
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
    console.log('Building create envelope transaction...');
    
    // Get the account
    const account = await getAccount(params.owner);
    
    // Convert amount to stroops (1 XLM = 10,000,000 stroops)
    const amountInStroops = Math.floor(parseFloat(params.amount) * 10_000_000);
    
    console.log('Transaction params:', {
      owner: params.owner,
      beneficiary: params.beneficiary,
      amount: amountInStroops,
      unlockTime: params.unlockTime,
      expiryTime: params.expiryTime
    });
    
    // Build the contract call
    const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
    
    // Build initial transaction
    let transaction = new StellarSdk.TransactionBuilder(account, {
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
    
    console.log('Simulating transaction...');
    
    // Simulate the transaction to get resource fees
    const simulated = await server.simulateTransaction(transaction);
    
    if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
      console.error('Simulation error:', simulated);
      throw new Error(`Simulation failed: ${simulated.error}`);
    }
    
    console.log('Simulation successful, preparing transaction...');
    
    // Prepare the transaction with simulation results
    const preparedTransaction = StellarSdk.SorobanRpc.assembleTransaction(
      transaction,
      simulated
    ).build();
    
    console.log('Transaction prepared successfully');
    
    return preparedTransaction.toXDR();
  } catch (error: any) {
    console.error('Error building transaction:', error);
    throw new Error(error.message || 'Failed to build transaction');
  }
}

/**
 * Build and simulate transaction for claiming an envelope
 * @param envelopeId - The ID of the envelope
 * @param secret - The secret phrase as bytes
 * @param beneficiary - Beneficiary's public key
 * @returns Prepared transaction XDR
 */
export async function claimEnvelopeTransaction(
  envelopeId: number,
  secret: Uint8Array,
  beneficiary: string
) {
  try {
    console.log('Building claim transaction...');
    
    const account = await getAccount(beneficiary);
    const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
    
    // Build initial transaction
    let transaction = new StellarSdk.TransactionBuilder(account, {
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
    
    console.log('Simulating claim transaction...');
    
    // Simulate the transaction
    const simulated = await server.simulateTransaction(transaction);
    
    if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
      console.error('Simulation error:', simulated);
      throw new Error(`Simulation failed: ${simulated.error}`);
    }
    
    console.log('Simulation successful, preparing claim transaction...');
    
    // Prepare the transaction with simulation results
    const preparedTransaction = StellarSdk.SorobanRpc.assembleTransaction(
      transaction,
      simulated
    ).build();
    
    return preparedTransaction.toXDR();
  } catch (error: any) {
    console.error('Error building claim transaction:', error);
    throw new Error(error.message || 'Failed to build claim transaction');
  }
}

/**
 * Build and simulate transaction for reclaiming an expired envelope
 * @param envelopeId - The ID of the envelope
 * @param owner - Owner's public key
 * @returns Prepared transaction XDR
 */
export async function reclaimEnvelopeTransaction(
  envelopeId: number,
  owner: string
) {
  try {
    console.log('Building reclaim transaction...');
    
    const account = await getAccount(owner);
    const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
    
    // Build initial transaction
    let transaction = new StellarSdk.TransactionBuilder(account, {
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
    
    console.log('Simulating reclaim transaction...');
    
    // Simulate the transaction
    const simulated = await server.simulateTransaction(transaction);
    
    if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
      console.error('Simulation error:', simulated);
      throw new Error(`Simulation failed: ${simulated.error}`);
    }
    
    console.log('Simulation successful, preparing reclaim transaction...');
    
    // Prepare the transaction with simulation results
    const preparedTransaction = StellarSdk.SorobanRpc.assembleTransaction(
      transaction,
      simulated
    ).build();
    
    return preparedTransaction.toXDR();
  } catch (error: any) {
    console.error('Error building reclaim transaction:', error);
    throw new Error(error.message || 'Failed to build reclaim transaction');
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
