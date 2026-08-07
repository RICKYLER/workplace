import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = parseInt(process.env.SMTP_PORT || "465", 10);
const user = process.env.SMTP_USER || "rickycontiga14@gmail.com";
const pass = process.env.SMTP_PASS || "sffm yuzs phka tmra";
const from = process.env.SMTP_FROM || `"PWA-ACCOUNT" <${user}>`;

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export interface SendVerificationEmailOptions {
  to: string;
  fullName: string;
  verificationLink: string;
  otpCode: string;
}

export async function sendVerificationEmail({
  to,
  fullName,
  verificationLink,
  otpCode,
}: SendVerificationEmailOptions) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #334155; }
        .title { font-size: 24px; font-weight: 700; color: #38bdf8; margin: 10px 0 0 0; }
        .subtitle { font-size: 14px; color: #94a3b8; margin-top: 4px; }
        .content { padding: 24px 0; line-height: 1.6; color: #cbd5e1; }
        .btn-wrapper { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: #ffffff !important; text-decoration: none; padding: 16px 36px; border-radius: 10px; font-weight: 800; font-size: 17px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); text-transform: uppercase; letter-spacing: 0.5px; }
        .otp-box { background: #0f172a; border: 1px dashed #38bdf8; border-radius: 8px; padding: 16px; text-align: center; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #38bdf8; margin: 20px 0; }
        .note-box { background: rgba(56, 189, 248, 0.1); border-left: 4px solid #38bdf8; padding: 14px; border-radius: 6px; font-size: 13px; color: #bae6fd; margin-top: 20px; }
        .footer { font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #334155; padding-top: 20px; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="font-size: 44px;">🎹</div>
          <div class="title">Official Account Registration</div>
          <div class="subtitle">Piano Services Account Confirmation</div>
        </div>
        <div class="content">
          <p style="font-size: 16px;">Hello <strong>${fullName}</strong>,</p>
          <p>Salamat sa imong pag-register! Palihug <strong>i-click ang button sa ubos</strong> para ma-confirm ug ma-official na ang imong pag-register sa <strong>Piano Services</strong>.</p>
          <p><em>(Please click the button below to confirm your email and complete your official registration.)</em></p>
          
          <div class="btn-wrapper">
            <a href="${verificationLink}" class="btn" target="_blank">👉 CLICK HERE TO CONFIRM & REGISTER OFFICIAL 👈</a>
          </div>

          <div class="note-box">
            📌 <strong>Nganong kinahanglan mo click?</strong> Dili pa official ug active ang imong account hangtod dili nimo ma-click ang button sa itaas.
          </div>

          <p style="text-align: center; margin-top: 24px; font-size: 14px; color: #94a3b8;">
            Atua pud kay 6-digit confirmation code kung kinahanglan:
          </p>
          <div class="otp-box">${otpCode}</div>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
            Kon dili ma-click ang button, i-copy ug i-paste kini nga link sa imong web browser:<br>
            <a href="${verificationLink}" style="color: #38bdf8; word-break: break-all;">${verificationLink}</a>
          </p>
        </div>
        <div class="footer">
          <p>Kon wala ka nag-register, palihug pasagdi lang kini nga email.</p>
          <p>&copy; ${new Date().getFullYear()} Piano Services. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from,
    to,
    subject: "🎹 CLICK HERE: Confirm Official Registration - Piano Services",
    html: htmlContent,
  });

  return info;
}
