import {
  Horizon,
  Networks,
  Operation,
  TransactionBuilder,
  BASE_FEE,
  Memo,
  Asset,
  Keypair
} from '@stellar/stellar-sdk'
import { 
  isConnected, 
  getAddress as getPublicKey, 
  getNetworkDetails,
  signTransaction 
} from '@stellar/freighter-api'

const HORIZON_URL = process.env.NEXT_PUBLIC_STELLAR_HORIZON 
  || 'https://horizon-testnet.stellar.org'
const NETWORK_PASSPHRASE = Networks.TESTNET
const server = new Horizon.Server(HORIZON_URL)

export function getServer() {
  return server
}

// ── 1. WALLET SETUP ──────────────────────────────────────────

/**
 * Check if Freighter is installed in the browser
 */
export async function isFreighterInstalled(): Promise<boolean> {
  const result = await isConnected();
  return !result.error && result.isConnected;
}

/**
 * Check if Freighter is connected (has an active account)
 */
export async function isFreighterConnected(): Promise<boolean> {
  const result = await isConnected();
  return !result.error && result.isConnected;
}

/**
 * Get the network Freighter is currently on
 */
export async function getFreighterNetwork(): Promise<string> {
  try {
    const details = await getNetworkDetails();
    if (details.networkPassphrase === Networks.PUBLIC) return 'PUBLIC';
    if (details.networkPassphrase === Networks.TESTNET) return 'TESTNET';
    if (details.networkPassphrase === Networks.FUTURENET) return 'FUTURENET';
    return 'UNKNOWN';
  } catch {
    return 'UNKNOWN';
  }
}

// ── 2. WALLET CONNECT / DISCONNECT ───────────────────────────

/**
 * Connect Freighter and return the public key
 */
export async function connectFreighter(): Promise<{
  publicKey: string
  network: string
}> {
  const installed = await isFreighterInstalled();
  if (!installed) {
    throw new Error('Freighter not installed');
  }

  try {
    const pkResult = await getPublicKey();
    if (typeof pkResult !== 'string' && pkResult.error) {
      throw new Error(pkResult.error);
    }
    const publicKey = typeof pkResult === 'string' ? pkResult : pkResult.address;
    const network = await getFreighterNetwork();
    
    if (network !== 'TESTNET') {
      throw new Error('Please switch Freighter to Stellar Testnet');
    }

    return { publicKey, network };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('User rejected')) {
      throw new Error('User rejected connection');
    }
    throw error;
  }
}

/**
 * Disconnect wallet (clears local state)
 */
export function disconnectWallet(): { success: boolean } {
  // Freighter has no programmatic disconnect, so we just return success
  // and handle state clearing in the UI components
  return { success: true };
}

// ── 3. BALANCE HANDLING ───────────────────────────────────────

/**
 * Fetch XLM balance for a wallet address from Stellar Horizon
 */
export async function getXLMBalance(address: string): Promise<number> {
  try {
    const account = await server.loadAccount(address);
    const nativeBalance = account.balances.find(b => b.asset_type === 'native');
    return nativeBalance ? parseFloat(nativeBalance.balance) : 0;
  } catch {
    // Returns 0 if account not found (unfunded testnet account)
    return 0;
  }
}

/**
 * Fund a testnet wallet using Friendbot
 */
