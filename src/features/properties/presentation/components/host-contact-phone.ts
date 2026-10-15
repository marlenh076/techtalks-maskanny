/** Preserve local numbers for calling; never guess a country code for WhatsApp. */
export function hostContactPhone(value: string | null | undefined) {
  const display = value?.trim();
  if (!display || !/^\+?[\d\s().-]+$/.test(display)) return null;
  const compact = display.replace(/[\s().-]/g, "");
  const international = compact.startsWith("00") ? `+${compact.slice(2)}` : compact;
  const validInternational = /^\+[1-9]\d{6,14}$/.test(international);
  if (!validInternational && !/^\d{7,15}$/.test(compact)) return null;
  // A malformed international prefix must not be treated as a local number.
  if ((compact.startsWith("00") || compact.startsWith("+")) && !validInternational) return null;
  return {
    display,
    tel: `tel:${international}`,
    whatsapp: validInternational ? `https://wa.me/${international.slice(1)}` : null,
  };
}
