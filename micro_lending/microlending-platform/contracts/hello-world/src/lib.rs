#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, Map, Symbol
};

#[derive(Clone)]
#[contracttype]
pub struct LoanRequest {
    pub borrower: Address,
    pub amount_requested: i128,
    pub interest_rate: u32, // in basis points (100 = 1%)
    pub duration_days: u32,
    pub purpose: Symbol,
    pub is_active: bool,
    pub amount_funded: i128,
    pub funded_at: u64,
    pub due_at: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct LenderContribution {
    pub lender: Address,
    pub amount: i128,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    LoanCounter,
    Loan(u32),
    LoanContributions(u32),
    Token,
    MinLoanAmount,
    MaxLoanAmount,
    PlatformFee, // in basis points
}

#[contract]
pub struct MicrolendingContract;

#[contractimpl]
impl MicrolendingContract {
    
    /// Initialize the contract with basic parameters
    pub fn initialize(
        env: Env,
        token: Address,
        min_loan_amount: i128,
        max_loan_amount: i128,
        platform_fee: u32, // basis points
    ) {
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::MinLoanAmount, &min_loan_amount);
        env.storage().instance().set(&DataKey::MaxLoanAmount, &max_loan_amount);
        env.storage().instance().set(&DataKey::PlatformFee, &platform_fee);
        env.storage().instance().set(&DataKey::LoanCounter, &0u32);
    }

    /// Borrower requests a loan
    pub fn request_loan(
        env: Env,
        borrower: Address,
        amount: i128,
        interest_rate: u32,
        duration_days: u32,
        purpose: Symbol,
    ) -> u32 {
        borrower.require_auth();

        let min_amount: i128 = env.storage().instance().get(&DataKey::MinLoanAmount).unwrap();
        let max_amount: i128 = env.storage().instance().get(&DataKey::MaxLoanAmount).unwrap();

        // Validate loan amount
        if amount < min_amount || amount > max_amount {
            panic!("Loan amount outside allowed range");
        }

        // Validate interest rate (between 5% and 50%)
        if interest_rate < 500 || interest_rate > 5000 {
            panic!("Interest rate must be between 5% and 50%");
        }

        // Validate duration (between 30 and 365 days)
        if duration_days < 30 || duration_days > 365 {
            panic!("Loan duration must be between 30 and 365 days");
        }

        let mut loan_counter: u32 = env.storage().instance().get(&DataKey::LoanCounter).unwrap_or(0);
        loan_counter += 1;

        let loan = LoanRequest {
            borrower: borrower.clone(),
            amount_requested: amount,
            interest_rate,
            duration_days,
            purpose,
            is_active: true,
            amount_funded: 0,
            funded_at: 0,
            due_at: 0,
        };

        env.storage().persistent().set(&DataKey::Loan(loan_counter), &loan);
        env.storage().instance().set(&DataKey::LoanCounter, &loan_counter);

        // Initialize empty contributions map
        let contributions: Map<Address, i128> = Map::new(&env);
        env.storage().persistent().set(&DataKey::LoanContributions(loan_counter), &contributions);

        loan_counter
    }

    /// Lender contributes to a loan
    pub fn contribute_to_loan(
        env: Env,
        lender: Address,
        loan_id: u32,
        contribution_amount: i128,
    ) {
        lender.require_auth();

        let mut loan: LoanRequest = env.storage().persistent()
            .get(&DataKey::Loan(loan_id))
            .unwrap_or_else(|| panic!("Loan not found"));

        if !loan.is_active {
            panic!("Loan is not active");
        }

        if contribution_amount <= 0 {
            panic!("Contribution must be positive");
        }

        // Check if contribution exceeds remaining amount needed
        let remaining_needed = loan.amount_requested - loan.amount_funded;
        let actual_contribution = if contribution_amount > remaining_needed {
            remaining_needed
        } else {
            contribution_amount
        };

        // Transfer tokens from lender to contract
        let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&lender, &env.current_contract_address(), &actual_contribution);

