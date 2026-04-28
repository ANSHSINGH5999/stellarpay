#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, String, Symbol,
};

#[contracttype]
#[derive(Clone)]
pub struct PaymentRecord {
    pub sender: Address,
    pub receiver: Address,
    pub amount: i128,
    pub memo: String,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Payment(u64),
    Count,
    PlatformFee,
    FeeRecipient,
    Owner,
}

pub const PLATFORM_FEE_BPS: i128 = 20; // 0.20% in basis points

#[contract]
pub struct PaymentContract;

#[contractimpl]
impl PaymentContract {
    /// Initialize the contract with an owner and fee recipient address.
    pub fn initialize(env: Env, owner: Address, fee_recipient: Address) {
        owner.require_auth();
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage().instance().set(&DataKey::FeeRecipient, &fee_recipient);
        env.storage().instance().set(&DataKey::PlatformFee, &PLATFORM_FEE_BPS);
        env.storage().instance().set(&DataKey::Count, &0u64);
    }

    /// Send a payment from sender to receiver via the contract.
    /// A platform fee (0.20%) is deducted and sent to the fee recipient.
    pub fn send_payment(
        env: Env,
        token_id: Address,
        sender: Address,
        receiver: Address,
        amount: i128,
        memo: String,
    ) -> u64 {
        sender.require_auth();

        assert!(amount > 0, "Amount must be positive");
        assert!(sender != receiver, "Cannot send to self");

        let fee_bps: i128 = env
            .storage()
            .instance()
            .get(&DataKey::PlatformFee)
            .unwrap_or(PLATFORM_FEE_BPS);

        let fee_recipient: Address = env
            .storage()
            .instance()
            .get(&DataKey::FeeRecipient)
            .unwrap();

        let platform_fee = (amount * fee_bps) / 10_000;
        let net_amount = amount - platform_fee;

        let token_client = token::Client::new(&env, &token_id);

        // Transfer net amount to receiver
        token_client.transfer(&sender, &receiver, &net_amount);

        // Transfer platform fee to fee recipient
        if platform_fee > 0 {
            token_client.transfer(&sender, &fee_recipient, &platform_fee);
        }

        // Record the payment
        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0);
        let new_count = count + 1;

        let record = PaymentRecord {
            sender: sender.clone(),
            receiver: receiver.clone(),
            amount,
            memo,
            timestamp: env.ledger().timestamp(),
        };

        env.storage()
            .instance()
            .set(&DataKey::Payment(new_count), &record);
        env.storage()
            .instance()
            .set(&DataKey::Count, &new_count);

        env.events().publish(
            (Symbol::new(&env, "payment"), sender),
            (receiver, amount, net_amount, platform_fee),
        );

        new_count
    }

    /// Get a payment record by its ID.
    pub fn get_payment(env: Env, id: u64) -> PaymentRecord {
        env.storage()
            .instance()
            .get(&DataKey::Payment(id))
            .expect("Payment not found")
    }

    /// Get the total number of payments processed.
    pub fn payment_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::Count).unwrap_or(0)
    }

    /// Get the current platform fee in basis points.
    pub fn get_fee_bps(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::PlatformFee)
            .unwrap_or(PLATFORM_FEE_BPS)
    }

    /// Update the platform fee (owner only).
    pub fn set_fee_bps(env: Env, new_fee_bps: i128) {
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner)
            .expect("Not initialized");
        owner.require_auth();
        assert!(new_fee_bps <= 500, "Fee cannot exceed 5%");
        env.storage()
            .instance()
            .set(&DataKey::PlatformFee, &new_fee_bps);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, Ledger},
        token::{Client as TokenClient, StellarAssetClient},
        Env, String,
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
    fn test_send_payment() {
        let env = Env::default();
        env.mock_all_auths();

        env.ledger().with_mut(|li| {
            li.timestamp = 1_000_000;
        });

        let owner = Address::generate(&env);
        let fee_recipient = Address::generate(&env);
        let sender = Address::generate(&env);
        let receiver = Address::generate(&env);

        let (token, token_admin) = create_token(&env, &owner);
        token_admin.mint(&sender, &1_000_000);

        let contract_id = env.register_contract(None, PaymentContract);
        let client = PaymentContractClient::new(&env, &contract_id);

        client.initialize(&owner, &fee_recipient);

        let payment_id = client.send_payment(
            &token.address,
            &sender,
            &receiver,
            &100_000,
            &String::from_str(&env, "Test payment"),
        );

        assert_eq!(payment_id, 1);

        // 0.20% of 100_000 = 200
        assert_eq!(token.balance(&receiver), 99_800);
        assert_eq!(token.balance(&fee_recipient), 200);

        let record = client.get_payment(&1);
        assert_eq!(record.amount, 100_000);
        assert_eq!(record.sender, sender);
        assert_eq!(record.receiver, receiver);
    }

    #[test]
    fn test_payment_count() {
        let env = Env::default();
        env.mock_all_auths();

        let owner = Address::generate(&env);
        let fee_recipient = Address::generate(&env);
        let sender = Address::generate(&env);
        let receiver = Address::generate(&env);

        let (token, token_admin) = create_token(&env, &owner);
        token_admin.mint(&sender, &10_000_000);

        let contract_id = env.register_contract(None, PaymentContract);
        let client = PaymentContractClient::new(&env, &contract_id);

        client.initialize(&owner, &fee_recipient);

        client.send_payment(
            &token.address,
            &sender,
            &receiver,
            &100_000,
            &String::from_str(&env, "Payment 1"),
        );
        client.send_payment(
            &token.address,
            &sender,
            &receiver,
            &200_000,
            &String::from_str(&env, "Payment 2"),
        );

        assert_eq!(client.payment_count(), 2);
    }
}
