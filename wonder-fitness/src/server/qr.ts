import crypto from "crypto";
import QRCode from "qrcode";

type QrMembership = { membershipId: number; qrSecret: string };

export function createQrToken(membership: QrMembership) {
  const signature = crypto
    .createHmac("sha256", membership.qrSecret)
    .update(String(membership.membershipId))
    .digest("hex")
    .slice(0, 24);
  return `${membership.membershipId}.${signature}`;
}

export function verifyQrToken(token: string, membership: QrMembership) {
  if (!token || !token.includes(".")) return false;
  const [id, signature] = token.split(".");
  if (Number(id) !== membership.membershipId) return false;
  const expected = createQrToken(membership).split(".")[1];
  if (!signature || signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function qrDataUrl(token: string) {
  return QRCode.toDataURL(token, {
    width: 320,
    margin: 2,
    color: { dark: "#0B0F14", light: "#FFFFFF" },
  });
}
