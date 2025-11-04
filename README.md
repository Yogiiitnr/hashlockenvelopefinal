# 📨 Hash-Locked Envelopes

A secure blockchain-based inheritance and time-locked transfer system built on the **Stellar blockchain** using **Soroban smart contracts**. Lock XLM tokens with a secret phrase, set unlock and expiry times, and enable beneficiaries to claim funds securely.

## 🌟 Features

### Core Functionality
- **Create Envelope**: Lock XLM tokens in a smart contract with:
  - Beneficiary address who can claim
  - SHA-256 hashed secret phrase
  - Unlock time when claiming becomes available
  - Expiry time when creator can reclaim
  
- **Claim Envelope**: Beneficiary can claim by:
  - Providing the correct secret phrase
  - Waiting until unlock time
  - Claiming before expiry time
  - Automatic fund transfer on successful claim

- **Reclaim Expired**: Creator can:
  - Reclaim funds if envelope expires unclaimed
  - Protect funds from being locked forever

## 🛠️ Technology Stack

### Backend (Smart Contract)
- **Language**: Rust
- **Framework**: Soroban SDK v21.7.12
- **Blockchain**: Stellar Testnet
- **Features**: 
  - Persistent storage
  - Time-based validations
  - SHA-256 secret verification
  - Authorization checks

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Glassmorphism effects
- **Wallet**: Freighter Wallet integration
- **Cryptography**: Web Crypto API for SHA-256

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │  Freighter   │  │    Crypto    │     │
│  │  Components  │──│    Wallet    │──│    Utils     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Stellar SDK
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Stellar Testnet                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Soroban Smart Contract (Rust)                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │  Create    │  │   Claim    │  │  Reclaim   │    │  │
│  │  │  Envelope  │  │  Envelope  │  │  Envelope  │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  │                                                      │  │
│  │        Storage: Envelopes + Counter                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Smart Contract Functions

### `create_envelope`
Creates a new envelope with locked funds.

**Parameters:**
- `owner: Address` - Creator of the envelope
- `beneficiary: Address` - Who can claim the funds
- `amount: i128` - Amount in stroops
- `secret_hash: BytesN<32>` - SHA-256 hash of secret
- `unlock_time: u64` - Unix timestamp for unlock
- `expiry_time: u64` - Unix timestamp for expiry

**Returns:** `u64` - Envelope ID

### `claim`
Claim an envelope with the secret.

**Parameters:**
- `envelope_id: u64` - ID of envelope
- `secret: BytesN<32>` - Secret phrase bytes

**Returns:** `Result<(), Error>`

### `reclaim`
Reclaim an expired unclaimed envelope.

**Parameters:**
- `envelope_id: u64` - ID of envelope

**Returns:** `Result<(), Error>`

### `get_envelope`
Retrieve envelope details.

**Parameters:**
- `envelope_id: u64` - ID of envelope

**Returns:** `Option<Envelope>`

## 🚀 Setup Instructions

### Prerequisites
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Stellar CLI
cargo install --locked stellar-cli --features opt

# Install Node.js (v18 or higher)
# Download from https://nodejs.org

# Verify installations
rustc --version
stellar --version
node --version
```

### 1. Clone Repository
```bash
git clone https://github.com/Yogiiitnr/hash-locked-envelopes.git
cd hash-locked-envelopes
```

### 2. Build Smart Contract
```bash
cd contracts/hash_locked_envelopes
stellar contract build
```

### 3. Deploy to Stellar Testnet

```bash
# Add Testnet network
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# Generate and fund deployer account
stellar keys generate deployer --network testnet --fund

# Deploy contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/hash_locked_envelopes.wasm \
  --network testnet \
  --source deployer
```

**Save the contract address** from the output!

### 4. Setup Frontend

```bash
cd ../../frontend

# Install dependencies
npm install

# Update contract address
# Edit src/utils/contract.ts and replace YOUR_CONTRACT_ADDRESS_HERE with your deployed contract address

# Start development server
npm run dev
```

### 5. Install Freighter Wallet

1. Visit [freighter.app](https://freighter.app)
2. Install browser extension
3. Create or import wallet
4. **Switch to TESTNET**
5. Fund account: https://laboratory.stellar.org/#account-creator?network=test

## 📖 Usage Guide

### Creating an Envelope

1. **Connect Wallet**: Click "Connect Wallet" and approve in Freighter
2. **Fill Form**:
   - Enter beneficiary's Stellar address (starts with G)
   - Enter amount in XLM
   - Set a secret phrase (min 8 characters)
   - Choose unlock date/time (when beneficiary can claim)
   - Choose expiry date/time (when you can reclaim if unclaimed)
3. **Submit**: Click "Create Envelope"
4. **Sign**: Approve transaction in Freighter
5. **Confirm**: Wait for blockchain confirmation

### Claiming an Envelope

1. Connect as beneficiary
2. Find your envelope in the list
3. Enter the secret phrase
4. Click "Claim"
5. Sign transaction in Freighter

### Reclaiming Expired Envelope

1. Connect as creator
2. Find expired unclaimed envelope
3. Click "Reclaim"
4. Sign transaction in Freighter

## 🔧 Development

### Run Tests (Contract)
```bash
cd contracts/hash_locked_envelopes
cargo test
```

### Build for Production (Frontend)
```bash
cd frontend
npm run build
```

### Lint Frontend
```bash
npm run lint
```

## 📝 Contract Address

**Testnet Contract**: `CC56K3NLC3LBFI62NKHTTFWODIFVNFHBNP3EFGDWEWVLPW5XGEUDM52G`

View on Stellar Explorer:
https://stellar.expert/explorer/testnet/contract/CC56K3NLC3LBFI62NKHTTFWODIFVNFHBNP3EFGDWEWVLPW5XGEUDM52G

## 🖼️ Screenshots

- **Landing Page**: Beautiful glassmorphism design with animated gradient background
- **Create Form**: Intuitive form with date/time pickers and validation
- **Envelope List**: Cards showing all created envelopes with status
- **Claim Interface**: Simple secret input for beneficiaries
- **Notifications**: Real-time feedback for all actions

## 🔐 Security Features

- **SHA-256 Hashing**: Secrets are never stored, only their hashes
- **Time Locks**: Enforce temporal constraints on claims
- **Authorization**: Only authorized parties can perform actions
- **Expiry Protection**: Funds can be reclaimed if unclaimed
- **Persistent Storage**: All data survives contract updates

## 🐛 Known Limitations

- **Testnet Only**: Currently deployed on Testnet for testing
- **No Actual Fund Transfer**: Transaction submission not yet implemented
- **Single Network**: Only supports Stellar Testnet
- **Browser Extension Required**: Needs Freighter wallet installed

## 📄 License

MIT License - feel free to use for learning and projects!

## 🤝 Contributing

Contributions welcome! Please open issues and PRs on GitHub.

## 📧 Contact

- **Developer**: Yogiiitnr
- **Repository**: https://github.com/Yogiiitnr/hash-locked-envelopes
- **Issues**: https://github.com/Yogiiitnr/hash-locked-envelopes/issues

---

**Built with ❤️ on Stellar Blockchain**
