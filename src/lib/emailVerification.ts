import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseclient';

export type OtpType = 'signup' | 'email' | 'recovery';

export interface AuthUrlParams {
  code: string | null;
  tokenHash: string | null;
  otpType: OtpType;
  hasAuthHash: boolean;
}

function parseOtpType(value: string | null | undefined): OtpType {
  if (value === 'email' || value === 'recovery' || value === 'signup') {
    return value;
  }
  return 'signup';
}

function isAuthHashFragment(hash: string): boolean {
  return (
    hash.includes('access_token') ||
    hash.includes('type=signup') ||
    hash.includes('type=recovery') ||
    hash.includes('type=email')
  );
}

/**
 * Read Supabase auth params from the browser URL (primary) with optional router fallbacks.
 */
export function parseAuthParamsFromUrl(
  routerQuery?: Record<string, string | string[] | undefined>
): AuthUrlParams {
  let code: string | null = null;
  let tokenHash: string | null = null;
  let otpType: OtpType = 'signup';
  let hasAuthHash = false;

  if (typeof window !== 'undefined') {
    const search = new URLSearchParams(window.location.search);
    code = search.get('code');
    tokenHash = search.get('token_hash');
    otpType = parseOtpType(search.get('type'));
    hasAuthHash = isAuthHashFragment(window.location.hash);
  }

  if (routerQuery) {
    if (!code && typeof routerQuery.code === 'string') {
      code = routerQuery.code;
    }
    if (!tokenHash && typeof routerQuery.token_hash === 'string') {
      tokenHash = routerQuery.token_hash;
    }
    if (typeof routerQuery.type === 'string') {
      otpType = parseOtpType(routerQuery.type);
    }
  }

  return { code, tokenHash, otpType, hasAuthHash };
}

function hasAuthParams(params: AuthUrlParams): boolean {
  return Boolean(params.code || params.tokenHash || params.hasAuthHash);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Establish a Supabase session from email verification redirect params.
 * Tries hash detection, token_hash OTP, then PKCE code (non-fatal on failure).
 */
export async function establishSupabaseSession(
  routerQuery?: Record<string, string | string[] | undefined>
): Promise<Session | null> {
  const params = parseAuthParamsFromUrl(routerQuery);

  if (typeof window === 'undefined') {
    return null;
  }

  if (params.hasAuthHash) {
    await delay(1000);
  } else if (hasAuthParams(params)) {
    await delay(500);
  }

  const initial = await supabase.auth.getSession();
  if (initial.data.session) {
    return initial.data.session;
  }

  if (params.tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: params.tokenHash,
      type: params.otpType,
    });
    if (error) {
      console.error('[emailVerification] verifyOtp failed:', error.message);
    } else {
      const afterOtp = await supabase.auth.getSession();
      if (afterOtp.data.session) {
        return afterOtp.data.session;
      }
    }
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) {
      console.error('[emailVerification] PKCE exchange failed:', error.message);
    } else {
      const afterCode = await supabase.auth.getSession();
      if (afterCode.data.session) {
        return afterCode.data.session;
      }
    }
  }

  if (params.hasAuthHash) {
    await delay(500);
    const retry = await supabase.auth.getSession();
    if (retry.data.session) {
      return retry.data.session;
    }
  }

  return null;
}

export interface ConfirmProfileEmailParams {
  apiPath: string;
  email: string;
  status: string;
}

export interface ConfirmProfileEmailResult {
  ok: boolean;
  data: unknown;
  adminNotificationSent?: boolean;
}

function parseConfirmProfileResponse(data: unknown): {
  adminNotificationSent?: boolean;
} {
  if (data && typeof data === "object" && "adminNotificationSent" in data) {
    const sent = (data as { adminNotificationSent?: unknown })
      .adminNotificationSent;
    if (typeof sent === "boolean") {
      return { adminNotificationSent: sent };
    }
  }
  return {};
}

/**
 * Update profile status after email verification and trigger admin notification.
 */
export async function confirmProfileEmail(
  params: ConfirmProfileEmailParams
): Promise<ConfirmProfileEmailResult> {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${origin}${params.apiPath}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: params.email, status: params.status }),
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  const { adminNotificationSent } = parseConfirmProfileResponse(data);

  return { ok: response.ok, data, adminNotificationSent };
}

/**
 * Resolve the authenticated user's email after verification, with a short retry
 * if email_confirmed_at is not yet populated.
 */
export async function resolveVerifiedUserEmail(
  getUser: () => Promise<{
    data: { user: { email?: string | null; email_confirmed_at?: string | null } | null };
    error: { message: string } | null;
  }>,
  delayMs: (ms: number) => Promise<void>
): Promise<string | null> {
  const first = await getUser();
  if (first.error || !first.data.user?.email) {
    return null;
  }

  if (first.data.user.email_confirmed_at) {
    return first.data.user.email;
  }

  await delayMs(500);

  const retry = await getUser();
  if (retry.error || !retry.data.user?.email) {
    return null;
  }

  return retry.data.user.email;
}

/**
 * Clean auth params from the URL after verification processing.
 */
export function cleanVerificationUrl(pathname: string): void {
  if (typeof window !== 'undefined') {
    window.history.replaceState(null, '', pathname);
  }
}
