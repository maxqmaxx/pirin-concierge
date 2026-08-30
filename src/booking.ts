import { getExperience } from "./catalog.js";
import {
  BOOKING_STATUS,
  DemoValidationError,
  OUTBOX_STATUS,
  type BookingRequestInput,
  type BookingRequestReceipt,
  type DemoOutboxEntry,
} from "./types.js";

const DEMO_EMAIL_PATTERN = /^[^\s@]+@example\.com$/u;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const outbox: DemoOutboxEntry[] = [];
let sequence = 0;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertOnlyKeys(
  value: Record<string, unknown>,
  allowed: ReadonlySet<string>,
  objectName: string,
): void {
  const unexpected = Object.keys(value).find((key) => !allowed.has(key));
  if (unexpected) {
    throw new DemoValidationError(
      "unknown_field",
      `${objectName} contains an unsupported field: ${unexpected}.`,
    );
  }
}

function validatePreferredDate(value: string): void {
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new DemoValidationError("invalid_preferred_date", "preferredDate must use YYYY-MM-DD.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
    throw new DemoValidationError("invalid_preferred_date", "preferredDate is not a valid date.");
  }
}

function validateInput(input: BookingRequestInput): void {
  if (input.synthetic !== true) {
    throw new DemoValidationError(
      "synthetic_data_required",
      "This public demonstrator accepts synthetic requests only.",
    );
  }
  if (!getExperience(input.experienceId)) {
    throw new DemoValidationError("experience_not_found", "Unknown experienceId.");
  }
  if (!input.visitor.displayName.trim() || input.visitor.displayName.length > 80) {
    throw new DemoValidationError(
      "invalid_demo_visitor",
      "A short synthetic visitor display name is required.",
    );
  }
  if (input.visitor.email.length > 254 || !DEMO_EMAIL_PATTERN.test(input.visitor.email)) {
    throw new DemoValidationError(
      "synthetic_email_required",
      "Use a synthetic email address in the example.com domain.",
    );
  }
  if (!Number.isInteger(input.partySize) || input.partySize < 1 || input.partySize > 12) {
    throw new DemoValidationError(
      "invalid_party_size",
      "partySize must be an integer from 1 to 12.",
    );
  }
  if (input.preferredDate) {
    validatePreferredDate(input.preferredDate);
  }
  if (input.message && input.message.length > 500) {
    throw new DemoValidationError("message_too_long", "message must be 500 characters or fewer.");
  }
}

export function parseBookingRequestInput(value: unknown): BookingRequestInput {
  if (!isRecord(value) || !isRecord(value.visitor)) {
    throw new DemoValidationError("invalid_request", "A booking-request object is required.");
  }
  assertOnlyKeys(
    value,
    new Set(["experienceId", "visitor", "partySize", "preferredDate", "message", "synthetic"]),
    "booking request",
  );
  assertOnlyKeys(value.visitor, new Set(["displayName", "email"]), "visitor");
  if (
    typeof value.experienceId !== "string" ||
    typeof value.visitor.displayName !== "string" ||
    typeof value.visitor.email !== "string" ||
    typeof value.partySize !== "number" ||
    value.synthetic !== true
  ) {
    throw new DemoValidationError(
      "invalid_request",
      "experienceId, synthetic visitor, partySize and synthetic=true are required.",
    );
  }
  if (value.preferredDate !== undefined && typeof value.preferredDate !== "string") {
    throw new DemoValidationError("invalid_preferred_date", "preferredDate must be a string.");
  }
  if (value.message !== undefined && typeof value.message !== "string") {
    throw new DemoValidationError("invalid_message", "message must be a string.");
  }

  const input: BookingRequestInput = {
    experienceId: value.experienceId,
    visitor: {
      displayName: value.visitor.displayName,
      email: value.visitor.email,
    },
    partySize: value.partySize,
    synthetic: true,
    ...(value.preferredDate !== undefined ? { preferredDate: value.preferredDate } : {}),
    ...(value.message !== undefined ? { message: value.message } : {}),
  };
  validateInput(input);
  return input;
}

export function createBookingRequest(input: BookingRequestInput): BookingRequestReceipt {
  validateInput(input);
  const experience = getExperience(input.experienceId);
  if (!experience) {
    // Kept as a defensive assertion in case the catalogue changes between validation and creation.
    throw new DemoValidationError("experience_not_found", "Unknown experienceId.");
  }

  sequence += 1;
  const id = `demo-request-${String(sequence).padStart(4, "0")}`;
  const createdAt = new Date().toISOString();
  const receipt: BookingRequestReceipt = {
    id,
    experienceId: experience.id,
    hostId: experience.host.id,
    status: BOOKING_STATUS,
    requiresHostConfirmation: true,
    paymentCollected: false,
    automaticallyConfirmed: false,
    synthetic: true,
    createdAt,
  };

  // The visitor object, free-text message and preferred date are intentionally
  // not persisted. The outbox proves routing without exposing PII.
  outbox.push({
    requestId: id,
    experienceId: experience.id,
    hostId: experience.host.id,
    status: OUTBOX_STATUS,
    synthetic: true,
    createdAt,
  });

  return receipt;
}

export function getDemoOutbox(): readonly DemoOutboxEntry[] {
  return outbox.map((entry) => ({ ...entry }));
}

export function resetDemoState(): void {
  outbox.length = 0;
  sequence = 0;
}
