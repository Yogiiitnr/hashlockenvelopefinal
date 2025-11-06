# 🧪 Testing Guide for Hash-Locked Envelopes DApp

## Prerequisites

Before testing, ensure you have:
- ✅ Freighter Wallet installed in your browser
- ✅ Freighter configured for **TESTNET** (very important!)
- ✅ At least 2 test accounts with XLM on Testnet
- ✅ Development server running (`npm run dev` in frontend folder)

## Setting Up Test Accounts

### Account 1: Creator (Owner)
1. Open Freighter extension
2. Create or import an account
3. Switch to TESTNET network
4. Fund with Friendbot:
   - Visit: https://laboratory.stellar.org/#account-creator?network=test
   - Paste your public key
   - Click "Get test network lumens"
   - Wait for confirmation (should receive 10,000 XLM)

### Account 2: Beneficiary
1. Create a second account in Freighter (or use a different browser/profile)
2. Switch to TESTNET
3. Fund with Friendbot (same process as above)

**Important**: Save both public keys (addresses) - you'll need them!

## Test Case 1: Create an Envelope

### Objective
Successfully create a time-locked envelope on the blockchain.

### Steps
1. Open http://localhost:5173 in your browser
2. Click "Connect Wallet" button
3. Approve connection in Freighter popup
4. Verify your public key displays (first 4 and last 4 characters)
5. Click on "📨 Create Envelope" tab (should be active by default)
6. Fill in the form:
   - **Beneficiary Address**: Paste Account 2's public key (56 chars, starts with G)
   - **Amount**: Enter `10` (or any amount ≤ your balance)
   - **Secret Phrase**: Enter `MyTestSecret123` (at least 8 characters)
   - **Unlock Date**: Set to current date
   - **Unlock Time**: Set to 1 minute from now
   - **Expiry Date**: Set to current date
   - **Expiry Time**: Set to 10 minutes from now
7. Click "Create Envelope"
8. Review transaction in Freighter popup
9. Click "Approve" in Freighter

### Expected Results
- ✅ Form validates successfully
- ✅ Freighter popup appears with transaction details
- ✅ After approval, "Submitting transaction..." appears
- ✅ Green success notification: "Envelope created successfully! 🎉 TX: [hash]..."
- ✅ Form clears after success
- ✅ Check browser console - should see transaction hash

### Troubleshooting
- **"Invalid beneficiary address"**: Make sure it's exactly 56 characters and starts with G
- **"Freighter not detected"**: Refresh page, ensure extension is unlocked
- **"Please switch to TESTNET"**: Open Freighter, click network dropdown, select TESTNET
- **Transaction fails**: Check you have enough XLM balance (need amount + fees)

---

## Test Case 2: Claim an Envelope

### Objective
Beneficiary successfully claims the envelope using the correct secret.

### Preparation
- Wait for the unlock time to pass (1 minute in our example)
- Note the envelope ID from Test Case 1 (if you didn't save it, it's likely ID: 0 for first envelope)

### Steps
1. **Switch to beneficiary account**:
   - Click "Disconnect" in the app
   - In Freighter, switch to Account 2 (beneficiary)
   - Click "Connect Wallet" in the app
   - Verify beneficiary's public key is shown
2. Click "🎁 Claim Envelope" tab
3. Fill in the form:
   - **Envelope ID**: Enter `0` (or the ID from creation)
   - **Secret Phrase**: Enter `MyTestSecret123` (exact same as creation)
4. Click "Claim Envelope"
5. Approve transaction in Freighter

### Expected Results
- ✅ Freighter popup shows claim transaction
- ✅ Green success notification: "Envelope claimed! 🎉 TX: [hash]..."
- ✅ Beneficiary's balance increases by the envelope amount
- ✅ Form clears after success

### Testing Failure Cases

#### Wrong Secret
1. Enter envelope ID: `0`
2. Enter wrong secret: `WrongSecret456`
3. Click "Claim Envelope"
4. **Expected**: Transaction fails with error (secret hash mismatch)

#### Claiming Before Unlock Time
1. Create a new envelope with unlock time 1 hour in future
2. Try to claim immediately
3. **Expected**: Transaction fails (too early)

