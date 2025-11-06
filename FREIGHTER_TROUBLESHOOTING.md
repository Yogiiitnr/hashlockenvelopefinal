# 🔧 Freighter Wallet Troubleshooting Guide

## The Problem We Fixed

**Original Issue**: The DApp couldn't detect the Freighter wallet extension, showing "Freighter detected: false" even when the extension was installed.

**Root Cause**: The app was trying to access `window.freighterApi` directly, which is not the correct way to interact with the modern Freighter API.

**Solution**: Installed and used the official `@stellar/freighter-api` package, which provides proper methods to interact with the Freighter extension.

---

## How to Verify Freighter is Working

### Step 1: Check Extension Installation
1. Look for the Freighter icon in your browser toolbar (usually top-right)
2. The icon should be a blue/purple diamond shape
3. Click it to ensure it opens (may need to unlock with password)

### Step 2: Verify Network Setting
1. Open Freighter extension
2. Click the network dropdown (top of popup)
3. Ensure **TESTNET** is selected (not MAINNET or FUTURENET)
4. If wrong network, select TESTNET and confirm

### Step 3: Test in Browser Console
Open browser DevTools (F12) and run:

```javascript
// Test if Freighter API is available
import('@stellar/freighter-api').then(api => {
  api.isConnected().then(result => {
    console.log('Freighter connected:', result);
  });
});
```

Expected output: `Freighter connected: { isConnected: false }` or `{ isConnected: true }`

If you get an error, Freighter may not be properly installed.

---

## Common Freighter Issues & Fixes

### Issue 1: "Freighter wallet is not installed"

**Symptoms**:
- Extension is installed but app says it's not
- Page keeps showing "Install Freighter Wallet"

**Solutions**:
1. **Hard refresh the page**: Press Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. **Clear cache**:
   - Chrome: Settings > Privacy > Clear browsing data
   - Select "Cached images and files"
   - Click "Clear data"
