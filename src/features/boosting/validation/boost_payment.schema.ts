import { z } from "zod";

export const boostPaymentReferenceSchema = z
  .string()
  .trim()
  .transform((reference) => reference || null)
  .pipe(
    z
      .string()
      .regex(/^[A-Za-z0-9][A-Za-z0-9 /_-]{2,99}$/)
      .nullable(),
  );

export const MAX_BOOST_RECEIPT_SIZE = 5 * 1024 * 1024;
export const MAX_BOOST_PAYMENT_BODY_SIZE = MAX_BOOST_RECEIPT_SIZE + 64 * 1024;

export function receiptFormat(bytes: Uint8Array, mimeType: string) {
  const png =
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
  if (mimeType === "image/png" && png) return { extension: "png", contentType: mimeType };

  const jpeg =
    bytes.length >= 4 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff &&
    bytes[bytes.length - 1] === 0xd9;
  if (mimeType === "image/jpeg" && jpeg) return { extension: "jpg", contentType: mimeType };

  const pdf =
    bytes.length >= 5 && [37, 80, 68, 70, 45].every((byte, index) => bytes[index] === byte);
  if (mimeType === "application/pdf" && pdf) return { extension: "pdf", contentType: mimeType };

  return null;
}
