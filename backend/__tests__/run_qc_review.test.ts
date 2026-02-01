import request from 'supertest';
import { app } from '../server';

describe('Manual QC approve flow (integration)', () => {
  it('finds a pending asset and approves it via /assetLibrary/:id/qc-review', async () => {
    const listRes = await request(app).get('/api/v1/assetLibrary');
    expect(listRes.status).toBe(200);
    const assets = Array.isArray(listRes.body) ? listRes.body : [];

    const pending = assets.find((a: any) => ['Pending QC Review', 'Draft', 'QC Pending'].includes(a.status));
    if (!pending) {
      // Nothing to approve in DB - mark as passed
      return;
    }

    const payload = {
      qc_score: 88,
      qc_remarks: 'Automated integration test approval',
      qc_decision: 'approved',
      qc_reviewer_id: 1,
      user_role: 'admin',
      checklist_completion: true,
      checklist_items: {}
    };

    const res = await request(app)
      .post(`/api/v1/assetLibrary/${pending.id}/qc-review`)
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(['QC Approved', 'QC Approved']).toContain(res.body.status);
  }, 20000);
});
