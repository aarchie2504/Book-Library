import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

// ── In-memory OTP store ───────────────────────────────────────────────────────
const otpStore = new Map();           // for forgot-password
const changePwdOtpStore = new Map();  // for change-password OTP

// ── Brevo Email Sender (HTTP API) ─────────────────────────────────────────────
const sendBrevoEmail = async ({ to, toName, subject, html }) => {
  console.log(`\n📧 [BREVO] Attempting to send email...`);
  console.log(`📧 [BREVO] To: ${to}`);
  console.log(`📧 [BREVO] Subject: ${subject}`);
  console.log(`📧 [BREVO] BREVO_API_KEY exists: ${!!process.env.BREVO_API_KEY}`);
  console.log(`📧 [BREVO] BREVO_SENDER_EMAIL: ${process.env.BREVO_SENDER_EMAIL}`);

  if (!process.env.BREVO_API_KEY) {
    console.log(`📧 [BREVO] ❌ No API key found — email skipped\n`);
    return;
  }

  const payload = {
    sender: { name: 'Book Library', email: process.env.BREVO_SENDER_EMAIL },
    to: [{ email: to, name: toName || to }],
    subject,
    htmlContent: html,
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const responseText = await response.text();
    if (!response.ok) throw new Error(`Brevo API error ${response.status}: ${responseText}`);
    console.log(`📧 [BREVO] ✅ Email sent successfully to ${to}\n`);
  } catch (err) {
    console.error(`📧 [BREVO] ❌ Failed to send email: ${err.message}\n`);
    throw err;
  }
};

// ── Send OTP / Password Reset Email ──────────────────────────────────────────
const sendOtpEmail = async (toEmail, otp) => {
  if (!process.env.BREVO_API_KEY) {
    console.log(`\n📧 [DEV] PASSWORD RESET OTP for ${toEmail}: ${otp}  (valid 15 min)\n`);
    return;
  }
  await sendBrevoEmail({
    to: toEmail,
    subject: 'Your Password Reset Code — Book Library',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #E2D5BA;border-radius:16px;background:#FFFEF8;">
        <h2 style="color:#B8860B;font-family:serif;margin-bottom:8px;">📚 Book Library</h2>
        <h3 style="color:#2A1F0E;margin-top:0;">Password Reset Request</h3>
        <p style="color:#5A4832;">Your one-time reset code is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#B8860B;padding:16px;background:#FDF6E8;border-radius:10px;text-align:center;margin:20px 0;">${otp}</div>
        <p style="color:#5A4832;font-size:14px;">This code is valid for <strong>15 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #E2D5BA;margin:24px 0;">
        <p style="color:#999;font-size:12px;">Book Library · Do not reply to this email</p>
      </div>
    `,
  });
};

// ── Send Change-Password OTP Email ────────────────────────────────────────────
const sendChangePwdOtpEmail = async (toEmail, name, otp) => {
  if (!process.env.BREVO_API_KEY) {
    console.log(`\n📧 [DEV] CHANGE PASSWORD OTP for ${toEmail}: ${otp}  (valid 10 min)\n`);
    return;
  }
  await sendBrevoEmail({
    to: toEmail,
    toName: name,
    subject: 'Verify Your Identity — Change Password · Book Library',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #E2D5BA;border-radius:16px;background:#FFFEF8;">
        <h2 style="color:#B8860B;font-family:serif;margin-bottom:8px;">📚 Book Library</h2>
        <h3 style="color:#2A1F0E;margin-top:0;">Change Password Request</h3>
        <p style="color:#5A4832;">Hi <strong>${name}</strong>, use the code below to verify your identity before changing your password:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#B8860B;padding:16px;background:#FDF6E8;border-radius:10px;text-align:center;margin:20px 0;">${otp}</div>
        <p style="color:#5A4832;font-size:14px;">This code is valid for <strong>10 minutes</strong>. If you did not request this, someone may be trying to access your account — please contact support.</p>
        <hr style="border:none;border-top:1px solid #E2D5BA;margin:24px 0;">
        <p style="color:#999;font-size:12px;">Book Library · Do not reply to this email</p>
      </div>
    `,
  });
};