3. **Disable/Re-enable extension**:
   - Go to browser extensions page (chrome://extensions)
   - Toggle Freighter off, then on
   - Refresh your app page
4. **Reinstall Freighter**:
   - Remove extension completely
   - Visit https://freighter.app
   - Install fresh copy
   - Import your account (have seed phrase ready!)

### Issue 2: "Please switch Freighter to TESTNET network"

**Symptoms**:
- Can't proceed after connecting
- Red error message about network

**Solutions**:
1. Click Freighter icon in browser
2. Look for network selector at top
3. Click it and select "TESTNET"
4. If TESTNET not visible:
   - Click "Manage networks"
   - Ensure TESTNET is enabled
   - Select it
5. Refresh the app page
6. Try connecting again

### Issue 3: Popup doesn't appear when signing

**Symptoms**:
- Click "Create Envelope" or "Claim"
- Nothing happens, no Freighter popup

**Solutions**:
1. **Check popup blocker**:
   - Look for blocked popup icon in address bar
   - Click and allow popups for localhost
2. **Freighter is locked**:
   - Click Freighter icon
   - Enter your password
   - Try the action again
3. **Extension crashed**:
   - Go to chrome://extensions
   - Click "Reload" on Freighter
   - Try again
4. **Browser issue**:
   - Try a different browser (Chrome, Brave, Edge)
   - Freighter works best in Chromium-based browsers

### Issue 4: "User declined access"

**Symptoms**:
- Clicked "Connect Wallet"
- Immediately got error

**Solutions**:
1. This means you clicked "Reject" in Freighter
2. Click "Connect Wallet" again
3. This time, click "Approve" in Freighter popup
4. If you want to reset permissions:
   - Open Freighter
   - Go to Settings > Connected Sites
   - Remove localhost if listed
   - Connect again

### Issue 5: Transaction fails silently

**Symptoms**:
- Approved transaction in Freighter
- No success or error message
- Loading state never ends

**Solutions**:
1. **Check browser console** (F12 > Console tab):
   - Look for red error messages
   - Common errors:
     - "Insufficient balance" → Fund account with Friendbot
     - "Transaction failed" → Check time constraints
     - "Invalid secret" → Verify secret phrase
2. **Network issues**:
   - Check internet connection
   - Testnet might be slow, wait 30 seconds
   - Try again if timeout
3. **Contract issues**:
   - Verify contract address is correct in contract.ts
   - Check contract is deployed on TESTNET

### Issue 6: Wrong account connected

**Symptoms**:
- App shows different address than expected
- Can't access your envelopes

**Solutions**:
1. Open Freighter
2. Click account name at top
3. Select correct account from list
4. Refresh app page
5. Connect wallet again

---

## Debugging Tools

### Check Current State

Open browser console and paste:

```javascript
// Check wallet connection status
const checkWallet = async () => {
  const { isConnected, getAddress, getNetwork } = await import('@stellar/freighter-api');
  
  console.log('=== Freighter Status ===');
  
  const connResult = await isConnected();
  console.log('Connected:', connResult);
  
  if (connResult.isConnected) {
    const addrResult = await getAddress();
    console.log('Address:', addrResult);
    
    const netResult = await getNetwork();
    console.log('Network:', netResult);
  }
};

checkWallet();
```

Expected output for properly connected wallet:
```
=== Freighter Status ===
Connected: { isConnected: true }
Address: { address: 'G...' }
Network: { network: 'TESTNET', networkPassphrase: 'Test SDF Network ; September 2015' }
```

### Monitor Freighter API Calls

```javascript
// Log all Freighter interactions
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0]?.includes('freighter')) {
    console.log('Freighter API call:', args);
  }
  return originalFetch.apply(this, args);
};
```

---

## Best Practices

### Before Each Development Session
1. ✅ Unlock Freighter
2. ✅ Switch to TESTNET
3. ✅ Check account has XLM balance
4. ✅ Clear browser cache if issues
5. ✅ Start dev server fresh

### During Development
1. ✅ Keep Freighter popup visible
2. ✅ Monitor browser console for errors
3. ✅ Test on single account first
4. ✅ Use descriptive secret phrases
5. ✅ Save envelope IDs for testing

### When Things Break
1. ✅ Check console logs first
2. ✅ Verify network (TESTNET!)
3. ✅ Refresh page
4. ✅ Restart dev server
5. ✅ Last resort: restart browser

---

## Technical Details

### How Freighter Detection Works

**Old Method (Broken)**:
```typescript
// ❌ Don't do this
if (window.freighterApi) {
  // This doesn't work reliably
}
```

**New Method (Working)**:
```typescript
// ✅ Do this
import * as freighterApi from '@stellar/freighter-api';

const result = await freighterApi.isConnected();
if (!result.error) {
  // Freighter is installed
}
```

### Why This Works Better

1. **Package-based**: Uses official npm package, not global variables
2. **Error handling**: Returns structured error objects
3. **Type safety**: Full TypeScript support
4. **Reliable**: Maintained by Stellar team
5. **Async/await**: Modern promise-based API

### API Methods Used

```typescript
// Check if connected
await freighterApi.isConnected()
// Returns: { isConnected: boolean } | { error: FreighterApiError }

// Request connection
await freighterApi.requestAccess()
// Returns: { address: string } | { error: FreighterApiError }

// Get current address
await freighterApi.getAddress()
// Returns: { address: string } | { error: FreighterApiError }

// Get network
await freighterApi.getNetwork()
// Returns: { network: string, networkPassphrase: string } | { error: FreighterApiError }

// Sign transaction
await freighterApi.signTransaction(xdr, { networkPassphrase })
// Returns: { signedTxXdr: string, signerAddress: string } | { error: FreighterApiError }
```

---

## Browser Compatibility

### Recommended Browsers
- ✅ Chrome 90+
- ✅ Brave 1.30+
- ✅ Edge 90+
- ✅ Opera 76+

### Not Supported
- ❌ Firefox (Freighter doesn't support Firefox)
- ❌ Safari (No extension support)
- ❌ Mobile browsers (Use Stellar mobile wallets instead)

---

## Environment Setup Checklist

Before claiming "Freighter not working":

- [ ] Freighter extension installed?
- [ ] Extension enabled in browser?
- [ ] Extension unlocked (password entered)?
- [ ] Network set to TESTNET?
- [ ] Account has XLM balance?
- [ ] Browser is Chromium-based?
- [ ] Page loaded over HTTP/HTTPS (not file://)?
- [ ] npm install completed successfully?
- [ ] @stellar/freighter-api package installed?
- [ ] Dev server running (npm run dev)?
- [ ] No browser console errors?
- [ ] Popup blocker disabled for localhost?

If all checked and still issues, report bug with:
- Browser version
- Freighter version
- Console logs
- Screenshots

---

## Getting Help

### Resources
1. **Freighter Docs**: https://docs.freighter.app/
2. **Stellar Discord**: https://discord.gg/stellar
3. **GitHub Issues**: https://github.com/stellar/freighter/issues

### Include in Bug Reports
```
Browser: Chrome 120.0.6099.129
Freighter Version: 5.0.2
OS: macOS 14.1
Node Version: 18.17.0
npm Version: 9.6.7

Error Message:
[paste exact error]

Console Log:
[paste console output]

Steps to Reproduce:
1. [step 1]
2. [step 2]
```

---

## Success! ✨

You've successfully fixed Freighter integration if:
- ✅ App detects Freighter immediately
- ✅ "Connect Wallet" button works
- ✅ Public key displays after connection
- ✅ Transactions sign successfully
- ✅ No console errors about Freighter

**Your DApp is now fully functional!** 🎉

