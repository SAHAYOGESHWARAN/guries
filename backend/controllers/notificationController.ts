
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getNotifications = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createNotification = async (req: any, res: any) => {
    const { text, type, read } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO notifications (text, type, read, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [text, type, read || false]
        );
        const newItem = result.rows[0];
        getSocket().emit('notification_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const markAsRead = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE notifications SET read = true WHERE id = $1 RETURNING *',
            [id]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('notification_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const markAllAsRead = async (req: any, res: any) => {
    try {
        await pool.query('UPDATE notifications SET read = true WHERE read = false');
        getSocket().emit('notifications_all_read', {});
        res.status(200).json({ message: 'All marked as read' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteNotification = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM notifications WHERE id = $1', [req.params.id]);
        getSocket().emit('notification_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
