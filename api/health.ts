import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '2.5.0',
        database: {
            supabaseConfigured: !!(supabaseUrl && supabaseKey && supabaseUrl.includes('supabase')),
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey
        }
    });
}
