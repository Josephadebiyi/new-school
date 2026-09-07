import { useEffect, useState } from 'react';
import { fetchCountries, fetchPaymentMethods } from '../services/api';

const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0B3B2C] focus:ring-2 focus:ring-[#0B3B2C]/10 text-[#1a1a1a] text-sm transition-all';
const labelClass = 'block text-sm font-semibold text-[#1a1a1a] mb-2';

// Shared country + payment method picker for both the application-fee and
// tuition payment flows. Flutterwave's current API needs us to specify the
// payment method up front (card fields or mobile money network/phone),
// unlike a hosted-checkout redirect — so this collects exactly what the
// backend's payment_method object needs.
export default function PaymentMethodPicker({ value, onChange }) {
  const [countries, setCountries] = useState([]);
  const [methods, setMethods] = useState([{ type: 'card', label: 'Debit/Credit Card' }]);
  const [loadingMethods, setLoadingMethods] = useState(false);

  useEffect(() => {
    fetchCountries().then(setCountries).catch(() => {});
  }, []);

  useEffect(() => {
    if (!value.country) return;
    setLoadingMethods(true);
    fetchPaymentMethods(value.country)
      .then(({ methods: m }) => {
        setMethods(m);
        // If the previously selected method type isn't available for this
        // country, fall back to card.
        if (!m.find((x) => x.type === value.payment_method?.type)) {
          onChange({ ...value, payment_method: { type: 'card' } });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMethods(false));
  }, [value.country]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedMethod = methods.find((m) => m.type === value.payment_method?.type) || methods[0];

  const updateMethodField = (field, fieldValue) => {
    onChange({ ...value, payment_method: { ...value.payment_method, [field]: fieldValue } });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Country *</label>
        <select
          className={inputClass}
          value={value.country || ''}
          onChange={(e) => onChange({ ...value, country: e.target.value, payment_method: { type: 'card' } })}
        >
          <option value="" disabled>Select your country</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      {value.country && (
        <div>
          <label className={labelClass}>Payment Method *</label>
          {loadingMethods ? (
            <p className="text-sm text-gray-400">Loading available methods…</p>
          ) : (
            <div className="flex gap-2 flex-wrap mb-3">
              {methods.map((m) => (
                <button
                  key={m.type}
                  type="button"
                  onClick={() => onChange({ ...value, payment_method: { type: m.type } })}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors cursor-pointer ${
                    value.payment_method?.type === m.type
                      ? 'bg-[#0B3B2C] text-white border-[#0B3B2C]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#0B3B2C]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {value.payment_method?.type === 'card' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Card Number *</label>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={19}
                  placeholder="4242 4242 4242 4242"
                  value={value.payment_method?.card_number || ''}
                  onChange={(e) => updateMethodField('card_number', e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              <div>
                <label className={labelClass}>Expiry Month *</label>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="MM"
                  value={value.payment_method?.expiry_month || ''}
                  onChange={(e) => updateMethodField('expiry_month', e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              <div>
                <label className={labelClass}>Expiry Year *</label>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="YYYY"
                  value={value.payment_method?.expiry_year || ''}
                  onChange={(e) => updateMethodField('expiry_year', e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              <div>
                <label className={labelClass}>CVV *</label>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="123"
                  value={value.payment_method?.cvv || ''}
                  onChange={(e) => updateMethodField('cvv', e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
            </div>
          )}

          {value.payment_method?.type === 'mobile_money' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Network *</label>
                <select
                  className={inputClass}
                  value={value.payment_method?.network || ''}
                  onChange={(e) => updateMethodField('network', e.target.value)}
                >
                  <option value="" disabled>Select network</option>
                  {(selectedMethod?.networks || []).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Mobile Number *</label>
                <input
                  className={inputClass}
                  inputMode="tel"
                  placeholder="0700000000"
                  value={value.payment_method?.phone_number || ''}
                  onChange={(e) => updateMethodField('phone_number', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function isPaymentMethodComplete(value) {
  if (!value.country || !value.payment_method?.type) return false;
  if (value.payment_method.type === 'card') {
    const { card_number, expiry_month, expiry_year, cvv } = value.payment_method;
    return !!(card_number && expiry_month && expiry_year && cvv);
  }
  if (value.payment_method.type === 'mobile_money') {
    const { network, phone_number } = value.payment_method;
    return !!(network && phone_number);
  }
  return false;
}

export function buildCountryCode(countryCode) {
  // Best-effort dialing code for the mobile_money.country_code field —
  // covers the countries we actually offer mobile money for.
  const codes = {
    KE: '254', UG: '256', TZ: '255', GH: '233', ZM: '260', RW: '250',
    CI: '225', SN: '221', BJ: '229', BF: '226', ML: '223', NE: '227', TG: '228',
    CM: '237', GA: '241', MW: '265'
  };
  return codes[countryCode] || '';
}
