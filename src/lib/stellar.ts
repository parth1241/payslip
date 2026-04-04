import * as StellarSdk from "stellar-sdk";
import {
  requestAccess,
  signTransaction,
  isConnected,
} from "@stellar/freighter-api";

/* ──────────────────────────────────────────────
 *  Constants
 * ────────────────────────────────────────────── */

const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

/* ──────────────────────────────────────────────
 *  1. Connect to Stellar Testnet
 * ────────────────────────────────────────────── */

/**
 * Returns a Horizon server instance pointed at the Stellar **Testnet**.
 */
export function getServer(): StellarSdk.Horizon.Server {
  return new StellarSdk.Horizon.Server(HORIZON_TESTNET_URL);
}

/* ──────────────────────────────────────────────
 *  Freighter helpers
 * ────────────────────────────────────────────── */

/**
 * Check whether the Freighter browser‑extension is installed & connected.
 */
export async function checkFreighterConnection(): Promise<boolean> {
  const result = await isConnected();
  if (result.error) {
    console.error("Freighter connection error:", result.error);
    return false;
  }
  return result.isConnected;
}

/**
 * Prompt the user to grant wallet access via Freighter.
 * Returns the user's public key (G…) on success.
 */
export async function connectWallet(): Promise<string> {
  const connected = await checkFreighterConnection();
  if (!connected) {
    throw new Error(
      "Freighter wallet extension is not installed or not connected. " +
        "Install it from https://freighter.app"
    );
  }

  const result = await requestAccess();
  if (result.error) {
    throw new Error(`Freighter access denied: ${result.error}`);
  }
  return result.address;
}

/**
 * Fetch the XLM Balance natively looping over Horizon.
 */
export async function getWalletBalance(address: string): Promise<string | null> {
  try {
    const res = await fetch(`${HORIZON_TESTNET_URL}/accounts/${address}`);
    if (res.status === 404) return "0.00";
    if (!res.ok) return null;
    const data = await res.json();
    const xlm = data.balances?.find((b: { asset_type: string; balance: string }) => b.asset_type === "native");
    return xlm ? parseFloat(xlm.balance).toFixed(2) : "0.00";
  } catch (err) {
    console.error("Balance fetch error:", err);
    return "0.00"; // Fallback to 0.00 for resilient UI
  }
}

/* ──────────────────────────────────────────────
 *  2. Build a payment transaction (XLM) with memo
 * ────────────────────────────────────────────── */

export interface PaymentParams {
  /** Sender's Stellar public key (G…) */
  senderPublicKey: string;
  /** Recipient's Stellar public key (G…) */
  destinationPublicKey: string;
  /** Amount of XLM to send (e.g. "10.5") */
  amount: string;
  /** Optional text memo (max 28 bytes) attached to the transaction */
  memo?: string;
}

/**
 * Builds an unsigned XLM payment transaction on the Stellar Testnet.
 *
 * The transaction includes:
 * - A native‑asset (XLM) payment operation
 * - An optional text memo (useful for payslip references, invoice IDs, etc.)
 * - A 180‑second timeout
 *
 * @returns The built `Transaction` object (not yet signed).
 */
export async function buildPaymentTransaction({
  senderPublicKey,
  destinationPublicKey,
  amount,
  memo,
}: PaymentParams): Promise<StellarSdk.Transaction> {
  const server = getServer();

  // Load the source account so we get the current sequence number
  const sourceAccount = await server.loadAccount(senderPublicKey);

  // Fetch the recommended base fee (falls back to 100 stroops)
  let fee: string;
  try {
    const fetchedFee = await server.fetchBaseFee();
    fee = String(fetchedFee);
  } catch {
    fee = StellarSdk.BASE_FEE; // 100 stroops
  }

  // Build the transaction
  let builder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee,
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(
    StellarSdk.Operation.payment({
      destination: destinationPublicKey,
      asset: StellarSdk.Asset.native(),
      amount, // e.g. "100.0000000"
    })
  );

  // Attach a text memo if provided
  if (memo) {
    builder = builder.addMemo(StellarSdk.Memo.text(memo));
  }

  // Set a 180‑second validity window & build
  const transaction = builder.setTimeout(180).build();

  return transaction as unknown as StellarSdk.Transaction;
}

/* ──────────────────────────────────────────────
 *  3. Submit via Freighter wallet signing
 * ────────────────────────────────────────────── */

export interface SubmitResult {
  /** Whether the transaction was successfully submitted */
  success: boolean;
  /** The transaction hash (if successful) */
  hash?: string;
  /** Human‑readable error message (if failed) */
  error?: string;
}

/**
 * End‑to‑end helper that:
 * 1. Builds a payment transaction
 * 2. Serialises it to XDR
 * 3. Sends the XDR to **Freighter** for user approval & signing
 * 4. Submits the signed transaction to the Stellar Testnet
 *
 * @returns `{ success, hash }` on success or `{ success: false, error }` on failure.
 */