// ── Send Welcome Email ────────────────────────────────────────────────────────
const sendWelcomeEmail = async (toEmail, name, role) => {
  if (!process.env.BREVO_API_KEY) {
    console.log(`\n📧 [DEV] Welcome email for ${role} ${name} <${toEmail}>\n`);
    return;
  }
  const isWriter = role === 'writer';
  await sendBrevoEmail({
    to: toEmail,
    toName: name,
    subject: `Welcome to Book Library, ${name}! 📚`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;border:1px solid #E2D5BA;border-radius:16px;background:#FFFEF8;">
        <h2 style="color:#B8860B;font-family:serif;margin-bottom:4px;">📚 Book Library</h2>
        <h3 style="color:#2A1F0E;margin-top:0;">Welcome, ${name}! 🎉</h3>
        <p style="color:#5A4832;font-size:15px;">Your account has been created successfully as a <strong style="color:#B8860B;">${isWriter ? 'Writer' : 'Reader'}</strong>.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display:inline-block;margin-top:8px;padding:12px 28px;background:#B8860B;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;">Go to Book Library →</a>
        <hr style="border:none;border-top:1px solid #E2D5BA;margin:28px 0 16px;">
        <p style="color:#999;font-size:12px;">Book Library · Do not reply to this email</p>
      </div>
    `,
  });
};

// ── Generate JWT ──────────────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// ── Session payload ───────────────────────────────────────────────────────────
const sessionPayload = (user, token) => ({
  result: 'Login Success',
  token,
  role: user.role,
  user: {
    _id: user._id, user_id: user._id, name: user.name, email: user.email,
    role: user.role, address: user.address, city: user.city, phone: user.phone, bio: user.bio,
    admin_id:  user.role === 'admin'  ? user._id : undefined,
    writer_id: user.role === 'writer' ? user._id : undefined,
    reader_id: user.role === 'reader' ? user._id : undefined,
  },
});

// ── POST /loginuser (legacy) ──────────────────────────────────────────────────
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ result: 'Please provide email and password.' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ result: 'Invalid Email Id or Password' });
    if (user.isBlocked)
      return res.status(403).json({ result: 'Your account has been blocked. Contact admin.' });
    const token = generateToken(user._id);
    res.status(200).json(sessionPayload(user, token));
  } catch (error) { next(error); }
};

// ── POST /regisreader (legacy) ────────────────────────────────────────────────
export const registerReader = async (req, res, next) => {
  try {
    const { name, address, city, mno, email, pwd } = req.body;
    if (!name || !email) return res.json({ result: 'Name and email are required.' });
    if (!pwd || pwd.length < 6) return res.json({ result: 'Password must be at least 6 characters.' });
    const exists = await User.findOne({ email });
    if (exists) return res.json({ result: 'Email Id Already Exists' });
    await User.create({ name, address, city, phone: mno, email, password: pwd, role: 'reader' });
    sendWelcomeEmail(email, name, 'reader').catch(err => console.error('❌ Welcome email failed:', err.message));
    res.json({ result: 'Reader Registration Successful' });
  } catch (error) { next(error); }
};

// ── POST /regiswriter (legacy) ────────────────────────────────────────────────
export const registerWriter = async (req, res, next) => {
  try {
    const { name, address, city, mno, email, pwd, description } = req.body;
    if (!name || !email) return res.json({ result: 'Name and email are required.' });
    if (!pwd || pwd.length < 6) return res.json({ result: 'Password must be at least 6 characters.' });
    const exists = await User.findOne({ email });
    if (exists) return res.json({ result: 'Email Id Already Exists' });
    await User.create({ name, address, city, phone: mno, email, password: pwd, bio: description, role: 'writer' });
    sendWelcomeEmail(email, name, 'writer').catch(err => console.error('❌ Welcome email failed:', err.message));
    res.json({ result: 'Writer Registration Successful' });
  } catch (error) { next(error); }
};

// ── POST /api/auth/register (modern) ─────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    const user = await User.create({ name, email, password, role: role || 'reader' });
    sendWelcomeEmail(email, name, user.role).catch(err => console.error('❌ Welcome email failed:', err.message));
    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: 'Registration successful!', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { next(error); }
};

// ── POST /api/auth/login (modern) ─────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    const token = generateToken(user._id);
    res.status(200).json({ success: true, message: 'Login successful!', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { next(error); }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({ path: 'borrowedBooks.book', select: 'title author genre coverImage' });
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};

// ── PUT /api/auth/update-profile ──────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'Profile updated successfully.', user });
  } catch (error) { next(error); }
};

// ── POST /api/auth/send-change-password-otp ───────────────────────────────────
// Sends an OTP to the logged-in user's email before allowing password change
export const sendChangePasswordOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const otp     = crypto.randomInt(100000, 999999).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    changePwdOtpStore.set(user._id.toString(), { otp, expires });

    try {
      await sendChangePwdOtpEmail(user.email, user.name, otp);
    } catch (mailErr) {
      console.error('❌ Change-password OTP email failed:', mailErr.message);
    }

    res.json({
      success: true,
      message: `OTP sent to your registered email`,
      maskedEmail: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    });
  } catch (e) { next(e); }
};

// ── PUT /api/auth/change-password ─────────────────────────────────────────────
// Requires OTP verification + current password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, otp } = req.body;

    if (!otp)
      return res.status(400).json({ success: false, message: 'OTP is required.' });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });

    // Verify OTP
    const stored = changePwdOtpStore.get(req.user.id.toString());
    if (!stored || stored.otp !== otp || Date.now() > stored.expires)
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please request a new one.' });

    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });

    user.password = newPassword;
    await user.save();

    // Clear OTP after successful use
    changePwdOtpStore.delete(req.user.id.toString());

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) { next(error); }
};

// ── POST /api/auth/forgot-password ────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ success: true, message: 'If that email is registered, a reset code was sent.' });

    const otp     = crypto.randomInt(100000, 999999).toString();
    const expires = Date.now() + 15 * 60 * 1000;
    otpStore.set(email.toLowerCase(), { otp, expires });

    try {
      await sendOtpEmail(email.toLowerCase(), otp);
    } catch (mailErr) {
      console.error('❌ OTP email failed:', mailErr.message);
    }

    res.json({
      success: true,
      message: 'If that email is registered, a reset code was sent.',
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    });
  } catch (e) { next(e); }
};

// ── POST /api/auth/reset-password ─────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword)
      return res.status(400).json({ success: false, message: 'Email, code, and new password are required.' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const stored = otpStore.get(email.toLowerCase());
    if (!stored || stored.otp !== code || Date.now() > stored.expires)
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code. Request a new one.' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.password = newPassword;
    await user.save();
    otpStore.delete(email.toLowerCase());

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (e) { next(e); }
};
