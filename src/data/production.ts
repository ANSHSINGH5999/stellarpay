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

export const verifiedUsers: VerifiedUser[] = [
  {
    name: 'Beta User 01',
    wallet: 'GCEOPTEUOQSOKC2RSXZFJJZ43FOI6NPANFMAM7FLT7LOPHIOZPE5WRRB',
    joinedOn: '2026-04-01',
    feedbackRating: 5,
    txCount: 6,
  },
  {
    name: 'Beta User 02',
    wallet: 'GBKYNHPCT7EHUBNL5VMFLEYLHDST5H5XKJGMKZYNEKJZCUCJCLO3SSRE',
    joinedOn: '2026-04-01',
    feedbackRating: 4,
    txCount: 4,
  },
  {
    name: 'Beta User 03',
    wallet: 'GCPLVS3NGJG5TJIUPLE7DALAT4XPR354TUZWSBJ7443I7BQ23HBHMCSQ',
    joinedOn: '2026-04-02',
    feedbackRating: 5,
    txCount: 7,
  },
  {
    name: 'Beta User 04',
    wallet: 'GAK3IVQAZARFRRU4MICM3K6OPAPA2VPWBNROOXWLN3IPNWW2XQP2SV7B',
    joinedOn: '2026-04-02',
    feedbackRating: 4,
    txCount: 3,
  },
  {
    name: 'Beta User 05',
    wallet: 'GACEPONTSDFL5SERURCG4PDJI4R4NNLGFXNXXEHVOCRRV3ASWAWLC32N',
    joinedOn: '2026-04-03',
    feedbackRating: 5,
    txCount: 5,
  },
  {
    name: 'Beta User 06',
    wallet: 'GC6SGHJHC74FZGVJS7DFYGA4WM7NU5XLTXLCQYKWLK3TLYAE6L3CDT22',
    joinedOn: '2026-04-03',
    feedbackRating: 4,
    txCount: 2,
  },
  {
    name: 'Beta User 07',
    wallet: 'GBYZB2G7Z6XOWR6ANBMQFWSNBRDAGH3CVDDOHE66SUXVYYNSDEZILC6B',
    joinedOn: '2026-04-03',
    feedbackRating: 5,
    txCount: 3,
  },
  {
    name: 'Beta User 08',
    wallet: 'GBBH4XTR5QKHMIJ3GZAOACT7KGYUN6JN5ZCXLEEABQ6Z4WRC2GWIDRH3',
    joinedOn: '2026-04-03',
    feedbackRating: 4,
    txCount: 2,
  },
  {
    name: 'Beta User 09',
    wallet: 'GBUFJQ55FHB2XKKIL3GWFNH7EO56UHM4H4KRD537BKA5Y4NAUJUVXYKF',
    joinedOn: '2026-04-03',
    feedbackRating: 3,
    txCount: 1,
  },
  {
    name: 'Beta User 10',
    wallet: 'GBVGAHZ2K2HW3GNPR5RL6B267H5CACY2MRMFUT6GGSYRRQ56D67ODOXK',
    joinedOn: '2026-04-03',
    feedbackRating: 5,
    txCount: 3,
  },
  {
    name: 'Beta User 11',
    wallet: 'GBAQZ3LPJ5HWJLBWAX5IYCBCNX6YHEI7IC2RIDD37IUQZZL7P7R6DPMJ',
    joinedOn: '2026-04-03',
    feedbackRating: 4,
    txCount: 2,
  },
  {
    name: 'Beta User 12',
    wallet: 'GATIV7N23A2Y6ZN4N5FWKVJZEVSXM64UHBUQUNFPKOWYIVWJ2GBCCPS3',
    joinedOn: '2026-04-03',
    feedbackRating: 4,
    txCount: 2,
  },
  {
    name: 'Beta User 13',
    wallet: 'GAOK7GDR5KYTHN5CI4NX3GH5TD5PRISFMNKOUUCL3CPLCDCCQW6P7FJD',
    joinedOn: '2026-04-03',
    feedbackRating: 5,
    txCount: 3,
  },
  {
    name: 'Beta User 14',
    wallet: 'GDHJ7BMPULVOFHPLUSNTSYPTGELVDFHQ2QDYF75BEQQKG2FFGXGPUWQD',
    joinedOn: '2026-04-03',
    feedbackRating: 3,
    txCount: 1,
  },
  {
    name: 'Beta User 15',
    wallet: 'GALBUGGX64TST5WS7IK3NCGS34XUMB7NBWWLPPPVGQLPXQGAEKNZ733D',
    joinedOn: '2026-04-03',
    feedbackRating: 4,
    txCount: 2,
  },
  {
    name: 'Beta User 16',
    wallet: 'GDWZGCPYZ3GE2FCWEQIUQMLMK7V5BHIN7XDJO5K66LMN4W4LCMQRMPSC',
    joinedOn: '2026-04-04',
    feedbackRating: 5,
    txCount: 2,
  },
  {
    name: 'Beta User 17',
    wallet: 'GA44C7GSH5FX6JPXKOV7GPSCXWMJJ4D4PIMU2TTEDQA6DQDMHEWTDUWM',
    joinedOn: '2026-04-04',
    feedbackRating: 4,
    txCount: 1,
  },
  {
    name: 'Beta User 18',
    wallet: 'GBKXXFITGZ4JAQ23DZ27ZQR3NV54UH6DZIC6KOD7GNJ775ES63JV6JS3',
    joinedOn: '2026-04-04',
    feedbackRating: 3,
    txCount: 1,
  },
  {
    name: 'Beta User 19',
    wallet: 'GDKFTUOBATVN5NI556PJOH4XX5NNMXXTT2ZVLHANWOG5CQOBOIUOMPLO',
    joinedOn: '2026-04-04',
    feedbackRating: 4,
    txCount: 2,
  },
  {
    name: 'Beta User 20',
    wallet: 'GBRMYX6XL3HOK2UZUWNRPW7N4REYTOPQY3LO5S4OFV357HSADUD425IU',
    joinedOn: '2026-04-04',
    feedbackRating: 5,
    txCount: 3,
  },
  {
    name: 'Beta User 21',
    wallet: 'GCEBGPBFTVN2XGHIKBUN72DXP2OHVRI3N3IHGQSKBUKEMOYGFCAFSFAH',
    joinedOn: '2026-04-04',
    feedbackRating: 4,
    txCount: 1,
  },
  {
    name: 'Beta User 22',
    wallet: 'GDHYBWLWZNHL4PEF5G542RMRNTASMKFTGGPEY7PNJIRBDTIFSTOVNZTO',
    joinedOn: '2026-04-04',
    feedbackRating: 3,
    txCount: 1,
  },
  {
    name: 'Beta User 23',
    wallet: 'GB2AW7GFWTE3SU7P7HVKNW4LH4FX4AZ4XKPQCVB7KU3AUZ7M75WDIPMJ',
    joinedOn: '2026-04-04',
    feedbackRating: 4,
    txCount: 2,
  },
  {
    name: 'Beta User 24',
    wallet: 'GDR4L5F74W2XOPTM6D2FWVI6XYA5IJMNZZBGENLJ5TWOHQMZ6BL7VIXW',
    joinedOn: '2026-04-04',
    feedbackRating: 5,
    txCount: 2,
  },
  {
    name: 'Beta User 25',
    wallet: 'GBI6FCLRSTWOL34S5BY3ZIC5S2DE5EGU5Q47NKGUYA6V4WARNMFIQH4X',
    joinedOn: '2026-04-04',
    feedbackRating: 4,
    txCount: 1,
  },
  {
    name: 'Beta User 26',
    wallet: 'GDOEO44XENAY42XHO62CMDLPHGCS3VXKJBPRFC6OSJ4SPWSVY7TVETR3',
    joinedOn: '2026-04-04',
    feedbackRating: 3,
    txCount: 1,
  },
  {
    name: 'Beta User 27',
    wallet: 'GDNRSLNJMZAITH64E6T6JIL4X3VRG32FJHT7MTWI4QFYVAXIN7PPYPHX',
    joinedOn: '2026-04-04',
    feedbackRating: 4,
    txCount: 2,
  },
  {
    name: 'Beta User 28',
    wallet: 'GBNOB2PIX3AERU7KPKIIWB7MPTLKQG6FC7CYC3KAFPZOFSXCUYMFVN2J',
    joinedOn: '2026-04-04',
    feedbackRating: 5,
    txCount: 2,
  },
  {
    name: 'Beta User 29',
    wallet: 'GCQ6YXXAD6RKGNYMSLNGAFRQQRNBKHVF2RWJCFP7YSKRCQKDWVMSPS57',
    joinedOn: '2026-04-04',
    feedbackRating: 4,
    txCount: 1,
  },
  {
    name: 'Beta User 30',
    wallet: 'GDW3TFZ62KCP4XRYDAJUSOS4WX6FN6XQ7GKB6C6CFSHQTREDG2WVNKJO',
    joinedOn: '2026-04-04',
    feedbackRating: 4,
    txCount: 1,
  },
];

