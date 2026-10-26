import nodemailer, { type Transporter } from "nodemailer";
import { AppError } from "@/server/errors";

export type OtpPurpose = "VERIFY_EMAIL" | "RESET_PASSWORD";

type MailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

let transporter: Transporter | null = null;

function mailConfig(): MailConfig {
  const user = process.env.SMTP_USER?.trim() ?? "";
  // Gmail app passwords are shown with spaces ("abcd efgh ijkl mnop") but accepted without.
  const pass = (process.env.SMTP_PASS ?? "").replace(/\s+/g, "");
  if (!user || !pass) {
    throw new AppError("MAIL_NOT_CONFIGURED", 500, "Chưa cấu hình email gửi OTP. Vui lòng liên hệ quản trị viên.");
  }
  return {
    host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    user,
    pass,
    from: process.env.MAIL_FROM?.trim() || `Wonder Fitness <${user}>`,
  };
}

function getTransporter() {
  if (transporter) return transporter;
  const config = mailConfig();
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  });
  return transporter;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const COPY: Record<OtpPurpose, { subject: string; heading: string; intro: string; action: string }> = {
  VERIFY_EMAIL: {
    subject: "Mã xác thực liên kết email — Wonder Fitness",
    heading: "Liên kết email của bạn",
    intro: "Bạn vừa yêu cầu liên kết email này với tài khoản Wonder Fitness. Nhập mã bên dưới để hoàn tất:",
    action: "Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email — tài khoản của bạn vẫn an toàn.",
  },
  RESET_PASSWORD: {
    subject: "Đặt lại mật khẩu — Wonder Fitness",
    heading: "Đặt lại mật khẩu",
    intro: "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Wonder Fitness của bạn. Nhập mã bên dưới để tiếp tục:",
    action: "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này và đổi mật khẩu nếu bạn nghi ngờ tài khoản bị xâm nhập.",
  },
};

function otpTemplate(input: { name?: string | null; code: string; purpose: OtpPurpose; ttlMinutes: number }) {
  const copy = COPY[input.purpose];
  const greeting = input.name ? `Xin chào ${escapeHtml(input.name)},` : "Xin chào,";
  const digits = input.code.split("");

  return `<!doctype html>
<html lang="vi">
  <body style="margin:0;padding:0;background:#f7f8fa;font-family:'Be Vietnam Pro',Segoe UI,Arial,sans-serif;color:#0b0f14;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;border:1px solid #e7eaf0;overflow:hidden;">
            <tr>
              <td style="background:#0b0f14;padding:22px 28px;">
                <span style="display:inline-block;font-size:18px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;">
                  WONDER<span style="color:#ff4d1c;">.</span> FITNESS
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px 8px;">
                <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">${greeting}</p>
                <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;font-weight:800;color:#0b0f14;">${copy.heading}</h1>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">${copy.intro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    ${digits
                      .map(
                        (d) =>
                          `<td style="padding:0 4px;"><span style="display:inline-block;width:44px;height:52px;line-height:52px;text-align:center;font-size:26px;font-weight:800;letter-spacing:0.04em;color:#ff4d1c;background:#ffede6;border-radius:12px;">${escapeHtml(
                            d
                          )}</span></td>`
                      )
                      .join("")}
                  </tr>
                </table>
                <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#6b7280;">
                  Mã có hiệu lực trong <strong>${input.ttlMinutes} phút</strong> và chỉ dùng được một lần.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 32px;">
                <div style="border-top:1px solid #e7eaf0;padding-top:16px;">
                  <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">${copy.action}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:#f7f8fa;padding:18px 28px;border-top:1px solid #e7eaf0;">
                <p style="margin:0;font-size:11px;line-height:1.6;color:#9ca3af;">
                  Wonder Fitness · 5 chi nhánh tại Đà Nẵng · Hotline 0236 3888 100<br />
                  Email này được gửi tự động, vui lòng không trả lời.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendOtpMail(input: {
  to: string;
  code: string;
  purpose: OtpPurpose;
  name?: string | null;
  ttlMinutes: number;
}) {
  const config = mailConfig();
  const copy = COPY[input.purpose];

  try {
    await getTransporter().sendMail({
      from: config.from,
      to: input.to,
      subject: copy.subject,
      text: `${copy.heading}\n\n${copy.intro}\n\nMã xác thực: ${input.code}\n\nMã có hiệu lực trong ${input.ttlMinutes} phút và chỉ dùng được một lần.\n\n${copy.action}`,
      html: otpTemplate(input),
    });
  } catch (error) {
    console.error("[mail] send failed", error);
    transporter = null;
    throw new AppError(
      "MAIL_SEND_FAILED",
      502,
      "Không gửi được email OTP. Vui lòng kiểm tra lại địa chỉ email và thử lại."
    );
  }
}
