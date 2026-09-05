import crypto from "crypto";
import Razorpay from "razorpay";
import { AppError } from "@/src/types";

export class RazorpayConfigError extends AppError {
  constructor(message = "Razorpay is not configured") {
    super(message, 503, "RAZORPAY_NOT_CONFIGURED");
  }
}

export interface RazorpayPlanEntity {
  id: string;
  period: string;
  interval: number;
}

export interface RazorpaySubscriptionEntity {
  id: string;
  plan_id: string;
  status: string;
  current_start: number | null;
  current_end: number | null;
  start_at: number | null;
  end_at: number | null;
  charge_at: number | null;
  notes?: Record<string, string>;
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new RazorpayConfigError(`${name} is not set`);
  }
  return value;
}

/**
 * Returns the public Razorpay key for Checkout. The secret never leaves the server.
 */
export function getRazorpayKeyId(): string {
  return requireEnv("RAZORPAY_KEY_ID");
}

function getRazorpayKeySecret(): string {
  return requireEnv("RAZORPAY_KEY_SECRET");
}

function getWebhookSecret(): string {
  return requireEnv("RAZORPAY_WEBHOOK_SECRET");
}

let razorpayClient: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: getRazorpayKeyId(),
      key_secret: getRazorpayKeySecret(),
    });
  }
  return razorpayClient;
}

export function getRazorpayCurrency(): string {
  return (process.env.RAZORPAY_CURRENCY || "INR").trim().toUpperCase();
}

/**
 * Verifies Razorpay webhook HMAC using the raw request body and a constant-time compare.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", getWebhookSecret())
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export interface RazorpayOrderEntity {
  id: string;
  amount: number | string;
  currency: string;
  receipt?: string;
  status?: string;
}

export class RazorpayApiError extends AppError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode, statusCode === 401 ? "RAZORPAY_AUTH_FAILED" : "RAZORPAY_API_ERROR");
  }
}

function mapRazorpaySdkError(error: unknown): never {
  const err = error as { statusCode?: number; error?: { description?: string }; message?: string };
  const statusCode = err.statusCode === 401 ? 401 : 500;
  const message =
    err.error?.description ||
    err.message ||
    (statusCode === 401 ? "Razorpay authentication failed" : "Razorpay order creation failed");
  throw new RazorpayApiError(message, statusCode);
}

export async function createRazorpayOrder(input: {
  amountPaise: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrderEntity> {
  try {
    const client = getRazorpayClient();
    const order = await client.orders.create({
      amount: input.amountPaise,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
    });
    return order as RazorpayOrderEntity;
  } catch (error) {
    if (error instanceof AppError) throw error;
    mapRazorpaySdkError(error);
  }
}

/**
 * Verifies Standard Checkout payment HMAC: HMAC_SHA256(order_id|payment_id, KEY_SECRET).
 */
export function verifyCheckoutPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", getRazorpayKeySecret())
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(input.signature, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export function unixSecondsToDate(value: number | null | undefined): Date | null {
  if (!value || value <= 0) {
    return null;
  }
  return new Date(value * 1000);
}

export async function createRazorpayPlan(input: {
  name: string;
  amountPaise: number;
  period: "monthly" | "yearly";
}): Promise<RazorpayPlanEntity> {
  const client = getRazorpayClient();
  const plan = await client.plans.create({
    period: input.period,
    interval: 1,
    item: {
      name: input.name,
      amount: input.amountPaise,
      currency: getRazorpayCurrency(),
    },
  });
  return plan as RazorpayPlanEntity;
}

export async function createRazorpaySubscription(input: {
  planId: string;
  totalCount: number;
  notes: Record<string, string>;
}): Promise<RazorpaySubscriptionEntity> {
  const client = getRazorpayClient();
  const subscription = await client.subscriptions.create({
    plan_id: input.planId,
    total_count: input.totalCount,
    quantity: 1,
    customer_notify: 1,
    notes: input.notes,
  });
  return subscription as RazorpaySubscriptionEntity;
}

export async function cancelRazorpaySubscription(
  razorpaySubscriptionId: string,
  cancelAtCycleEnd: boolean
): Promise<RazorpaySubscriptionEntity> {
  const client = getRazorpayClient();
  const subscription = await client.subscriptions.cancel(
    razorpaySubscriptionId,
    cancelAtCycleEnd
  );
  return subscription as RazorpaySubscriptionEntity;
}

export async function fetchRazorpaySubscription(
  razorpaySubscriptionId: string
): Promise<RazorpaySubscriptionEntity> {
  const client = getRazorpayClient();
  const subscription = await client.subscriptions.fetch(razorpaySubscriptionId);
  return subscription as RazorpaySubscriptionEntity;
}
