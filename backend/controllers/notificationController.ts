
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT id, user_id, title, message, type, is_read as read, link, created_at FROM notifications ORDER BY created_at DESC LIMIT 50');
        // Map to consistent format
        const notifications = result.rows.map((n: any) => ({
            id: n.id,
            user_id: n.user_id,
            text: n.message || n.title,
            title: n.title,
            message: n.message,
            type: n.type,
            read: n.read === 1 || n.read === true,
            link: n.link,
            created_at: n.created_at
        }));
        res.status(200).json(notifications);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createNotification = async (req: Request, res: Response) => {
    const { text, title, message, type, read, user_id } = req.body;
    try {
        const notificationTitle = title || 'Notification';
        const notificationMessage = message || text || '';
        const result = await pool.query(
            'INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))',
            [user_id || null, notificationTitle, notificationMessage, type || 'info', read ? 1 : 0]
        );
        const newItem = {
            ...result.rows[0],
            text: notificationMessage,
            read: result.rows[0].is_read === 1
        };
        getSocket().emit('notification_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE notifications SET is_read = 1 WHERE id = ?',
            [id]
        );
        const updatedItem = {
            ...result.rows[0],
            read: true
        };
        getSocket().emit('notification_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        await pool.query('UPDATE notifications SET is_read = 1 WHERE is_read = 0');
        getSocket().emit('notifications_all_read', {});
        res.status(200).json({ message: 'All marked as read' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteNotification = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
        getSocket().emit('notification_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

