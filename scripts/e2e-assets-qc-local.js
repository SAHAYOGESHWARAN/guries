#!/usr/bin/env node
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_BASE = `${BASE_URL}/api/v1`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3001';
const { io } = require('socket.io-client');

async function login() {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    const data = await res.json().catch(() => ({}));
    const token = data.token || (data.data && data.data.token);
    if (!token) throw new Error('Login failed');
    return token;
}

async function createAsset(token) {
    const res = await fetch(`${API_BASE}/assetLibrary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-User-Id': '1',
            'X-User-Role': 'Admin'
        },
        body: JSON.stringify({
            name: `E2E QC Asset ${Date.now()}`,
            type: 'Image',
            repository: 'Content Repository',
            status: 'Draft',
            web_title: 'Test',
            application_type: 'web'
        })
    });
    const text = await res.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
    console.log('Create response', text.slice(0, 200));
    const id = (data && data.data && data.data.id) || (data && data.id);
    if (id) return id;
    const listRes = await fetch(`${API_BASE}/assetLibrary`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const listText = await listRes.text();
    let list = [];
    try { const j = JSON.parse(listText); list = Array.isArray(j) ? j : (j.data || []); } catch { list = []; }
    console.log('List response', listText.slice(0, 200));
    const existingId = list && list.length ? (list[0].id || list[0].asset_id) : null;
    if (!existingId) throw new Error('Asset create failed');
    return existingId;
}

async function submitForQC(token, id) {
    const res = await fetch(`${API_BASE}/assetLibrary/${id}/submit-qc`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-User-Id': '1',
            'X-User-Role': 'Admin'
        },
        body: JSON.stringify({ submitted_by: 1, seo_score: 80, grammar_score: 90 })
    });
    if (!res.ok) throw new Error(`submit-qc failed ${res.status}`);
}

function listenForUpdate(id) {
    return new Promise((resolve, reject) => {
        const s = io(SOCKET_URL, { transports: ['websocket', 'polling'], timeout: 3000 });
        let done = false;
        const timer = setTimeout(() => {
            if (done) return;
            done = true;
            try { s.close(); } catch { }
            reject(new Error('No socket update received'));
        }, 5000);
        s.on('connect', () => { });
        s.on('assetLibrary_updated', (d) => {
            if (done) return;
            if (d && (d.id === id || d.asset_id === id)) {
                done = true;
                clearTimeout(timer);
                try { s.close(); } catch { }
                resolve(d);
            }
        });
        s.on('connect_error', (e) => { });
        s.on('error', () => { });
    });
}

async function reviewQC(token, id, decision = 'approved') {
    const res = await fetch(`${API_BASE}/assetLibrary/${id}/qc-review`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-User-Id': '1',
            'X-User-Role': 'Admin'
        },
        body: JSON.stringify({
            qc_score: 95,
            qc_remarks: 'Looks good',
            qc_decision: decision,
            qc_reviewer_id: 1,
            user_role: 'Admin',
            checklist_items: { quality: true, seo: true },
            checklist_completion: true,
            linking_active: decision === 'approved'
        })
    });
    if (!res.ok) throw new Error(`qc-review failed ${res.status}`);
}

async function getAsset(token, id) {
    const res = await fetch(`${API_BASE}/assetLibrary/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json().catch(() => ({}));
    return data && (data.data || data);
}

async function run() {
    console.log('E2E Assets & QC (local)', API_BASE);
    const token = await login();
    const id = await createAsset(token);
    console.log('Asset created', id);
    await submitForQC(token, id);
    console.log('Submitted for QC');
    const socketPromise = listenForUpdate(id);
    await reviewQC(token, id, 'approved');
    console.log('QC review submitted');
    let socketEventReceived = false;
    try {
        const evt = await socketPromise;
        socketEventReceived = !!evt;
        console.log('Socket update received', JSON.stringify({ id: evt.id, status: evt.status, qc_status: evt.qc_status }));
    } catch (e) {
        console.log('Socket update not received');
    }
    const asset = await getAsset(token, id);
    const statusOk = asset && (asset.status === 'QC Approved' || asset.qc_status === 'Approved' || asset.workflow_stage === 'Published');
    const passed = statusOk && socketEventReceived;
    console.log('Result', JSON.stringify({ passed, statusOk, socketEventReceived }));
    process.exit(passed ? 0 : 1);
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
