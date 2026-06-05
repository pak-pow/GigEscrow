#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};
use soroban_sdk::token::{Client as TokenClient, StellarAssetClient};

#[test]
fn test_full_milestone_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let client_addr = Address::generate(&env);
    let freelancer_addr = Address::generate(&env);
    let admin = Address::generate(&env);

    // Deploy USDC token
    let usdc_id = env.register_stellar_asset_contract_v2(admin.clone());
    let usdc = TokenClient::new(&env, &usdc_id.address());
    let usdc_admin = StellarAssetClient::new(&env, &usdc_id.address());

    // Mint 300 USDC to client (3 milestones × 100 USDC each)
    usdc_admin.mint(&client_addr, &300);

    // Deploy GigEscrow contract
    let contract_id = env.register(GigEscrowContract, ());
    let escrow = GigEscrowContractClient::new(&env, &contract_id);

    // Client creates job (300 USDC, 3 milestones)
    let job_id = escrow.create_job(
        &client_addr,
        &freelancer_addr,
        &usdc_id.address(),
        &300,
        &3,
    );
    assert_eq!(job_id, 1);
    assert_eq!(usdc.balance(&contract_id), 300); // funds locked
    assert_eq!(usdc.balance(&client_addr), 0);

    // ── Milestone 1 ──────────────────────────────────────────────────────────
    escrow.submit_milestone(&job_id, &freelancer_addr);
    let job = escrow.get_job(&job_id);
    assert_eq!(job.milestones_submitted, 1);
    assert_eq!(job.milestones_approved, 0);

    escrow.approve_milestone(&job_id, &client_addr);
    assert_eq!(usdc.balance(&freelancer_addr), 100); // 1st payment released

    // ── Milestone 2 ──────────────────────────────────────────────────────────
    escrow.submit_milestone(&job_id, &freelancer_addr);
    escrow.approve_milestone(&job_id, &client_addr);
    assert_eq!(usdc.balance(&freelancer_addr), 200);

    // ── Milestone 3 (final) ──────────────────────────────────────────────────
    escrow.submit_milestone(&job_id, &freelancer_addr);
    escrow.approve_milestone(&job_id, &client_addr);
    assert_eq!(usdc.balance(&freelancer_addr), 300); // all paid
    assert_eq!(usdc.balance(&contract_id), 0);       // escrow empty

    let completed_job = escrow.get_job(&job_id);
    assert_eq!(completed_job.milestones_approved, 3);
}

#[test]
fn test_dispute() {
    let env = Env::default();
    env.mock_all_auths();

    let client_addr = Address::generate(&env);
    let freelancer_addr = Address::generate(&env);
    let admin = Address::generate(&env);

    let usdc_id = env.register_stellar_asset_contract_v2(admin.clone());
    let usdc_admin = StellarAssetClient::new(&env, &usdc_id.address());
    usdc_admin.mint(&client_addr, &500);

    let contract_id = env.register(GigEscrowContract, ());
    let escrow = GigEscrowContractClient::new(&env, &contract_id);

    let job_id = escrow.create_job(
        &client_addr,
        &freelancer_addr,
        &usdc_id.address(),
        &500,
        &2,
    );

    // Freelancer submits first milestone
    escrow.submit_milestone(&job_id, &freelancer_addr);

    // Client raises dispute instead of approving
    escrow.raise_dispute(&job_id, &client_addr);

    let job = escrow.get_job(&job_id);
    assert_eq!(job.status, JobStatus::Disputed);
}