export async function fundWithFriendbot(address: string): Promise<{
  success: boolean,
  message: string
}> {
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${address}`);
    if (response.ok) {
      return { success: true, message: 'Wallet funded with 10,000 XLM' };
    } else {
      const data = await response.json();
      return { success: false, message: data.detail || 'Friendbot funding failed' };
    }
  } catch {
    return { success: false, message: 'Network error funding wallet' };
  }
}

// ── 4. TRANSACTION FLOW ───────────────────────────────────────

export type SendXLMResult = 
  | {
      success: true
      txHash: string
      ledger: number
      timestamp: string
      amount: string
      destination: string
      fee: string
    }
  | {
      success: false
      error: string
      code?: string
    }

/**
 * Send XLM from connected Freighter wallet to a destination
 */
export async function sendXLM(params: {
  sourcePublicKey: string
  destinationAddress: string
  amountXLM: string
  memo?: string
}): Promise<SendXLMResult> {
  try {
    // 1. Load source account
    const sourceAccount = await server.loadAccount(params.sourcePublicKey);

    // 2. Build transaction
    const builder = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    }).addOperation(
      Operation.payment({
        destination: params.destinationAddress,
        asset: Asset.native(),
        amount: params.amountXLM,
      })
    );

    if (params.memo) {
      builder.addMemo(Memo.text(params.memo));
    }

    const transaction = builder.setTimeout(30).build();
    const xdr = transaction.toXDR();

    // 3. Sign via Freighter
    const signResult = await signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE });
    if (typeof signResult !== 'string' && signResult.error) {
      throw new Error(signResult.error);
    }
    const signedXdr = typeof signResult === 'string' ? signResult : signResult.signedTxXdr;

    // 4. Submit to Horizon
    const result = await server.submitTransaction(TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE));

    return {
      success: true,
      txHash: result.hash,
      ledger: result.ledger,
      timestamp: new Date().toISOString(),
      amount: params.amountXLM,
      destination: params.destinationAddress,
      fee: (parseFloat(BASE_FEE) / 10000000).toString(),
    };
  } catch (error: unknown) {
    console.error('sendXLM failure:', error);
    const code =
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object' &&
      (error as { response?: { data?: unknown } }).response !== null &&
      typeof (error as { response?: { data?: unknown } }).response?.data === 'object' &&
      (error as { response?: { data?: { extras?: { result_codes?: { transaction?: string } } } } }).response?.data !== null
        ? (error as { response?: { data?: { extras?: { result_codes?: { transaction?: string } } } } }).response?.data?.extras
            ?.result_codes?.transaction ?? 'error'
        : 'error';
    return {
      success: false,
      error: parseStellarError(error),
      code,
    };
  }
}

/**
 * Validate a Stellar address
 */
export function validateStellarAddress(address: string): {
  valid: boolean,
  error?: string
} {
  try {
    Keypair.fromPublicKey(address);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid Stellar address format' };
  }
}

// ── App-facing helpers (UI expects these names) ────────────────

export async function checkFreighterConnection(): Promise<boolean> {
  return await isFreighterConnected()
}

export async function connectWallet(): Promise<string> {
  const { publicKey } = await connectFreighter()
  return publicKey || ""
}

export async function getWalletBalance(address: string): Promise<string> {
  const bal = await getXLMBalance(address)
  return bal.toFixed(2)
}

export type PaymentRecord = {
  id: string
  transactionHash: string
  amount: string
  createdAt: string
  to?: string
}

export async function getTransactionHistory(address: string): Promise<PaymentRecord[]> {
  try {
    const page = await server
      .payments()
      .forAccount(address)
      .order('desc')
      .limit(20)
      .call()

    const records: PaymentRecord[] = []

    for (const r of (page.records as any[])) {
      if (r.type !== 'payment') continue
      if (r.asset_type !== 'native') continue
      if (r.to !== address) continue
      if (typeof r.amount !== 'string') continue
      if (typeof r.transaction_hash !== 'string') continue
      if (typeof r.created_at !== 'string') continue

      records.push({
        id: r.transaction_hash,
        transactionHash: r.transaction_hash,
        amount: r.amount,
        createdAt: r.created_at,
        to: r.to,
      })
    }

    return records
  } catch {
    return []
  }
}

/**
 * Bulk disburse XLM to multiple employees
 */
export async function bulkDisburse(
  entries: { destination: string; amount: string; employeeName: string }[],
  currency: string = 'XLM'
): Promise<{ success: boolean; txHash?: string; error?: string }[]> {
  try {
    const pkResult = await getPublicKey();
    if (typeof pkResult !== 'string' && pkResult.error) {
      throw new Error(pkResult.error);
    }
    const sourcePublicKey = typeof pkResult === 'string' ? pkResult : pkResult.address;
    const sourceAccount = await server.loadAccount(sourcePublicKey);
    
    const builder = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    for (const entry of entries) {
      builder.addOperation(
        Operation.payment({
          destination: entry.destination,
          asset: Asset.native(),
          amount: entry.amount,
        })
      );
    }

    const transaction = builder.setTimeout(60).build();
    const xdr = transaction.toXDR();
    const signResult = await signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE });
    const signedXdr = typeof signResult === 'string' ? signResult : signResult.signedTxXdr;
    
    const result = await server.submitTransaction(TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE));
    
    return [{ success: true, txHash: result.hash }];
  } catch (error: any) {
    return [{ success: false, error: parseStellarError(error) }];
  }
}

/**
 * Get transaction details from Horizon by txHash
 */
export async function getTransactionByHash(txHash: string): Promise<{
  txHash: string
  ledger: number
  createdAt: string
  sourceAccount: string
  fee: string
  memo?: string
  successful: boolean
} | null> {
  try {
    const tx = await server.transactions().transaction(txHash).call();
    return {
      txHash: tx.hash,
      ledger: tx.ledger_attr,
      createdAt: tx.created_at,
      sourceAccount: tx.source_account,
      fee: (tx as any).fee_value || (tx as any).fee_charged || '0',
      memo: tx.memo,
      successful: tx.successful,
    };
  } catch {
    return null;
  }
}

/**
 * Catch and convert Horizon errors to human-readable messages
 */
export function parseStellarError(error: unknown): string {
  const errObj = error as unknown;
  const resultCodes =
    typeof errObj === "object" &&
    errObj !== null &&
    "response" in errObj &&
    typeof (errObj as { response?: unknown }).response === "object" &&
    (errObj as { response?: { data?: unknown } }).response !== null &&
    typeof (errObj as { response?: { data?: unknown } }).response?.data === "object" &&
    (errObj as { response?: { data?: { extras?: { result_codes?: unknown } } } }).response?.data !== null
      ? (errObj as { response?: { data?: { extras?: { result_codes?: unknown } } } }).response?.data?.extras?.result_codes
      : undefined;

  const mainCode =
    typeof resultCodes === "object" && resultCodes !== null && "transaction" in resultCodes
      ? (resultCodes as { transaction?: string }).transaction
      : undefined;
  const opCode =
    typeof resultCodes === "object" &&
    resultCodes !== null &&
    "operations" in resultCodes &&
    Array.isArray((resultCodes as { operations?: unknown }).operations)
      ? ((resultCodes as { operations?: string[] }).operations ?? [])[0]
      : undefined;

  const errorMap: Record<string, string> = {
    'op_underfunded': 'Insufficient XLM balance for this transaction',
    'op_no_destination': 'Destination wallet does not exist on Stellar yet',
    'tx_bad_seq': 'Transaction sequence error. Please try again.',
    'op_low_reserve': 'Your wallet needs more XLM to meet the minimum reserve',
    'tx_insufficient_fee': 'Transaction fee too low. Please try again.',
    'tx_bad_auth': 'Wallet authorization failed',
    'tx_expired': 'Transaction expired. Please try again.',
  }

  if (error instanceof Error && error.message === 'User rejected') return 'Transaction rejected in Freighter';
  
  const fallback = error instanceof Error ? error.message : String(error);
  return errorMap[opCode ?? ""] || errorMap[mainCode ?? ""] || fallback || 'An unexpected Stellar error occurred';
}