#### Claiming After Expiry
1. Wait for expiry time to pass
2. Try to claim
3. **Expected**: Transaction fails (expired)

---

## Test Case 3: Reclaim an Expired Envelope

### Objective
Creator reclaims funds from an unclaimed, expired envelope.

### Preparation
- Create an envelope with very short expiry (2 minutes from now)
- DO NOT claim it as beneficiary
- Wait for expiry time to pass

### Steps
1. **Switch to creator account**:
   - Disconnect current wallet
   - Switch to Account 1 (creator) in Freighter
   - Connect wallet
2. Click "💰 Reclaim Expired" tab
3. Fill in the form:
   - **Envelope ID**: Enter the ID of expired envelope
4. Click "Reclaim Envelope"
5. Approve transaction in Freighter

### Expected Results
- ✅ Freighter shows reclaim transaction
- ✅ Green success notification: "Envelope reclaimed! 💰 TX: [hash]..."
- ✅ Creator's balance increases (minus small fee)
- ✅ Form clears after success

### Testing Failure Cases

#### Reclaiming Before Expiry
1. Create envelope with expiry 1 hour in future
2. Try to reclaim immediately
3. **Expected**: Transaction fails (not expired yet)

#### Reclaiming After Already Claimed
1. Create envelope
2. Claim it as beneficiary
3. Try to reclaim as creator
4. **Expected**: Transaction fails (already claimed)

#### Wrong Account Trying to Reclaim
1. Create envelope with Account 1
2. Try to reclaim with Account 2
3. **Expected**: Transaction fails (not owner)

---

## Test Case 4: UI/UX Testing

### Tab Navigation
1. Connect wallet
2. Click each tab: Create, Claim, Reclaim
3. **Expected**: Content changes, active tab highlighted

### Form Validation

#### Create Form
- Leave beneficiary empty → "Invalid beneficiary address"
- Enter 55 characters → "Invalid beneficiary address"
- Enter negative amount → "Amount must be greater than 0"
- Enter 7-char secret → "Secret phrase must be at least 8 characters"
- Set unlock time in past → "Unlock time must be in the future"
- Set expiry before unlock → "Expiry time must be after unlock time"

#### Claim Form
- Enter negative ID → "Please enter a valid envelope ID"
- Enter 7-char secret → "Secret phrase must be at least 8 characters"

#### Reclaim Form
- Enter negative ID → "Please enter a valid envelope ID"

### Notifications
1. Perform successful action
2. **Expected**: Green notification appears top-right
3. **Expected**: Notification auto-dismisses after 5 seconds

### Responsive Design
1. Resize browser window (mobile, tablet, desktop)
2. **Expected**: Layout adapts smoothly, no overlapping text

### Loading States
1. Submit any transaction
2. During signing/submission:
   - **Expected**: Button shows spinner and "Creating/Claiming/Reclaiming Envelope..."
   - **Expected**: Form inputs disabled
   - **Expected**: Button disabled

---

## Test Case 5: Network and Connection Tests

### Freighter Not Installed
1. Open app in browser without Freighter
2. **Expected**: "Install Freighter Wallet" button shown
3. **Expected**: Clicking opens freighter.app in new tab

### Wrong Network
1. Connect wallet
2. Switch Freighter to MAINNET or FUTURENET
3. Refresh page
4. Try to connect
5. **Expected**: Error message "Please switch Freighter to TESTNET network"

### Disconnection
1. Connect wallet
2. Click "Disconnect" button
3. **Expected**: Shows landing page
4. **Expected**: "Connect Wallet" button appears

### Account Switching in Freighter
1. Connect with Account 1
2. In Freighter, switch to Account 2
3. Refresh page
4. **Expected**: Shows Account 2's public key
5. **Expected**: All operations use Account 2

---

## Test Case 6: Transaction Verification on Blockchain

### Verifying on Stellar Expert

1. After any transaction, copy the transaction hash from success message
2. Visit: https://stellar.expert/explorer/testnet
3. Paste transaction hash in search
4. **Expected**: Transaction details displayed
5. **Expected**: Status: SUCCESS
6. **Expected**: Shows operations, fees, timestamps

