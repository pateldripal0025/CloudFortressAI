const fs = require('fs');
const path = require('path');

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // Graceful fallback if nodemailer is not installed yet
  nodemailer = null;
}

const config = require('../config/config');

/**
 * Sends a transactional security email.
 * Attempts to connect via Nodemailer SMTP if configured in .env.
 * Falls back gracefully to console logs and an email log file to prevent app crashes.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const host = config.smtp.host;
  const port = config.smtp.port;
  const user = config.smtp.user;
  const pass = config.smtp.pass;
  const from = config.smtp.from;

  console.log(`[Email Service] Attempting to dispatch email to: ${to} | Subject: ${subject}`);

  // 1. Try sending via Nodemailer if SMTP is configured
  if (nodemailer && host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port == 465,
        auth: { user, pass }
      });

      const info = await transporter.sendMail({
        from: `"CloudFortress AI Security" <${from}>`,
        to,
        subject,
        text: text || subject,
        html
      });

      console.log(`[Email Service] Nodemailer sent successfully. MessageID: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error('[Email Service] Nodemailer SMTP failed. Falling back to log spooler:', err.message);
    }
  }

  // 2. Resilient Spooler Fallback (Zero-Dependency & Offline Safe)
  const spoolDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(spoolDir)) {
    fs.mkdirSync(spoolDir, { recursive: true });
  }
  
  const spoolFile = path.join(spoolDir, 'email_spooler.log');
  const timestamp = new Date().toISOString();
  const logEntry = `
=========================================
[SMTP SPOOLER FALLBACK] - ${timestamp}
To: ${to}
Subject: ${subject}
-----------------------------------------
${text || 'HTML Content Below:'}
-----------------------------------------
${html}
=========================================
\n`;

  fs.appendFileSync(spoolFile, logEntry, 'utf-8');
  console.log(`[Email Service] Spooled to local logs: ${spoolFile}`);
  console.log(`[EMAIL DISPATCH MOCK]: To check verification links, OTPs or passwords, view: ${spoolFile}`);
  return true;
};

/**
 * Builds standard enterprise verification email templates.
 */
const sendVerificationEmail = async (email, name, otp, link) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; background-color: #0b1329; color: #f8fafc; border-radius: 12px;">
      <h2 style="color: #00e5ff; font-weight: bold;">🛡️ CloudFortress AI Security</h2>
      <p>Hello ${name},</p>
      <p>Welcome to CloudFortress AI. To complete initialization of your security profile, please verify your email address using the One-Time Password (OTP) or the direct link below.</p>
      
      <div style="background-color: #0f172a; padding: 15px; border-radius: 8px; border: 1px solid #334155; margin: 20px 0; text-align: center;">
        <span style="font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.1em;">Your Verification OTP Code</span>
        <h1 style="color: #00e5ff; margin: 5px 0; letter-spacing: 0.2em; font-size: 32px;">${otp}</h1>
        <span style="font-size: 11px; color: #ef4444;">This OTP code expires in 15 minutes.</span>
      </div>

      <p>Alternatively, click the secure verification link below:</p>
      <a href="${link}" style="display: inline-block; background-color: #00e5ff; color: #0b1329; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 10px 0;">Verify Account Access</a>

      <p style="font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px;">
        If you did not initiate this registration request, please ignore this email.
      </p>
    </div>
  `;
  
  const text = `CloudFortress AI: Verify your account using OTP: ${otp} or Link: ${link}`;
  return await sendEmail({ to: email, subject: '🛡️ Verify Your CloudFortress AI Profile', html, text });
};

/**
 * Builds standard password reset email templates.
 */
const sendPasswordResetEmail = async (email, name, link) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; background-color: #0b1329; color: #f8fafc; border-radius: 12px;">
      <h2 style="color: #00e5ff; font-weight: bold;">🛡️ CloudFortress AI Security</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset the password associated with your security operator profile.</p>
      
      <p>Click the secure link below to reset your password. This link will expire in 1 hour:</p>
      <a href="${link}" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 10px 0;">Reset Password Credentials</a>

      <p style="font-size: 11px; color: #64748b; margin-top: 20px;">
        Link: <a href="${link}" style="color: #00e5ff;">${link}</a>
      </p>

      <p style="font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px;">
        If you did not request a password reset, please change your login password immediately and contact your IT Admin.
      </p>
    </div>
  `;
  
  const text = `CloudFortress AI: Reset your password credentials using Link: ${link}`;
  return await sendEmail({ to: email, subject: '🚨 Security Alert: Password Reset Requested', html, text });
};

/**
 * Builds security notification email templates.
 */
const sendSecurityNotificationEmail = async (email, name, eventType, details) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ef4444; background-color: #0f172a; color: #f8fafc; border-radius: 12px;">
      <h2 style="color: #ef4444; font-weight: bold;">🚨 CloudFortress AI: Security Alert</h2>
      <p>Hello ${name},</p>
      <p>This is an automated real-time notification regarding an active event on your operator profile.</p>
      
      <div style="background-color: #020617; padding: 15px; border-radius: 8px; border: 1px solid #1e293b; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Event Type:</strong> <span style="color: #ef4444;">${eventType}</span></p>
        <p style="margin: 5px 0;"><strong>Timestamp:</strong> ${new Date().toUTCString()}</p>
        <p style="margin: 5px 0;"><strong>Details:</strong> ${details}</p>
      </div>

      <p style="font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 15px; margin-top: 25px;">
        If this was not you, please log out from all active devices and secure your password credentials immediately.
      </p>
    </div>
  `;
  
  const text = `CloudFortress AI Security Alert: ${eventType} - ${details}`;
  return await sendEmail({ to: email, subject: `🚨 Security Notification: ${eventType}`, html, text });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSecurityNotificationEmail
};
