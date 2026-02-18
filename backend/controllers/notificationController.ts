
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
            [userId]
        );
        const total = countResult.rows[0]?.total || 0;

        // Get paginated notifications
        const result = await pool.query(
            `SELECT id, user_id, title, message, type, is_read, link, created_at 
             FROM notifications 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        const notifications = result.rows.map((n: any) => ({
            id: n.id,
            user_id: n.user_id,
            text: n.message || n.title,
            title: n.title,
            message: n.message,
            type: n.type,
            read: n.is_read === 1 || n.is_read === true,
            link: n.link,
            created_at: n.created_at
        }));

        res.status(200).json({
            notifications,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createNotification = async (req: Request, res: Response) => {
    const { text, title, message, type, read, user_id } = req.body;
    try {
        // Validate user_id
        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        // Verify user exists
        const userCheck = await pool.query('SELECT id FROM users WHERE id = ?', [user_id]);
        if (!userCheck.rows || userCheck.rows.length === 0) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        const notificationTitle = title || 'Notification';
        const notificationMessage = message || text || '';

        // Use CURRENT_TIMESTAMP for PostgreSQL compatibility
        const result = await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, is_read, created_at) 
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [user_id, notificationTitle, notificationMessage, type || 'info', read ? 1 : 0]
        );

        const newItem = {
            id: result.rows[0]?.id,
            user_id,
            text: notificationMessage,
            title: notificationTitle,
            message: notificationMessage,
            type: type || 'info',
            read: read || false,
            link: null,
            created_at: new Date().toISOString()
        };

        // Emit socket event safely
        try {
            getSocket().emit('notification_created', newItem);
        } catch (socketError) {
            console.warn('Socket.io not available for notification:', socketError);
        }

        res.status(201).json(newItem);
    } catch (error: any) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: error.message });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    try {
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Verify notification belongs to user
        const notifCheck = await pool.query(
            'SELECT id, user_id FROM notifications WHERE id = ?',
            [id]
        );

        if (!notifCheck.rows || notifCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        if (notifCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await pool.query(
            'UPDATE notifications SET is_read = 1 WHERE id = ?',
            [id]
        );

        const updatedItem = {
            id,
            read: true
        };

        try {
            getSocket().emit('notification_updated', updatedItem);
        } catch (socketError) {
            console.warn('Socket.io not available:', socketError);
        }

        res.status(200).json({ message: 'Notification marked as read', ...updatedItem });
    } catch (error: any) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: error.message });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    try {
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Only mark user's own notifications as read
        await pool.query(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
            [userId]
        );

        try {
            getSocket().emit('notifications_all_read', { user_id: userId });
        } catch (socketError) {
            console.warn('Socket.io not available:', socketError);
        }

        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error: any) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteNotification = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    try {
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Verify notification belongs to user
        const notifCheck = await pool.query(
            'SELECT id, user_id FROM notifications WHERE id = ?',
            [id]
        );

        if (!notifCheck.rows || notifCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        if (notifCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await pool.query('DELETE FROM notifications WHERE id = ?', [id]);

        try {
            getSocket().emit('notification_deleted', { id });
        } catch (socketError) {
            console.warn('Socket.io not available:', socketError);
        }

        res.status(200).json({ message: 'Notification deleted' });
    } catch (error: any) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: error.message });
    }
};
