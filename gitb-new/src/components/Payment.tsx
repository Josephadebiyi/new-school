import { useEffect, useState } from "react";
import { fetchCountries } from "../services/api";

// Country-of-residence picker. Flutterwave's own checkout widget decides
// which payment methods to show (card, bank transfer, USSD, mobile money)
// based on the currency we tell it to charge in — we don't build per-method
// forms ourselves, we just need to know which currency to charge.
export function CountryPicker({ country, onChange }: { country: string; onChange: (country: string) => void }) {
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    fetchCountries().then(setCountries).catch(() => {});
  }, []);

  return (
    <label className="block">
      <span className="label">Country of residence *</span>
      <select className="field" value={country || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>
          Select your country
        </option>
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export interface PaymentSession {
  reference: string;
  amount: number;
  currency: string;
  public_key: string;
  customer: { email: string; name: string };
}

declare global {
  interface Window {
    FlutterwaveCheckout?: (opts: Record<string, unknown>) => void;
  }
}

// Launches Flutterwave's hosted checkout widget. `payment` must be
// { reference, amount, currency, public_key, customer } as returned by the
// backend's create/pay endpoint. The real confirmation always happens
// server-side afterwards (via webhook + status polling) — never trust the
// widget's own callback alone.
export function openFlutterwaveCheckout(
  payment: PaymentSession,
  { title, description, onSuccessRef, onClose }: { title?: string; description?: string; onSuccessRef: (reference: string) => void; onClose?: () => void },
) {
  if (typeof window === "undefined" || !window.FlutterwaveCheckout) {
    throw new Error("Payment widget failed to load. Please refresh the page and try again.");
  }
  const fullName = (payment.customer.name || "").trim();
  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ") || firstName || "Student";

  window.FlutterwaveCheckout({
    public_key: payment.public_key,
    tx_ref: payment.reference,
    amount: payment.amount,
    currency: payment.currency,
    // The classic Inline widget validates flat customer_* fields — a nested
    // "customer" object alone isn't recognized and throws
    // "Invalid parameter (`customer_email`)". Sending both shapes covers
    // whichever the loaded script version actually reads.
    customer_email: payment.customer.email,
    customer_firstname: firstName || "Student",
    customer_lastname: lastName,
    customer: {
      email: payment.customer.email,
      name: fullName || "Student",
    },
    customizations: {
      title: title || "GITB",
      description: description || "GITB payment",
      logo: "https://gitb.lt/images/gitb-logo.png",
    },
    callback: () => {
      onSuccessRef(payment.reference);
    },
    onclose: () => {
      if (onClose) onClose();
    },
  });
}
