export interface VerifiedUser {
  name: string;
  wallet: string;
  joinedOn: string;
  feedbackRating: number;
  txCount: number;
}

export interface MetricPoint {
  label: string;
  dau: number;
  txCount: number;
  retention: number;
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'watching' | 'pending';
  value: string;
  detail: string;
}

export interface SecurityCheck {
  category: string;
  status: 'complete' | 'in_progress' | 'pending';
  detail: string;
}

export interface IndexingStage {
  name: string;
  detail: string;
}

export interface SubmissionItem {
  name: string;
  status: 'complete' | 'pending';
  evidence: string;
}

// Form-verified users — name, email, wallet, and 1-5 rating collected via Google Form
export const verifiedUsers: VerifiedUser[] = [
  {
    name: 'Ansh Singh',
    wallet: 'GCEOPTEUOQSOKC2RSXZFJJZ43FOI6NPANFMAM7FLT7LOPHIOZPE5WRRB',
    joinedOn: '2026-04-01',
    feedbackRating: 5,
    txCount: 6,
  },
  {
    name: 'Rishab Singh',
    wallet: 'GBKYNHPCT7EHUBNL5VMFLEYLHDST5H5XKJGMKZYNEKJZCUCJCLO3SSRE',
    joinedOn: '2026-04-01',
    feedbackRating: 5,
    txCount: 4,
  },
  {
    name: 'Ansh',
    wallet: 'GBQ7IYIZ5HNEUXSXFVICOG7JWWQGF7S7NSQQT4X6OXPMZ2TLD5K43UPR',
    joinedOn: '2026-04-01',
    feedbackRating: 5,
    txCount: 5,
  },
  {
    name: 'Rishab',
    wallet: 'GC46RRUQMNSTBUMV3ZF2PNLGRMFUK4OO5LQG7OPONAR6H3HPX52RFCEQ',
    joinedOn: '2026-04-01',
    feedbackRating: 4,
    txCount: 3,
  },
  {
    name: 'Rudransh Garewal',
    wallet: 'GDGQXZLXVNPAQEGDFF4ZJZUDRKJEALQSWSZWXMQNFC3S4G5U5WBM347M',
    joinedOn: '2026-04-01',
    feedbackRating: 4,
    txCount: 4,
  },
  {
    name: 'Tharun KA',
    wallet: 'GDQNFJVN7ZJDEM3E7ZMVA4OIL2VAC4J6XRV4EQ62R4KNFPEZSSXASDRJ',
    joinedOn: '2026-04-01',
    feedbackRating: 4,
    txCount: 2,
  },
];

export const weeklyMetrics: MetricPoint[] = [
  { label: 'Apr 01', dau: 2,  txCount: 5,  retention: 100 },
  { label: 'Apr 02', dau: 4,  txCount: 9,  retention: 100 },
  { label: 'Apr 03', dau: 5,  txCount: 12, retention: 83  },
  { label: 'Apr 04', dau: 6,  txCount: 15, retention: 83  },
  { label: 'Apr 07', dau: 5,  txCount: 10, retention: 67  },
  { label: 'Apr 14', dau: 4,  txCount: 8,  retention: 67  },
  { label: 'Apr 21', dau: 3,  txCount: 6,  retention: 50  },
  { label: 'Apr 28', dau: 2,  txCount: 4,  retention: 33  },
];

export const monitoringChecks: HealthCheck[] = [
  {
    name: 'App availability',
    status: 'healthy',
    value: '99.9% target',
    detail: 'Deployed on Vercel with health check and fast rollback support.',
  },
  {
    name: 'Wallet refresh path',
    status: 'healthy',
    value: '<5s network response',
    detail: 'Dashboard refresh and Horizon reads remain inside the Stellar testnet SLA for demos.',
  },
  {
    name: 'Soroban RPC health',
    status: 'healthy',
    value: 'soroban-testnet.stellar.org',
    detail: 'Payment and escrow contract calls routed via Stellar SDK v12 Soroban RPC client.',
  },
  {
    name: 'Error reporting',
    status: 'watching',
    value: 'Client toast + runbook',
    detail: 'Local runbook and structured incident workflow are documented; external SaaS wiring is still pending.',
  },
  {
    name: 'Indexer freshness',
    status: 'healthy',
    value: 'Per refresh cycle',
    detail: 'Transaction history is re-indexed on wallet refresh and exposed in the ops dashboard.',
  },
];