        // Update contributions
        let mut contributions: Map<Address, i128> = env.storage().persistent()
            .get(&DataKey::LoanContributions(loan_id))
            .unwrap_or_else(|| Map::new(&env));

        let existing_contribution = contributions.get(lender.clone()).unwrap_or(0);
        contributions.set(lender.clone(), existing_contribution + actual_contribution);

        // Update loan
        loan.amount_funded += actual_contribution;

        // Check if loan is fully funded
        if loan.amount_funded >= loan.amount_requested {
            // Loan is fully funded - transfer to borrower
            let platform_fee_rate: u32 = env.storage().instance().get(&DataKey::PlatformFee).unwrap_or(0);
            let platform_fee = (loan.amount_requested * platform_fee_rate as i128) / 10000;
            let amount_to_borrower = loan.amount_requested - platform_fee;

            token_client.transfer(&env.current_contract_address(), &loan.borrower, &amount_to_borrower);

            // Set loan timing
            loan.funded_at = env.ledger().timestamp();
            loan.due_at = loan.funded_at + (loan.duration_days as u64 * 24 * 60 * 60);
        }

        // Save updated data
        env.storage().persistent().set(&DataKey::Loan(loan_id), &loan);
        env.storage().persistent().set(&DataKey::LoanContributions(loan_id), &contributions);
    }

    /// Borrower repays the loan
    pub fn repay_loan(env: Env, borrower: Address, loan_id: u32) {
        borrower.require_auth();

        let mut loan: LoanRequest = env.storage().persistent()
            .get(&DataKey::Loan(loan_id))
            .unwrap_or_else(|| panic!("Loan not found"));

        if loan.borrower != borrower {
            panic!("Only borrower can repay");
        }

        if loan.amount_funded < loan.amount_requested {
            panic!("Loan was not fully funded");
        }

        if !loan.is_active {
            panic!("Loan is not active");
        }

        // Calculate total repayment amount
        let interest_amount = (loan.amount_requested * loan.interest_rate as i128) / 10000;
        let total_repayment = loan.amount_requested + interest_amount;

        // Transfer repayment from borrower to contract
        let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&borrower, &env.current_contract_address(), &total_repayment);

        // Distribute to lenders proportionally
        let contributions: Map<Address, i128> = env.storage().persistent()
            .get(&DataKey::LoanContributions(loan_id))
            .unwrap();

        for (lender, contribution) in contributions.iter() {
            let lender_share = (total_repayment * contribution) / loan.amount_requested;
            token_client.transfer(&env.current_contract_address(), &lender, &lender_share);
        }

        // Mark loan as inactive
        loan.is_active = false;
        env.storage().persistent().set(&DataKey::Loan(loan_id), &loan);
    }

    /// Get loan details
    pub fn get_loan(env: Env, loan_id: u32) -> LoanRequest {
        env.storage().persistent()
            .get(&DataKey::Loan(loan_id))
            .unwrap_or_else(|| panic!("Loan not found"))
    }

    /// Get loan contributions
    pub fn get_loan_contributions(env: Env, loan_id: u32) -> Map<Address, i128> {
        env.storage().persistent()
            .get(&DataKey::LoanContributions(loan_id))
            .unwrap_or_else(|| Map::new(&env))
    }

    /// Get total number of loans
    pub fn get_loan_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::LoanCounter).unwrap_or(0)
    }

    /// Check if loan requirements are met (fully funded)
    pub fn is_loan_funded(env: Env, loan_id: u32) -> bool {
        let loan: LoanRequest = env.storage().persistent()
            .get(&DataKey::Loan(loan_id))
            .unwrap_or_else(|| panic!("Loan not found"));
        
        loan.amount_funded >= loan.amount_requested
    }

    /// Get remaining amount needed for a loan
    pub fn get_remaining_amount(env: Env, loan_id: u32) -> i128 {
        let loan: LoanRequest = env.storage().persistent()
            .get(&DataKey::Loan(loan_id))
            .unwrap_or_else(|| panic!("Loan not found"));
        
        if loan.amount_funded >= loan.amount_requested {
            0
        } else {
            loan.amount_requested - loan.amount_funded
        }
    }
}