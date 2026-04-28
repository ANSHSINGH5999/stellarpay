'use client';

/**
 * Lightweight Freighter bridge that communicates with the extension directly
 * via window.postMessage — no dynamic import, no webpack chunk, no bundler issues.
 *
 * The Freighter extension injects a content script that listens for these
 * specific postMessage events on window.location.origin.
 */

const REQUEST  = 'FREIGHTER_EXTERNAL_MSG_REQUEST';
const RESPONSE = 'FREIGHTER_EXTERNAL_MSG_RESPONSE';
const TIMEOUT_MS = 3_000;

// Send a message to the Freighter extension and await its response.
function sendToFreighter(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') { reject(new Error('Browser only')); return; }

    const messageId = Date.now() + Math.random();

    const timer = setTimeout(() => {
      window.removeEventListener('message', listener);
      reject(new Error('Freighter not found. Install the Freighter browser extension.'));
    }, TIMEOUT_MS);

    const listener = (event: MessageEvent) => {
      if (
        event.source === window &&
        event.data?.source === RESPONSE &&
        event.data?.messagedId === messageId
      ) {
        clearTimeout(timer);
        window.removeEventListener('message', listener);
        resolve(event.data as Record<string, unknown>);
      }
    };

    window.addEventListener('message', listener, false);
    window.postMessage({ source: REQUEST, messageId, ...payload }, window.location.origin);
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function freighterIsConnected(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await sendToFreighter({ type: 'REQUEST_CONNECTION_STATUS' });
    return Boolean(res.isConnected);
  } catch {
    return false;
  }
}

export async function freighterRequestAccess(): Promise<string> {
  const res = await sendToFreighter({ type: 'REQUEST_ACCESS' });
  if (res.apiError) throw new Error(String((res.apiError as Record<string,unknown>)?.message ?? res.apiError));
  const key = res.publicKey as string;
  if (!key) throw new Error('No address returned from Freighter');
  return key;
}

export async function freighterGetNetworkPassphrase(): Promise<string> {
  try {
    const res = await sendToFreighter({ type: 'REQUEST_NETWORK_DETAILS' });
    const details = res.networkDetails as Record<string, string> | undefined;
    return details?.networkPassphrase ?? '';
  } catch {
    return '';
  }
}

export async function freighterSignTransaction(
  transactionXdr: string,
  networkPassphrase: string
): Promise<string> {
  const res = await sendToFreighter({
    type: 'SUBMIT_TRANSACTION',
    transactionXdr,
    networkPassphrase,
  });
  if (res.apiError) throw new Error(String((res.apiError as Record<string,unknown>)?.message ?? res.apiError));
  const signed = res.signedTransaction as string;
  if (!signed) throw new Error('Freighter returned no signed transaction');
  return signed;
}
