import { lebanesePhoneSchema } from "@/src/features/users/validation/user.schema";

const separators = /[\s().-]/g;

function withoutCountryCode(value: string): string {
  const compact = value.trim().replace(separators, "");
  if (compact.startsWith("+961")) return compact.slice(4);
  if (compact.startsWith("00961")) return compact.slice(5);
  if (compact.startsWith("961")) return compact.slice(3);
  return compact;
}

/** Keep the fixed prefix out of the editable field when a full number is pasted or autofilled. */
export function localPhoneInput(value: string): string {
  const local = withoutCountryCode(value);
  if (local !== value.trim().replace(separators, "")) {
    return /^[135]\d{6}$/.test(local) ? `0${local}` : local;
  }
  return value;
}

export function normalizeLebanesePhone(value: string): { national: string; e164: string } | null {
  const local = withoutCountryCode(value);
  const national = /^[135]\d{6}$/.test(local) ? `0${local}` : local;
  if (!lebanesePhoneSchema.safeParse(national).success) return null;
  return { national, e164: `+961${national.replace(/^0/, "")}` };
}
