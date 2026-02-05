import { Request, Response } from 'express';
import { pool } from '../config/db';
import { validateRequired } from '../utils/validation';
import twilio from 'twilio';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize Twilio Client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

// Get admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Validate required environment variables on startup
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ CRITICAL: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
    process.exit(1);
}

if (!JWT_SECRET) {
    console.error('❌ CRITICAL: JWT_SECRET environment variable is required');
    process.exit(1);
}

// Log environment variables on startup (for debugging)
console.log('🔐 Auth Configuration Loaded:');
console.log('   ADMIN_EMAIL:', ADMIN_EMAIL);
console.log('   ADMIN_PASSWORD:', ADMIN_PASSWORD ? '✅ SET' : '❌ NOT SET');
console.log('   JWT_SECRET:', JWT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('   JWT_EXPIRES_IN:', JWT_EXPIRES_IN);

// Helper function to generate JWT token
const generateJWT = (payload: { id: number; email: string; role: string }): string => {
    return jwt.sign(payload, JWT_SECRET!, { expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' });
};

// Helper function to verify JWT token
export const verifyJWT = (token: string): any => {
    try {
        return jwt.verify(token, JWT_SECRET!);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        console.log('🔐 Login attempt:', { email, adminEmail: ADMIN_EMAIL });

        // Check admin credentials
        if (email.toLowerCase() === ADMIN_EMAIL!.toLowerCase()) {
            console.log('✅ Email matches admin email');
            console.log('🔑 Comparing password with hash...');

            const isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD!);
            console.log('🔐 Password valid:', isPasswordValid);

            if (!isPasswordValid) {
                console.log('❌ Password mismatch');
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const token = generateJWT({ id: 1, email: ADMIN_EMAIL!, role: 'admin' });
            console.log('✅ Login successful, token generated');

            return res.status(200).json({
                success: true,
                user: {
                    id: 1,
                    name: 'Admin User',
                    email: ADMIN_EMAIL,
                    role: 'admin',
                    status: 'active',
                    department: 'Administration',
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString()
                },
                token,
                message: 'Login successful'
            });
        }

        console.log('❌ Email does not match admin email');

        // Check database for other users
        const result = await pool.query(
            'SELECT * FROM users WHERE email = ? LIMIT 1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Check if user is active
        if (user.status === 'inactive') {
            return res.status(403).json({ error: 'Your account has been deactivated' });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ error: 'Your account is pending approval' });
        }

        // Verify password hash
        if (!user.password_hash) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateJWT({ id: user.id, email: user.email, role: user.role || 'user' });
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                status: user.status,
                department: user.department,
                created_at: user.created_at,
                last_login: new Date().toISOString()
            },
            token,
            message: 'Login successful'
        });
    } catch (error: any) {
        console.error("Error during login:", error);
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
};

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

