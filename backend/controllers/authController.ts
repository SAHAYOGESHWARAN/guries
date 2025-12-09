
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import twilio from 'twilio';

// Initialize Twilio Client
// Ensure these are set in your .env file
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export const sendOtp = async (req: any, res: any) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!client || !twilioNumber) {
        console.error("Twilio credentials missing.");
        return res.status(503).json({ error: 'SMS service not configured' });
    }

    try {
        // Generate a 6-digit OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Expiration time (e.g., 5 minutes from now)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Save to Database
        await pool.query(
            'INSERT INTO otp_codes (phone_number, code, expires_at) VALUES ($1, $2, $3)',
            [phoneNumber, code, expiresAt]
        );

        // Send SMS via Twilio
        await client.messages.create({
            body: `Your Guires Marketing Center verification code is: ${code}`,
            from: twilioNumber,
            to: phoneNumber
        });

        res.status(200).json({ message: 'OTP sent successfully' });

    } catch (error: any) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ error: 'Failed to send OTP', details: error.message });
    }
};

export const verifyOtp = async (req: any, res: any) => {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
        return res.status(400).json({ error: 'Phone number and code are required' });
    }

    try {
        // Check for valid, non-expired code
        const result = await pool.query(
            'SELECT * FROM otp_codes WHERE phone_number = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [phoneNumber, code]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Code is valid, consume it (delete) to prevent replay
        const otpId = result.rows[0].id;
        await pool.query('DELETE FROM otp_codes WHERE id = $1', [otpId]);

        // In a real app, you would generate a JWT token here
        // For now, we just return success
        res.status(200).json({ message: 'Verification successful', verified: true });

    } catch (error: any) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ error: 'Verification failed', details: error.message });
    }
};
