#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, token};

// ─── Data Types ───────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub enum JobStatus {
    Active,
    Disputed,
    Completed,
}

#[contracttype]
#[derive(Clone)]
pub struct Job {
    pub id: u64,
    pub client: Address,
    pub freelancer: Address,
    pub token: Address,
    pub total_amount: i128,
    pub milestone_count: u32,
    pub milestones_submitted: u32,
    pub milestones_approved: u32,
    pub status: JobStatus,
}

#[contracttype]
pub enum DataKey {
    Job(u64),
    JobCount,
}

// ─── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct GigEscrowContract;

#[contractimpl]
impl GigEscrowContract {
    /// Client creates a job and deposits the full USDC amount upfront.
    pub fn create_job(
        env: Env,
        client: Address,
        freelancer: Address,
        token: Address,
        total_amount: i128,
        milestone_count: u32,
    ) -> u64 {
        client.require_auth();
        assert!(milestone_count > 0 && milestone_count <= 10, "1–10 milestones");
        assert!(total_amount > 0, "Amount must be positive");

        // Transfer full payment into escrow
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&client, &env.current_contract_address(), &total_amount);

        // Assign next job ID
        let id: u64 = env.storage().instance().get(&DataKey::JobCount).unwrap_or(0);
        let next_id = id + 1;

        let job = Job {
            id: next_id,
            client: client.clone(),
            freelancer: freelancer.clone(),
            token: token.clone(),
            total_amount,
            milestone_count,
            milestones_submitted: 0,
            milestones_approved: 0,
            status: JobStatus::Active,
        };

        env.storage().persistent().set(&DataKey::Job(next_id), &job);
        env.storage().instance().set(&DataKey::JobCount, &next_id);

        next_id
    }

    /// Freelancer marks the current milestone as submitted.
    pub fn submit_milestone(env: Env, job_id: u64, freelancer: Address) {
        freelancer.require_auth();

        let mut job: Job = env.storage().persistent().get(&DataKey::Job(job_id))
            .expect("Job not found");

        assert!(job.status == JobStatus::Active, "Job is not active");
        assert!(job.freelancer == freelancer, "Not the freelancer for this job");
        assert!(
            job.milestones_submitted < job.milestone_count,
            "All milestones already submitted"
        );
        assert!(
            job.milestones_submitted == job.milestones_approved,
            "Awaiting client approval on previous milestone"
        );

        job.milestones_submitted += 1;
        env.storage().persistent().set(&DataKey::Job(job_id), &job);
    }

    /// Client approves the latest milestone and releases the pro-rata payment.
    pub fn approve_milestone(env: Env, job_id: u64, client: Address) {
        client.require_auth();

        let mut job: Job = env.storage().persistent().get(&DataKey::Job(job_id))
            .expect("Job not found");

        assert!(job.status == JobStatus::Active, "Job is not active");
        assert!(job.client == client, "Not the client for this job");
        assert!(
            job.milestones_submitted > job.milestones_approved,
            "No milestone pending approval"
        );

        // Release 1/milestone_count of the total
        let payout = job.total_amount / (job.milestone_count as i128);
        let token_client = token::Client::new(&env, &job.token);
        token_client.transfer(&env.current_contract_address(), &job.freelancer, &payout);

        job.milestones_approved += 1;

        // Auto-complete if all milestones approved
        if job.milestones_approved == job.milestone_count {
            job.status = JobStatus::Completed;
        }

        env.storage().persistent().set(&DataKey::Job(job_id), &job);
    }

    /// Either party raises a dispute — locks the job for human resolution.
    pub fn raise_dispute(env: Env, job_id: u64, by: Address) {
        by.require_auth();

        let mut job: Job = env.storage().persistent().get(&DataKey::Job(job_id))
            .expect("Job not found");

        assert!(job.status == JobStatus::Active, "Job is not active");
        assert!(
            job.client == by || job.freelancer == by,
            "Must be client or freelancer"
        );

        job.status = JobStatus::Disputed;
        env.storage().persistent().set(&DataKey::Job(job_id), &job);
    }

    /// Read a job's full state.
    pub fn get_job(env: Env, job_id: u64) -> Job {
        env.storage().persistent().get(&DataKey::Job(job_id))
            .expect("Job not found")
    }

    /// Read total number of jobs created.
    pub fn get_job_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::JobCount).unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
