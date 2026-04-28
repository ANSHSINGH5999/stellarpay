#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, Symbol,
};

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum EscrowStatus {
    Pending,
    Released,
    Refunded,
}

#[contracttype]
#[derive(Clone)]
pub struct Escrow {
    pub sender: Address,
    pub receiver: Address,
    pub token: Address,
    pub amount: i128,
    pub status: EscrowStatus,
    pub created_at: u64,
    pub expiry: u64,
}

#[contracttype]
pub enum DataKey {
    Escrow(u64),
    Count,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Create a new escrow — locks funds until released or expired.
    pub fn create_escrow(
        env: Env,
        token_id: Address,
        sender: Address,
        receiver: Address,
        amount: i128,
        expiry_seconds: u64,
    ) -> u64 {
        sender.require_auth();

        assert!(amount > 0, "Amount must be positive");
        assert!(sender != receiver, "Sender and receiver must differ");
        assert!(expiry_seconds > 0, "Expiry must be in the future");

        let token_client = token::Client::new(&env, &token_id);
        let contract_address = env.current_contract_address();

        // Lock funds in the contract
        token_client.transfer(&sender, &contract_address, &amount);

        let now = env.ledger().timestamp();
        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0);
        let id = count + 1;

        let escrow = Escrow {
            sender: sender.clone(),
            receiver: receiver.clone(),
            token: token_id,
            amount,
            status: EscrowStatus::Pending,
            created_at: now,
            expiry: now + expiry_seconds,
        };

        env.storage().instance().set(&DataKey::Escrow(id), &escrow);
        env.storage().instance().set(&DataKey::Count, &id);

        env.events().publish(
            (Symbol::new(&env, "escrow_created"), sender),
            (id, receiver, amount),
        );

        id
    }

    /// Release escrowed funds to the receiver (sender authorizes).
    pub fn release(env: Env, escrow_id: u64) {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .expect("Escrow not found");

        escrow.sender.require_auth();
        assert!(
            escrow.status == EscrowStatus::Pending,
            "Escrow already settled"
        );

        let token_client = token::Client::new(&env, &escrow.token);
        let contract_address = env.current_contract_address();

        token_client.transfer(&contract_address, &escrow.receiver, &escrow.amount);

        escrow.status = EscrowStatus::Released;
        env.storage()
            .instance()
            .set(&DataKey::Escrow(escrow_id), &escrow);

        env.events().publish(
            (Symbol::new(&env, "escrow_released"), escrow.sender),
            (escrow_id, escrow.receiver, escrow.amount),
        );
    }

    /// Refund escrowed funds to sender after expiry.
    pub fn refund(env: Env, escrow_id: u64) {
        let mut escrow: Escrow = env
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .expect("Escrow not found");

        assert!(
            escrow.status == EscrowStatus::Pending,
            "Escrow already settled"
        );

        let now = env.ledger().timestamp();
        assert!(now >= escrow.expiry, "Escrow has not expired yet");

        let token_client = token::Client::new(&env, &escrow.token);
        let contract_address = env.current_contract_address();

        token_client.transfer(&contract_address, &escrow.sender, &escrow.amount);

        escrow.status = EscrowStatus::Refunded;
        env.storage()
            .instance()
            .set(&DataKey::Escrow(escrow_id), &escrow);

        env.events().publish(
            (Symbol::new(&env, "escrow_refunded"), escrow.sender.clone()),
            (escrow_id, escrow.amount),
        );
    }

    /// Get escrow details by ID.
    pub fn get_escrow(env: Env, escrow_id: u64) -> Escrow {
        env.storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .expect("Escrow not found")
    }

    /// Get total escrow count.
    pub fn escrow_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::Count).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, Ledger},
        token::{Client as TokenClient, StellarAssetClient},
        Env,
    };

    fn create_token<'a>(
        env: &Env,
        admin: &Address,
    ) -> (TokenClient<'a>, StellarAssetClient<'a>) {
        let addr = env.register_stellar_asset_contract(admin.clone());
        (
            TokenClient::new(env, &addr),
            StellarAssetClient::new(env, &addr),
        )
    }

    #[test]
    fn test_create_and_release_escrow() {
        let env = Env::default();
        env.mock_all_auths();

        env.ledger().with_mut(|li| {
            li.timestamp = 1_000_000;
        });

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let receiver = Address::generate(&env);

        let (token, token_admin) = create_token(&env, &admin);
        token_admin.mint(&sender, &500_000);

        let contract_id = env.register_contract(None, EscrowContract);
        let client = EscrowContractClient::new(&env, &contract_id);

        let id = client.create_escrow(
            &token.address,
            &sender,
            &receiver,
            &100_000,
            &86_400, // 24 hours
        );

        assert_eq!(id, 1);
        assert_eq!(token.balance(&sender), 400_000);
        assert_eq!(token.balance(&contract_id), 100_000);

        client.release(&id);

        assert_eq!(token.balance(&receiver), 100_000);
        assert_eq!(token.balance(&contract_id), 0);

        let escrow = client.get_escrow(&id);
        assert_eq!(escrow.status, EscrowStatus::Released);
    }

    #[test]
    fn test_refund_after_expiry() {
        let env = Env::default();
        env.mock_all_auths();

        env.ledger().with_mut(|li| {
            li.timestamp = 1_000_000;
        });

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let receiver = Address::generate(&env);

        let (token, token_admin) = create_token(&env, &admin);
        token_admin.mint(&sender, &500_000);

        let contract_id = env.register_contract(None, EscrowContract);
        let client = EscrowContractClient::new(&env, &contract_id);

        let id = client.create_escrow(
            &token.address,
            &sender,
            &receiver,
            &100_000,
            &3_600, // 1 hour
        );

        // Fast-forward past expiry
        env.ledger().with_mut(|li| {
            li.timestamp = 1_000_000 + 3_601;
        });

        client.refund(&id);

        assert_eq!(token.balance(&sender), 500_000);
        assert_eq!(token.balance(&contract_id), 0);

        let escrow = client.get_escrow(&id);
        assert_eq!(escrow.status, EscrowStatus::Refunded);
    }
}
