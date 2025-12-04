import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export const uploadBase64 = async (req: any, res: Response) => {
    try {
        const { filename, content_base64 } = req.body;
        if (!filename || !content_base64) return res.status(400).json({ error: 'filename and content_base64 required' });

        // sanitize filename and add timestamp to avoid collisions
        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const timestamp = Date.now();
        const finalName = `${timestamp}_${safeName}`;

        const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

        const filePath = path.join(uploadsDir, finalName);
        const buffer = Buffer.from(content_base64, 'base64');
        fs.writeFileSync(filePath, buffer);

        const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
        const url = `${baseUrl}/uploads/${finalName}`;

        return res.status(201).json({ url, filename: finalName });
    } catch (err: any) {
        console.error('Upload failed', err);
        return res.status(500).json({ error: err.message });
    }
};
