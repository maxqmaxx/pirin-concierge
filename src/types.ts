export const BOOKING_STATUS = "pending_host_confirmation" as const;
export const OUTBOX_STATUS = "received" as const;

export interface IndicativePrice {
  amount: number;
  currency: "EUR";
}

export interface ExperienceHost {
  id: string;
  displayName: string;
  synthetic: true;
}

export interface ExperienceAvailability {
  mode: "by_request";
  note: string;
}

export interface Experience {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  settlement: string;
  languages: string[];
  durationMinutes: number;
  indicativePrice: IndicativePrice;
  host: ExperienceHost;
  availability: ExperienceAvailability;
  synthetic: true;
  bookingMode: "request_only";
  confirmationMode: "host_required";
  paymentMode: "off_platform_direct_to_host";
}

export interface ExperienceSearchOptions {
  query?: string;
  area?: string;
  category?: string;
  language?: string;
  limit?: number;
}

export interface ConciergeInput extends ExperienceSearchOptions {
  query: string;
}

export interface ConciergeMatch {
  experience: Experience;
  sourceUrl: string;
}

export interface ConciergeSource {
  index: number;
  experienceId: string;
  title: string;
  url: string;
}

export interface ConciergeResult {
  answer: string;
  matches: ConciergeMatch[];
  sources: ConciergeSource[];
  groundedInCatalog: true;
  synthetic: true;
}

export interface BookingVisitorInput {
  displayName: string;
  email: string;
}

export interface BookingRequestInput {
  experienceId: string;
  visitor: BookingVisitorInput;
  partySize: number;
  preferredDate?: string;
  message?: string;
  synthetic: true;
}

/**
 * Public booking-request receipt. Visitor fields are deliberately absent: the
 * demonstrator validates and immediately discards them instead of persisting PII.
 */
export interface BookingRequestReceipt {
  id: string;
  experienceId: string;
  hostId: string;
  status: typeof BOOKING_STATUS;
  requiresHostConfirmation: true;
  paymentCollected: false;
  automaticallyConfirmed: false;
  synthetic: true;
  createdAt: string;
}

export interface DemoOutboxEntry {
  requestId: string;
  experienceId: string;
  hostId: string;
  status: typeof OUTBOX_STATUS;
  synthetic: true;
  createdAt: string;
}

export class DemoValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DemoValidationError";
    this.code = code;
  }
}
