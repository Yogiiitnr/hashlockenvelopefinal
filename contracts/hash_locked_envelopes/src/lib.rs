#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Bytes, BytesN, Env,
};

/// Represents an envelope containing locked funds
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Envelope {
    /// Address of the creator who can reclaim after expiry
    pub owner: Address,
    /// Address of the beneficiary who can claim
    pub beneficiary: Address,
    /// Amount of XLM locked in stroops (1 XLM = 10,000,000 stroops)
    pub amount: i128,
    /// SHA-256 hash of the secret phrase
    pub secret_hash: BytesN<32>,
    /// Unix timestamp when envelope becomes claimable
    pub unlock_time: u64,
    /// Unix timestamp when envelope expires and can be reclaimed
    pub expiry_time: u64,
    /// Whether the envelope has been claimed
    pub claimed: bool,
}

/// Storage keys for the contract
#[contracttype]
pub enum DataKey {
    /// Key for storing envelope by ID
    Envelope(u64),
    /// Key for tracking next envelope ID
    NextId,
}

#[contract]
pub struct HashLockedEnvelopesContract;

#[contractimpl]
impl HashLockedEnvelopesContract {
    /// Create a new hash-locked envelope
    ///
    /// # Arguments
    /// * `env` - The contract environment
    /// * `owner` - Address of the envelope creator
    /// * `beneficiary` - Address who can claim the envelope
    /// * `amount` - Amount of XLM to lock (in stroops)
    /// * `secret_hash` - SHA-256 hash of the secret phrase
    /// * `unlock_time` - Unix timestamp when envelope becomes claimable
    /// * `expiry_time` - Unix timestamp when envelope expires
    ///
    /// # Returns
    /// * `u64` - The envelope ID
    pub fn create_envelope(
        env: Env,
        owner: Address,
        beneficiary: Address,
        amount: i128,
        secret_hash: BytesN<32>,
        unlock_time: u64,
        expiry_time: u64,
    ) -> u64 {
        // Require authorization from the owner
        owner.require_auth();

        // Get current timestamp
        let current_time = env.ledger().timestamp();

        // Validate times (panics on invalid input)
        assert!(unlock_time > current_time, "Unlock time must be in future");
        assert!(expiry_time > unlock_time, "Expiry must be after unlock");
        assert!(amount > 0, "Amount must be positive");

        // Get next envelope ID
        let next_id_key = DataKey::NextId;
        let envelope_id: u64 = env
            .storage()
            .persistent()
            .get(&next_id_key)
            .unwrap_or(0);

        // Create the envelope
        let envelope = Envelope {
            owner: owner.clone(),
            beneficiary: beneficiary.clone(),
            amount,
            secret_hash,
            unlock_time,
            expiry_time,
            claimed: false,
        };

        // Store the envelope
        let envelope_key = DataKey::Envelope(envelope_id);
        env.storage().persistent().set(&envelope_key, &envelope);

        // Increment and store next ID
        env.storage()
            .persistent()
            .set(&next_id_key, &(envelope_id + 1));

        // Extend TTL
        env.storage().persistent().extend_ttl(&envelope_key, 100_000, 100_000);
        env.storage().persistent().extend_ttl(&next_id_key, 100_000, 100_000);

        envelope_id
    }

    /// Claim an envelope by providing the correct secret
    ///
    /// # Arguments
    /// * `env` - The contract environment
    /// * `envelope_id` - ID of the envelope to claim
    /// * `secret` - The secret phrase as bytes
    pub fn claim(
        env: Env,
        envelope_id: u64,
        secret: Bytes,
    ) {
        // Get the envelope
        let envelope_key = DataKey::Envelope(envelope_id);
        let mut envelope: Envelope = env
            .storage()
            .persistent()
            .get(&envelope_key)
            .expect("Envelope not found");

        // Require authorization from beneficiary
        envelope.beneficiary.require_auth();

        // Check if already claimed
        assert!(!envelope.claimed, "Already claimed");

        // Get current timestamp
        let current_time = env.ledger().timestamp();

        // Check if unlock time has passed
        assert!(current_time >= envelope.unlock_time, "Still locked");

        // Check if envelope has NOT expired
        assert!(current_time < envelope.expiry_time, "Expired");

        // Verify secret hash matches
        let provided_hash: BytesN<32> = env.crypto().sha256(&secret).into();
        assert!(provided_hash == envelope.secret_hash, "Incorrect secret");

        // Mark as claimed
        envelope.claimed = true;
        env.storage().persistent().set(&envelope_key, &envelope);
        env.storage().persistent().extend_ttl(&envelope_key, 100_000, 100_000);
    }

    /// Reclaim an expired envelope
    ///
    /// # Arguments
    /// * `env` - The contract environment
    /// * `envelope_id` - ID of the envelope to reclaim
    pub fn reclaim(env: Env, envelope_id: u64) {
        // Get the envelope
        let envelope_key = DataKey::Envelope(envelope_id);
        let mut envelope: Envelope = env
            .storage()
            .persistent()
            .get(&envelope_key)
            .expect("Envelope not found");

        // Require authorization from owner
        envelope.owner.require_auth();

        // Check if already claimed
        assert!(!envelope.claimed, "Already claimed");

        // Get current timestamp
        let current_time = env.ledger().timestamp();

        // Check if envelope has expired
        assert!(current_time >= envelope.expiry_time, "Not expired yet");

        // Mark as claimed (reclaimed)
        envelope.claimed = true;
        env.storage().persistent().set(&envelope_key, &envelope);
        env.storage().persistent().extend_ttl(&envelope_key, 100_000, 100_000);
    }

    /// Get envelope details by ID
    ///
    /// # Arguments
    /// * `env` - The contract environment
    /// * `envelope_id` - ID of the envelope to retrieve
    ///
    /// # Returns
    /// * `Option<Envelope>` - The envelope data or None if not found
    pub fn get_envelope(env: Env, envelope_id: u64) -> Option<Envelope> {
        let envelope_key = DataKey::Envelope(envelope_id);
        env.storage().persistent().get(&envelope_key)
    }

    /// Get the next envelope ID (total count of envelopes)
    ///
    /// # Arguments
    /// * `env` - The contract environment
    ///
    /// # Returns
    /// * `u64` - The next envelope ID
    pub fn get_next_id(env: Env) -> u64 {
        let next_id_key = DataKey::NextId;
        env.storage()
            .persistent()
            .get(&next_id_key)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Bytes, Env};

    #[test]
    fn test_create_envelope() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, HashLockedEnvelopesContract);
        let client = HashLockedEnvelopesContractClient::new(&env, &contract_id);

        let owner = Address::generate(&env);
        let beneficiary = Address::generate(&env);
        let amount: i128 = 1000000;
        let secret_hash = BytesN::from_array(&env, &[0u8; 32]);
        
        let current_time = env.ledger().timestamp();
        let unlock_time = current_time + 100;
        let expiry_time = unlock_time + 1000;

        let envelope_id = client.create_envelope(
            &owner,
            &beneficiary,
            &amount,
            &secret_hash,
            &unlock_time,
            &expiry_time,
        );

        assert_eq!(envelope_id, 0);
        
        let envelope = client.get_envelope(&0);
        assert!(envelope.is_some());
    }
}
