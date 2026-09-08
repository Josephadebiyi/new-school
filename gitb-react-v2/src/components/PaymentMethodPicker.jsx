import { useEffect, useState } from 'react';
import { fetchCountries } from '../services/api';

const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0B3B2C] focus:ring-2 focus:ring-[#0B3B2C]/10 text-[#1a1a1a] text-sm transition-all';
const labelClass = 'block text-sm font-semibold text-[#1a1a1a] mb-2';

// Country-of-residence picker. Flutterwave's own checkout widget decides
// which payment methods to show (card, bank transfer, USSD, mobile money)
// based on the currency we tell it to charge in — we don't build per-method
// forms ourselves, we just need to know which currency to charge.
export default function CountryPicker({ country, onChange }) {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetchCountries().then(setCountries).catch(() => {});
  }, []);

  return (
    <div>
      <label className={labelClass}>Country of Residence *</label>
      <select className={inputClass} value={country || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>Select your country</option>
        {countries.map((c) => (
          <option key={c.code} value={c.code}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}

// Launches Flutterwave's hosted checkout widget. `payment` must be
// { reference, amount, currency, public_key, customer } as returned by the
// backend's create/pay endpoint. Resolves/rejects based on what the widget
// reports, but the real confirmation always happens server-side afterwards
// (via webhook + status polling), never trust this alone.
export function openFlutterwaveCheckout(payment, { title, description, onSuccessRef, onClose }) {
  if (typeof window === 'undefined' || !window.FlutterwaveCheckout) {
    throw new Error('Payment widget failed to load. Please refresh the page and try again.');
  }
  window.FlutterwaveCheckout({
    public_key: payment.public_key,
    tx_ref: payment.reference,
    amount: payment.amount,
    currency: payment.currency,
    customer: {
      email: payment.customer.email,
      name: payment.customer.name,
    },
    customizations: {
      title: title || 'GITB',
      description: description || 'GITB payment',
      logo: 'https://gitb.lt/images/gitb-logo.png',
    },
    callback: () => {
      onSuccessRef(payment.reference);
    },
    onclose: () => {
      if (onClose) onClose();
    },
  });
}