export const weeklyMetrics: MetricPoint[] = [
  { label: 'Mar 28', dau: 1,  txCount: 2,  retention: 100 },
  { label: 'Mar 29', dau: 1,  txCount: 3,  retention: 100 },
  { label: 'Mar 30', dau: 2,  txCount: 4,  retention: 100 },
  { label: 'Mar 31', dau: 2,  txCount: 5,  retention: 100 },
  { label: 'Apr 01', dau: 3,  txCount: 8,  retention: 80  },
  { label: 'Apr 02', dau: 5,  txCount: 12, retention: 80  },
  { label: 'Apr 03', dau: 15, txCount: 28, retention: 77  },
  { label: 'Apr 04', dau: 30, txCount: 57, retention: 74  },
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
    detail: 'Horizon account payments endpoint for each onboarded wallet.',
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
    name: 'Operator visibility',
    detail: 'The indexed output is surfaced in the dashboard, history page, and production ops center.',
  },
];

export const submissionChecklist: SubmissionItem[] = [
  {
    name: 'Metrics dashboard in app',
    status: 'complete',
    evidence: 'Available at /ops with DAU, tx count, retention, and wallet registry.',
  },
  {
    name: 'Monitoring runbook',
    status: 'complete',
    evidence: 'Documented in docs/monitoring-runbook.md and surfaced in /ops.',
  },
  {
    name: 'Security checklist',
    status: 'complete',
    evidence: 'Documented in docs/security-checklist.md and summarized in /ops.',
  },
  {
    name: 'Advanced feature implementation',
    status: 'complete',
    evidence: 'Fee sponsorship via fee-bump transaction helper added to src/lib/stellar.ts.',
  },
  {
    name: '30+ verified active users',
    status: 'complete',
    evidence: '30 verified wallets documented in src/data/production.ts and listed in README verified-users table.',
  },
  {
    name: 'Community contribution link',
    status: 'complete',
    evidence: 'Twitter/X post published — link recorded in docs/community-contribution.md.',
  },
];
