import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SentEmailLog {
  id: string;
  to: string;
  subject: string;
  timestamp: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private recentEmails: SentEmailLog[] = [];

  async onModuleInit() {
    await this.initTransporter();
  }

  private async initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (host && user && pass) {
      this.logger.log(`Initializing Production SMTP Transport -> ${host}:${port} (${user})`);
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });
    } else if (host) {
      this.logger.log(`Initializing Direct SMTP Transport -> ${host}:${port}`);
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        tls: { rejectUnauthorized: false },
      });
    } else {
      this.logger.log('SMTP credentials not yet configured in environment. Ready to receive SMTP details via .env.');
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  async sendPasswordResetOtp(to: string, otp: string, recipientName: string = 'Faculty / Staff Member') {
    if (!this.transporter) {
      await this.initTransporter();
    }

    const fromAddress = process.env.SMTP_FROM || '"Oakridge International Academy" <security@oakridge-academy.edu>';
    const subject = `Oakridge ERP - Password Recovery OTP: ${otp}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      color: #1e293b;
    }
    .wrapper {
      max-width: 580px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 13px;
      color: #94a3b8;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 15px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 16px;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .otp-box {
      background: #f1f5f9;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 24px 16px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-label {
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #2563eb;
      margin: 0;
    }
    .badge {
      display: inline-block;
      margin-top: 10px;
      padding: 4px 12px;
      background: #dbeafe;
      color: #1e40af;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }
    .security-notice {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin-top: 24px;
      font-size: 13px;
      color: #991b1b;
      line-height: 1.5;
    }
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Oakridge International Academy</h1>
      <p>Institutional ERP Security Operations Center</p>
    </div>
    <div class="content">
      <div class="greeting">Hello, ${recipientName}</div>
      <div class="message">
        We received a request to verify your identity and reset the security password for your institutional account (<b>${to}</b>).
      </div>
      
      <div class="otp-box">
        <div class="otp-label">One-Time Verification Code (OTP)</div>
        <div class="otp-code">${otp}</div>
        <div class="badge">Valid for 10 minutes</div>
      </div>

      <div class="message">
        Please enter this 6-digit verification code into the password recovery prompt to verify your account and configure a new security password.
      </div>

      <div class="security-notice">
        <b>Security Alert:</b> If you did not initiate this password reset request, please do not share this code with anyone. Your account credentials remain secure.
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Oakridge International Academy • Automated ERP Identity Dispatcher
    </div>
  </div>
</body>
</html>
`;

    const textContent = `
Oakridge International Academy - Password Recovery OTP

Hello ${recipientName},

We received a request to reset the password for your account (${to}).

Your One-Time Password (OTP) verification code is: ${otp}

This verification code is valid for 10 minutes.

If you did not request this password reset, please ignore this email or contact system administration.

--
Oakridge International Academy ERP Security Center
`;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });

      this.logger.log(`Password reset OTP dispatched to ${to} (MessageId: ${info.messageId || 'sent'})`);

      const logItem: SentEmailLog = {
        id: info.messageId || `msg_${Date.now()}`,
        to,
        subject,
        timestamp: new Date().toISOString(),
      };

      this.recentEmails.unshift(logItem);
      if (this.recentEmails.length > 50) {
        this.recentEmails.pop();
      }

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err) {
      this.logger.error(`Failed to dispatch email to ${to}: ${err.message}`, err.stack);
      throw err;
    }
  }

  getRecentEmails(): SentEmailLog[] {
    return this.recentEmails;
  }
}