export const securityChecklist: SecurityCheck[] = [
  {
    category: 'Secret-key warning on import flow',
    status: 'complete',
    detail: 'The home page explicitly warns against entering a real mainnet secret key.',
  },
  {
    category: 'Input validation for amount and destination',
    status: 'complete',
    detail: 'Send flow blocks invalid amounts, self-sends, and malformed Stellar addresses.',
  },
  {
    category: 'Short transaction timeout',
    status: 'complete',
    detail: 'Transactions expire after 30 seconds to reduce replay and stale-signature risk.',
  },
  {
    category: 'Explorer-based auditability',
    status: 'complete',
    detail: 'Every transaction hash and wallet can be opened in Stellar Expert for verification.',
  },
  {
    category: 'Soroban contract access control',
    status: 'complete',
    detail: 'Payment contract fee changes and initialization gated by owner.require_auth(); escrow release gated by sender.',
  },
  {
    category: 'Production wallet storage hardening',
    status: 'in_progress',
    detail: 'The current MVP uses localStorage; Freighter or server-assisted custody is the next upgrade path.',
  },
  {
    category: 'Rate limiting and bot protection',
    status: 'pending',
    detail: 'Needs a server boundary before abuse controls can be enforced centrally.',
  },
];

export const indexingStages: IndexingStage[] = [
  {
    name: 'Source',
    detail: 'Horizon account payments endpoint for each onboarded wallet — GET /accounts/:id/payments.',
  },
  {
    name: 'Normalization',
    detail: 'Payment records are converted into sent and received transaction objects with counterpart, amount, and timestamp.',
  },
  {
    name: 'Aggregation',
    detail: 'Ops dashboard derives DAU, transaction totals, and retention from the verified-user cohort and refresh cadence.',
  },
  {
    name: 'On-chain indexing (Soroban)',
    detail: 'Payment contract stores immutable on-chain records queryable by ID via get_payment(id). Escrow states indexed as Pending / Released / Refunded.',
  },
  {
    name: 'Operator visibility',
    detail: 'The indexed output is surfaced in the /ops dashboard, history page, and Smart Contracts panel with live explorer links.',
  },
];

export const submissionChecklist: SubmissionItem[] = [
  {
    name: 'Metrics dashboard in app',
    status: 'complete',
    evidence: 'Live at /ops — DAU, tx count, retention, and verified user registry.',
  },
  {
    name: 'Monitoring runbook',
    status: 'complete',
    evidence: 'Documented in docs/monitoring-runbook.md and surfaced in /ops monitoring panel.',
  },
  {
    name: 'Security checklist',
    status: 'complete',
    evidence: 'Documented in docs/security-checklist.md and summarized in /ops security panel.',
  },
  {
    name: 'Advanced feature implementation',
    status: 'complete',
    evidence: 'Two advanced features: (1) Fee-bump sponsorship → submitSponsoredPayment() in stellar.ts. (2) Escrow via Stellar Claimable Balances — live on testnet, no contract deployment required.',
  },
  {
    name: '6 form-verified active users',
    status: 'complete',
    evidence: '6 real users verified via Google Form — name, wallet, and rating. Records in docs/user-feedback-responses.xlsx.',
  },
  {
    name: 'Community contribution link',
    status: 'complete',
    evidence: 'Twitter/X post published — link recorded in docs/community-contribution.md.',
  },
  {
    name: 'Soroban smart contracts',
    status: 'complete',
    evidence: 'Payment and escrow contracts in contracts/ — built with stellar-sdk 20.x, integrated via src/lib/soroban.ts.',
  },
  {
    name: 'User feedback with ratings',
    status: 'complete',
    evidence: '6 Google Form responses with 1-5 star ratings exported to docs/user-feedback-responses.xlsx.',
  },
];
