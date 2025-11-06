# 🔧 Transaction Rejection Troubleshooting Guide

## The Issue: "Transaction was rejected by the network"

### What Was Wrong ❌

The transactions were being **rejected by the Stellar network** because:

1. **Missing Transaction Simulation**: Soroban smart contract transactions require simulation before submission
2. **Missing Resource Fees**: The transaction didn't include proper resource fees calculated by simulation
3. **Incomplete Transaction Preparation**: The transaction wasn't "assembled" with the simulation results

### The Fix ✅

Updated all three transaction builders (`createEnvelopeTransaction`, `claimEnvelopeTransaction`, `reclaimEnvelopeTransaction`) to follow the proper Soroban flow:

```typescript
// OLD (Broken) ❌
const transaction = new StellarSdk.TransactionBuilder(account, {...})
  .addOperation(contract.call(...))
  .build();
return transaction.toXDR(); // Missing simulation!

// NEW (Working) ✅
const transaction = new StellarSdk.TransactionBuilder(account, {...})
  .addOperation(contract.call(...))
  .build();

// 1. SIMULATE to get resource fees
const simulated = await server.simulateTransaction(transaction);

// 2. Check for simulation errors
if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
  throw new Error(`Simulation failed: ${simulated.error}`);
}

// 3. ASSEMBLE transaction with simulation results
const preparedTransaction = StellarSdk.SorobanRpc.assembleTransaction(
  transaction,
  simulated
).build();

return preparedTransaction.toXDR();
```

---

## Understanding Soroban Transaction Flow

### Classic Stellar vs Soroban

**Classic Stellar Payments** (Simple):
```
Build → Sign → Submit → Done ✅
```

**Soroban Smart Contracts** (Complex):
```
Build → Simulate → Assemble → Sign → Submit → Done ✅
       ↑ NEW STEPS REQUIRED ↑
```

### Why Simulation is Required

Soroban smart contracts need simulation because:

1. **Resource Calculation**: Contracts use CPU, memory, and storage - fees must be calculated
2. **Footprint Generation**: Contract determines which ledger entries it will read/write
3. **Return Value Preview**: You can see what the contract will return before committing
4. **Error Detection**: Catches issues before spending XLM on fees

---

## How to Debug Transaction Issues

### Step 1: Check Browser Console

Open DevTools (F12) and look for:

```javascript
// Good signs ✅
"Building create envelope transaction..."
"Simulating transaction..."
"Simulation successful, preparing transaction..."
"Transaction prepared successfully"

// Bad signs ❌
"Simulation error: ..."
"Error building transaction: ..."
"Transaction was rejected by the network"
```

### Step 2: Verify Transaction Parameters

Before the transaction is built, check the logs:

```javascript
Transaction params: {
  owner: "GXXX...XXX",
  beneficiary: "GYYY...YYY",
  amount: 100000000,  // 10 XLM in stroops
  unlockTime: 1699286400,  // Unix timestamp
  expiryTime: 1699290000   // Must be > unlockTime
}
```

