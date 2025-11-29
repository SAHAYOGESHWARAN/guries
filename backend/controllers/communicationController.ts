
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

// --- Emails ---
export const getEmails = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM emails ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createEmail = async (req: any, res: any) => {
    const { subject, recipient, status, scheduled_at, template_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO emails (subject, recipient, status, scheduled_at, template_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
            [subject, recipient, status || 'draft', scheduled_at, template_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Voice Profiles ---
export const getVoiceProfiles = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM voice_profiles ORDER BY name ASC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createVoiceProfile = async (req: any, res: any) => {
    const { name, voice_id, language, gender, provider } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO voice_profiles (name, voice_id, language, gender, provider) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, voice_id, language, gender, provider]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Call Logs ---
export const getCallLogs = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM call_logs ORDER BY start_time DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const logCall = async (req: any, res: any) => {
    const { agent_id, customer_phone, duration, sentiment, recording_url, summary } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO call_logs (agent_id, customer_phone, duration, sentiment, recording_url, summary, start_time) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
            [agent_id, customer_phone, duration, sentiment, recording_url, summary]
        );
        const newCall = result.rows[0];
        getSocket().emit('new_call_log', newCall);
        res.status(201).json(newCall);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