export async function submitPaymentViaFreighter(
  params: PaymentParams
): Promise<SubmitResult> {
  try {
    // 1. Build the unsigned transaction
    const transaction = await buildPaymentTransaction(params);

    // 2. Serialise to XDR for Freighter
    const xdr = transaction.toXDR();

    // 3. Ask Freighter to sign
    const signResult = await signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    if (signResult.error) {
      return {
        success: false,
        error: `Freighter signing failed: ${signResult.error}`,
      };
    }

    // 4. Re-hydrate the signed XDR and submit
    const server = getServer();
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(
      signResult.signedTxXdr,
      NETWORK_PASSPHRASE
    );

    const response = await server.submitTransaction(
      signedTx as unknown as StellarSdk.Transaction
    );

    return {
      success: true,
      hash: (response as { hash: string }).hash,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error during submission";
    console.error("submitPaymentViaFreighter failed:", err);
    return { success: false, error: message };
  }
}

/* ──────────────────────────────────────────────
 *  4. Bulk disburse — batch payroll
 * ────────────────────────────────────────────── */

export interface DisburseEntry {
  /** Recipient Stellar public key (G…) */
  destination: string;
  /** Amount to send (e.g. "1200") */
  amount: string;
  /** Human-readable name (for result tracking) */
  employeeName: string;
}

export interface DisburseResult {
  employeeName: string;
  txHash: string;
  success: boolean;
  error?: string;
}

export const TESTNET_USDC_ASSET = new StellarSdk.Asset(
  "USDC",
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
);

/**
 * Build a **single** Stellar transaction containing one `payment` operation
 * per employee, sign it via Freighter, and submit to the Testnet.
 *
 * Memo format: `PAYSLIP-MMM-YYYY` (e.g. `PAYSLIP-APR-2026`).
 *
 * Because all operations live in one transaction they either **all succeed
 * or all fail** atomically — this is both cheaper (one base-fee) and safer
 * than submitting individual transactions.
 *
 * @param entries  Array of `{ destination, amount, employeeName }`
 * @param assetType Which currency to send: "XLM" or "USDC"
 * @returns        Per-employee result array with the shared `txHash`.
 */
export async function bulkDisburse(
  entries: DisburseEntry[],
  assetType: "XLM" | "USDC" = "XLM"
): Promise<DisburseResult[]> {
  if (entries.length === 0) {
    return [];
  }

  try {
    // ── 1. Get employer's public key from Freighter ──
    const senderPublicKey = await connectWallet();

    // ── 2. Load the source account ──
    const server = getServer();
    const sourceAccount = await server.loadAccount(senderPublicKey);

    // ── 3. Build memo: PAYSLIP-MMM-YYYY ──
    const now = new Date();
    const monthAbbr = now
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase();
    const year = now.getFullYear();
    const memo = `PAYSLIP-${monthAbbr}-${year}`;

    // ── 4. Build transaction with one payment op per employee ──
    let builder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    const paymentAsset = assetType === "USDC" ? TESTNET_USDC_ASSET : StellarSdk.Asset.native();

    for (const entry of entries) {
      builder = builder.addOperation(
        StellarSdk.Operation.payment({
          destination: entry.destination,
          asset: paymentAsset,
          amount: entry.amount,
        })
      ) as unknown as StellarSdk.TransactionBuilder;
    }

    builder = builder.addMemo(StellarSdk.Memo.text(memo)) as unknown as StellarSdk.TransactionBuilder;
    const transaction = builder.setTimeout(300).build();

    // ── 5. Sign via Freighter ──
    const xdr = transaction.toXDR();
    const signResult = await signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    if (signResult.error) {
      // Signing rejected — return failure for every employee
      return entries.map((e) => ({
        employeeName: e.employeeName,
        txHash: "",
        success: false,
        error: `Freighter signing rejected: ${signResult.error}`,
      }));
    }

    // ── 6. Submit the signed transaction ──
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(
      signResult.signedTxXdr,
      NETWORK_PASSPHRASE
    );

    const response = await server.submitTransaction(
      signedTx as unknown as StellarSdk.Transaction
    );

    const txHash = (response as { hash: string }).hash;

    // All ops in one tx share the same hash
    return entries.map((e) => ({
      employeeName: e.employeeName,
      txHash,
      success: true,
    }));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Bulk disburse failed";
    console.error("bulkDisburse failed:", err);

    return entries.map((e) => ({
      employeeName: e.employeeName,
      txHash: "",
      success: false,
      error: message,
    }));
  }
}

/* ──────────────────────────────────────────────
 *  5. Transaction history
 * ────────────────────────────────────────────── */

export interface PaymentRecord {
  id: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  assetType: string;
  assetCode?: string;
  createdAt: string;
  transactionHash: string;
  successful: boolean;
}

/**
 * Fetch the last **20** payment operations for a given Stellar wallet
 * address from the Horizon Testnet API.
 *
 * Only operations of type `payment` are included (create_account,
 * path_payment etc. are filtered out).
 */
export async function getTransactionHistory(
  walletAddress: string
): Promise<PaymentRecord[]> {
  const server = getServer();

  const page = await server
    .payments()
    .forAccount(walletAddress)
    .limit(20)
    .order("desc")
    .includeFailed(false)
    .call();

  const records: PaymentRecord[] = [];

  for (const record of page.records) {
    // The payments endpoint returns multiple operation types;
    // we only care about actual payment operations.
    if (record.type !== "payment") continue;

    // Type-narrow to payment record shape
    const rec = record as unknown as {
      id: string;
      type: string;
      from: string;
      to: string;
      amount: string;
      asset_type: string;
      asset_code?: string;
      created_at: string;
      transaction_hash: string;
      transaction_successful: boolean;
    };

    records.push({
      id: rec.id,
      type: rec.type,
      from: rec.from,
      to: rec.to,
      amount: rec.amount,
      assetType: rec.asset_type,
      assetCode: rec.asset_code,
      createdAt: rec.created_at,
      transactionHash: rec.transaction_hash,
      successful: rec.transaction_successful,
    });
  }

  return records;
}