**Common Issues**:
- ❌ Beneficiary address invalid (not 56 chars or doesn't start with G)
- ❌ Amount is 0 or negative
- ❌ Unlock time is in the past
- ❌ Expiry time is before unlock time
- ❌ Times are in milliseconds instead of seconds

### Step 3: Check Simulation Results

If simulation fails, the error will tell you why:

```javascript
// Example simulation errors:
"Simulation failed: HostError: InvokeContract"
// → Contract execution failed, check your parameters

"Simulation failed: insufficient balance"
// → Not enough XLM in your account

"Simulation failed: auth failed"
// → Wrong account trying to perform action
```

### Step 4: Verify Network Connection

```javascript
// Test in browser console:
const server = new StellarSdk.SorobanRpc.Server('https://soroban-testnet.stellar.org');
server.getHealth().then(health => console.log('Network health:', health));

// Expected output:
// Network health: { status: "healthy" }
```

---

## Common Transaction Errors & Solutions

### Error: "Transaction was rejected by the network"

**Cause**: Transaction wasn't simulated and assembled properly

**Solution**: ✅ Already fixed in the code! The transaction now goes through simulation.

**How to verify**:
- Check console logs for "Simulating transaction..."
- Should see "Simulation successful, preparing transaction..."

---

### Error: "Simulation failed: insufficient balance"

**Cause**: Not enough XLM to cover:
- Amount you're locking in envelope
- Transaction fees (~0.1 XLM)
- Account minimum balance (1 XLM)

**Solution**:
1. Check your balance in Freighter
2. Fund your account: https://laboratory.stellar.org/#account-creator?network=test
3. Try with a smaller amount

**How to check balance**:
```javascript
// In browser console:
const server = new StellarSdk.SorobanRpc.Server('https://soroban-testnet.stellar.org');
const horizonServer = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
horizonServer.loadAccount('YOUR_PUBLIC_KEY').then(account => {
  console.log('XLM Balance:', account.balances.find(b => b.asset_type === 'native').balance);
});
```

---

### Error: "Simulation failed: HostError: InvokeContract"

**Cause**: Contract rejected the operation due to business logic

**Possible reasons**:
1. **Creating envelope**: 
   - Unlock time must be in the future
   - Expiry time must be after unlock time
   - Amount must be > 0

2. **Claiming envelope**:
   - Envelope doesn't exist (wrong ID)
   - Wrong secret phrase (hash doesn't match)
   - Too early (before unlock time)
   - Too late (after expiry time)
   - Already claimed

3. **Reclaiming envelope**:
   - Envelope doesn't exist
   - Not the owner
   - Not expired yet
   - Already claimed

**Solution**: Verify your input parameters match the contract requirements

---

### Error: "Failed to fetch account"

**Cause**: Account doesn't exist on the network

**Solution**:
1. Verify you're connected to TESTNET in Freighter
2. Fund the account: https://laboratory.stellar.org/#account-creator?network=test
3. Wait a few seconds for the account to activate
4. Try again

---

### Error: "User declined access" or "User rejected signing"

**Cause**: You clicked "Reject" in the Freighter popup

**Solution**:
1. Click "Create Envelope" (or Claim/Reclaim) again
2. When Freighter popup appears, click "Approve"
3. If you don't see the popup:
   - Check for popup blocker
   - Click Freighter extension icon
   - Make sure it's unlocked

---

## Testing the Fix

### Test 1: Create Envelope (Most Common)

1. Open http://localhost:5173
2. Connect wallet
3. Fill create envelope form:
   ```
   Beneficiary: [Any valid 56-char G... address]
   Amount: 10
   Secret: TestSecret123
   Unlock: 1 minute from now
   Expiry: 10 minutes from now
   ```
4. Click "Create Envelope"
5. Open browser console (F12)
6. Watch for logs:
   ```
   ✅ "Building create envelope transaction..."
   ✅ "Simulating transaction..."
   ✅ "Simulation successful, preparing transaction..."
   ✅ "Transaction prepared successfully"
   ✅ [Freighter popup appears]
   ✅ [After signing] "Submitting transaction to network..."
   ✅ "Transaction confirmed!"
   ✅ Success notification with TX hash
   ```

### Test 2: Verify on Blockchain

1. Copy transaction hash from success notification
2. Visit: https://stellar.expert/explorer/testnet
3. Paste hash in search
4. Verify:
   - ✅ Status: SUCCESS
   - ✅ Type: invoke_contract
   - ✅ Contract: CC56K3NLC3LBFI62NKHTTFWODIFVNFHBNP3EFGDWEWVLPW5XGEUDM52G
   - ✅ Function: create_envelope

---

## Advanced Debugging

### Simulate Without Submitting

If you want to test if a transaction would work without actually submitting:

```javascript
// In browser console:
const StellarSdk = window.StellarSdk; // If SDK is exposed globally
const server = new StellarSdk.SorobanRpc.Server('https://soroban-testnet.stellar.org');

// Get your transaction XDR (before signing)
const xdr = "YOUR_TRANSACTION_XDR_HERE";
const transaction = StellarSdk.TransactionBuilder.fromXDR(xdr, 'Test SDF Network ; September 2015');

// Simulate
server.simulateTransaction(transaction).then(result => {
  console.log('Simulation result:', result);
  
  if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(result)) {
    console.log('✅ Transaction would succeed!');
    console.log('Cost:', result.cost);
    console.log('Result:', result.result);
  } else {
    console.log('❌ Transaction would fail!');
    console.log('Error:', result.error);
  }
});
```

### Check Contract State

To see what's stored in the contract:

```javascript
// Get envelope by ID
async function getEnvelope(id) {
  const contract = new StellarSdk.Contract('CC56K3NLC3LBFI62NKHTTFWODIFVNFHBNP3EFGDWEWVLPW5XGEUDM52G');
  const server = new StellarSdk.SorobanRpc.Server('https://soroban-testnet.stellar.org');
  
  const tx = new StellarSdk.TransactionBuilder(
    new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0'),
    {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: 'Test SDF Network ; September 2015',
    }
  )
    .addOperation(
      contract.call(
        'get_envelope',
        StellarSdk.nativeToScVal(id, { type: 'u64' })
      )
    )
    .setTimeout(30)
    .build();
  
  const result = await server.simulateTransaction(tx);
  return result;
}

// Use it:
getEnvelope(0).then(result => console.log('Envelope 0:', result));
```

---

## What Changed in the Code

### File: `frontend/src/utils/stellar.ts`

#### Before (Broken):
```typescript
export async function createEnvelopeTransaction(params) {
  const account = await getAccount(params.owner);
  const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
  
  const transaction = new StellarSdk.TransactionBuilder(account, {...})
    .addOperation(contract.call('create_envelope', ...))
    .build();
  
  return transaction.toXDR(); // ❌ Not simulated!
}
```

#### After (Working):
```typescript
export async function createEnvelopeTransaction(params) {
  console.log('Building create envelope transaction...');
  
  const account = await getAccount(params.owner);
  const contract = new StellarSdk.Contract(CONTRACT_ADDRESS);
  
  // Build initial transaction
  let transaction = new StellarSdk.TransactionBuilder(account, {...})
    .addOperation(contract.call('create_envelope', ...))
    .build();
  
  console.log('Simulating transaction...');
  
  // ✅ SIMULATE to get resource fees
  const simulated = await server.simulateTransaction(transaction);
  
  if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }
  
  console.log('Simulation successful, preparing transaction...');
  
  // ✅ ASSEMBLE transaction with simulation results
  const preparedTransaction = StellarSdk.SorobanRpc.assembleTransaction(
    transaction,
    simulated
  ).build();
  
  return preparedTransaction.toXDR();
}
```

**Same changes applied to**:
- `claimEnvelopeTransaction()`
- `reclaimEnvelopeTransaction()`

---

## Verification Checklist

After the fix, verify these behaviors:

### Creating Envelope
- [ ] Console shows "Simulating transaction..."
- [ ] Console shows "Simulation successful..."
- [ ] Freighter popup appears (transaction ready to sign)
- [ ] Transaction fee shown in Freighter (~0.1-0.5 XLM)
- [ ] After signing, success notification appears
- [ ] Transaction hash is visible
- [ ] Transaction appears on Stellar Explorer with SUCCESS status

### Claiming Envelope
- [ ] Same simulation steps as above
- [ ] Contract function shows as "claim" in Explorer
- [ ] Beneficiary balance increases after claim

### Reclaiming Envelope
- [ ] Same simulation steps as above
- [ ] Contract function shows as "reclaim" in Explorer
- [ ] Creator balance increases after reclaim

---

## Quick Reference: Transaction Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    USER CLICKS BUTTON                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  1. BUILD TRANSACTION                                       │
│     - Create TransactionBuilder                             │
│     - Add contract.call() operation                         │
│     - .build() to create transaction                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. SIMULATE TRANSACTION ← NEW STEP!                        │
│     - server.simulateTransaction(tx)                        │
│     - Calculate resource fees                               │
│     - Get execution footprint                               │
│     - Detect errors before submission                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  3. ASSEMBLE TRANSACTION ← NEW STEP!                        │
│     - SorobanRpc.assembleTransaction(tx, simulated)        │
│     - Add resource fees to transaction                      │
│     - Add footprint data                                    │
│     - .build() final transaction                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  4. SIGN TRANSACTION                                        │
│     - freighterApi.signTransaction(xdr)                     │
│     - User approves in Freighter popup                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  5. SUBMIT TRANSACTION                                      │
│     - server.sendTransaction(signedTx)                      │
│     - Broadcast to Stellar network                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  6. POLL FOR CONFIRMATION                                   │
│     - server.getTransaction(hash)                           │
│     - Wait for SUCCESS/FAILED status                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  7. SHOW RESULT TO USER                                     │
│     - Success notification with TX hash                     │
│     - Or error message if failed                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

**Problem**: Transactions were rejected because they lacked proper Soroban resource fees.

**Solution**: Added transaction simulation and assembly steps before signing.

**Result**: ✅ Transactions now work correctly with proper fees and footprints.

**Test**: Try creating an envelope now - it should work! 🎉

---

**Still having issues?** Check:
1. Browser console for detailed error messages
2. Freighter is on TESTNET
3. Account has sufficient XLM balance (10+ XLM)
4. Input parameters are valid
5. Times are in seconds, not milliseconds

