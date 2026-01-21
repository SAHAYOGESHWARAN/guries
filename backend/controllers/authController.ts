
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { validateRequired, throwIfErrors } from '../utils/validation';
import twilio from 'twilio';

// Initialize Twilio Client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export const sendOtp = async (req: Request, res: Response) => {
    const { phoneNumber } = req.body;

    // Validate input
    const errors = validateRequired({ phoneNumber }, ['phoneNumber']);
    if (errors.length > 0) {
        return res.status(400).json({ error: 'Valid phone number is required' });
    }

    if (!client || !twilioNumber) {
        console.error("Twilio credentials missing.");
        return res.status(503).json({ error: 'SMS service not configured' });
    }

    try {
        // Generate a 6-digit OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        // Save to Database
        await pool.query(
            'INSERT INTO otp_codes (phone_number, code, expires_at) VALUES (?, ?, ?)',
            [phoneNumber, code, expiresAt]
        );

        // Send SMS via Twilio
        await client.messages.create({
            body: `Your Guires Marketing Center verification code is: ${code}`,
            from: twilioNumber,
            to: phoneNumber
        });

        res.status(200).json({ message: 'OTP sent successfully', code });
    } catch (error: any) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ error: 'Failed to send OTP', details: error.message });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    const { phoneNumber, code } = req.body;

    // Validate input
    const errors = validateRequired({ phoneNumber, code }, ['phoneNumber', 'code']);
    if (errors.length > 0) {
        return res.status(400).json({ error: 'Phone number and code are required' });
    }

    try {
        // Check for valid, non-expired code
        const result = await pool.query(
            'SELECT * FROM otp_codes WHERE phone_number = ? AND code = ? AND expires_at > datetime("now") ORDER BY created_at DESC LIMIT 1',
            [phoneNumber, code]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Code is valid, consume it to prevent replay
        const otpId = result.rows[0].id;
        await pool.query('DELETE FROM otp_codes WHERE id = ?', [otpId]);

        res.status(200).json({ message: 'Verification successful', verified: true });
    } catch (error: any) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ error: 'Verification failed', details: error.message });
    }
};



