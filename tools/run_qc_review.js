(async () => {
  try {
    const base = process.env.API_URL || 'http://localhost:3003/api/v1';
    console.log('API base:', base);

    // fetch assets
    const listRes = await fetch(`${base}/assetLibrary`);
    if (!listRes.ok) throw new Error('Failed to fetch assets: ' + listRes.status);
    const assets = await listRes.json();
    console.log('Total assets fetched:', assets.length);

    const pending = assets.find(a => a.status === 'Pending QC Review' || a.status === 'Draft' || a.status === 'QC Pending');
    if (!pending) {
      console.log('No pending asset found. Showing first asset as fallback:', assets[0] || null);
      return;
    }

    console.log('Found pending asset id:', pending.id, 'name:', pending.name, 'status:', pending.status);

    // show current asset
    const before = await (await fetch(`${base}/assetLibrary/${pending.id}`)).json();
    console.log('Before review status:', before.status, 'qc_status:', before.qc_status);

    // post QC review (approve)
    const payload = {
      qc_score: 90,
      qc_remarks: 'Automated approval check (dev test)',
      qc_decision: 'approved',
      qc_reviewer_id: 1,
      user_role: 'admin',
      checklist_completion: true,
      checklist_items: {}
    };

    const reviewRes = await fetch(`${base}/assetLibrary/${pending.id}/qc-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!reviewRes.ok) {
      const err = await reviewRes.text();
      throw new Error('QC review failed: ' + reviewRes.status + ' ' + err);
    }

    const updated = await reviewRes.json();
    console.log('QC review response:', updated);

    // fetch asset after update
    const after = await (await fetch(`${base}/assetLibrary/${pending.id}`)).json();
    console.log('After review status:', after.status, 'qc_status:', after.qc_status);

  } catch (e) {
    console.error('Error in run_qc_review.js:', e);
    process.exitCode = 2;
  }
})();