### Verifying Contract State

1. Visit: https://stellar.expert/explorer/testnet/contract/CC56K3NLC3LBFI62NKHTTFWODIFVNFHBNP3EFGDWEWVLPW5XGEUDM52G
2. **Expected**: Contract page with activity
3. Click "Invocations" tab
4. **Expected**: See your create_envelope, claim, reclaim calls
5. **Expected**: Parameters and results visible

---

## Test Case 7: Edge Cases

### Maximum Values
- **Large Amount**: Try 1,000,000 XLM (may fail due to balance)
- **Far Future Date**: Set unlock time years ahead
- **Very Long Secret**: Use 100+ character secret phrase

### Minimum Values
- **Minimum Amount**: Try 0.0000001 XLM
- **Minimum Secret**: Use exactly 8 characters
- **Immediate Times**: Set unlock to current time + 10 seconds

### Special Characters in Secret
- Test with: `!@#$%^&*()_+-=[]{}|;:,.<>?`
- **Expected**: All should work (SHA-256 handles any bytes)

### Multiple Envelopes
1. Create 5 envelopes in sequence
2. **Expected**: IDs increment: 0, 1, 2, 3, 4
3. Claim each one individually
4. **Expected**: All work independently

---

## Common Issues & Solutions

### Issue: "Freighter detected: false"
**Solution**: 
- Ensure Freighter extension is installed
- Refresh the page (Ctrl+R or Cmd+R)
- Click the Freighter icon to unlock it
- Try clicking "I have Freighter" button if shown

### Issue: Transaction fails with no error
**Solution**:
- Check browser console for detailed error
- Verify account has sufficient XLM balance
- Ensure unlock/expiry times are valid
- Confirm on correct network (TESTNET)

### Issue: "Failed to fetch account"
**Solution**:
- Account not funded on Testnet
- Visit Friendbot to fund: https://laboratory.stellar.org/#account-creator?network=test

### Issue: Signature popup doesn't appear
**Solution**:
- Check if Freighter popup is blocked by browser
- Look for popup blocker icon in address bar
- Allow popups for localhost:5173

### Issue: Transaction pending forever
**Solution**:
- Wait up to 30 seconds
- Check Stellar Expert for transaction status
- Network might be slow - try again

---

## Performance Benchmarks

### Expected Timings
- **Wallet Connection**: < 2 seconds
- **Transaction Building**: < 1 second
- **Signing in Freighter**: User-dependent (5-30 seconds)
- **Network Submission**: 3-10 seconds
- **Confirmation**: 5-15 seconds

### Total Flow Time
- **Create Envelope**: ~15-30 seconds
- **Claim Envelope**: ~15-30 seconds
- **Reclaim Envelope**: ~15-30 seconds

---

## Automated Testing Script

For developers, here's a test sequence:

```bash
# In browser console:

// Test 1: Check Freighter
console.log('Freighter installed:', typeof window.freighterApi !== 'undefined');

// Test 2: Check contract address
console.log('Contract:', 'CC56K3NLC3LBFI62NKHTTFWODIFVNFHBNP3EFGDWEWVLPW5XGEUDM52G');

// Test 3: Check network
// (Run after connecting wallet)
```

---

## Reporting Issues

When reporting bugs, include:
1. Browser and version
2. Freighter version
3. Steps to reproduce
4. Expected vs actual behavior
5. Screenshots of errors
6. Browser console logs
7. Transaction hash (if available)

---

## Success Criteria

All tests pass if:
- ✅ Wallet connects successfully
- ✅ Create envelope completes with TX hash
- ✅ Beneficiary can claim with correct secret
- ✅ Creator can reclaim expired envelope
- ✅ All validations work correctly
- ✅ Transactions appear on Stellar Expert
- ✅ UI is responsive and user-friendly
- ✅ Error messages are clear and helpful

---

**Happy Testing! 🚀**

For issues or questions, check the GitHub repository:
https://github.com/Yogiiitnr/hashlockenvelope
