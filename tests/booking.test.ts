import { beforeEach, describe, expect, it } from "vitest";
import {
  createBookingRequest,
  getDemoOutbox,
  parseBookingRequestInput,
  resetDemoState,
} from "../src/booking.js";
import { DemoValidationError } from "../src/types.js";

const validInput = {
  experienceId: "exp-bansko-loom-patterns",
  visitor: {
    displayName: "Synthetic Demo Visitor",
    email: "visitor@example.com",
  },
  partySize: 2,
  preferredDate: "2026-09-04",
  message: "Synthetic demonstration request only.",
  synthetic: true as const,
};

describe("request-only booking flow", () => {
  beforeEach(() => resetDemoState());

  it("creates a pending receipt with hard no-payment and no-auto-confirm invariants", () => {
    const receipt = createBookingRequest(validInput);

    expect(receipt).toMatchObject({
      experienceId: validInput.experienceId,
      status: "pending_host_confirmation",
      requiresHostConfirmation: true,
      paymentCollected: false,
      automaticallyConfirmed: false,
      synthetic: true,
    });
    expect(receipt.id).toBe("demo-request-0001");
  });

  it("routes an evidence entry without persisting visitor data or free text", () => {
    const receipt = createBookingRequest(validInput);
    const outbox = getDemoOutbox();

    expect(outbox).toHaveLength(1);
    expect(outbox[0]).toMatchObject({
      requestId: receipt.id,
      experienceId: validInput.experienceId,
      hostId: receipt.hostId,
      status: "received",
      synthetic: true,
    });
    expect(JSON.stringify({ receipt, outbox })).not.toContain(validInput.visitor.email);
    expect(JSON.stringify({ receipt, outbox })).not.toContain(validInput.visitor.displayName);
    expect(JSON.stringify({ receipt, outbox })).not.toContain(validInput.message);
  });

  it("rejects a real visitor email domain", () => {
    expect(() =>
      createBookingRequest({
        ...validInput,
        visitor: { displayName: "Real Visitor", email: "visitor@real-domain.invalid" },
      }),
    ).toThrowError(DemoValidationError);

    try {
      createBookingRequest({
        ...validInput,
        visitor: { displayName: "Real Visitor", email: "visitor@real-domain.invalid" },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(DemoValidationError);
      expect((error as DemoValidationError).code).toBe("synthetic_email_required");
    }
  });

  it("rejects unknown experiences", () => {
    expect(() =>
      createBookingRequest({ ...validInput, experienceId: "exp-missing-record" }),
    ).toThrowError("Unknown experienceId");
    expect(getDemoOutbox()).toEqual([]);
  });

  it("validates synthetic-only input boundaries", () => {
    const invalidInputs = [
      { ...validInput, synthetic: false },
      { ...validInput, visitor: { ...validInput.visitor, displayName: "" } },
      { ...validInput, partySize: 0 },
      { ...validInput, preferredDate: "2026-02-30" },
      { ...validInput, message: "x".repeat(501) },
    ];

    for (const input of invalidInputs) {
      expect(() => createBookingRequest(input as typeof validInput)).toThrowError(
        DemoValidationError,
      );
    }
    expect(getDemoOutbox()).toEqual([]);
  });

  it("rejects malformed or unexpectedly extended public inputs", () => {
    expect(() => parseBookingRequestInput(null)).toThrowError("booking-request object");
    expect(() => parseBookingRequestInput({ ...validInput, paymentCollected: true })).toThrowError(
      "unsupported field",
    );
    expect(() =>
      parseBookingRequestInput({
        ...validInput,
        visitor: { ...validInput.visitor, phone: "+000000" },
      }),
    ).toThrowError("visitor contains an unsupported field");
  });
});
