(async () => {
  const base = process.env.API_URL || 'http://localhost:3003/api/v1';
  const fetchJson = async (url, opts) => {
    const r = await fetch(url, opts);
    let body = null;
    try { body = await r.json(); } catch (e) { body = await r.text().catch(()=>null); }
    return { ok: r.ok, status: r.status, body };
  };

  const createAsset = async (name, appType='web') => {
    const payload = {
      name: name,
      type: 'Article',
      application_type: appType,
      status: 'Draft',
      // minimal required fields used by backend create flow
      created_by: 1,
      repository: 'Web'
    };
    const res = await fetchJson(`${base}/assetLibrary`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`createAsset failed: ${res.status} ${JSON.stringify(res.body)}`);
    return res.body;
  };

  const submitForQC = async (id, userId=1) => {
    const payload = { submitted_by: userId };
    const res = await fetchJson(`${base}/assetLibrary/${id}/submit-qc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return res;
  };

  const review = async (id, decision, reviewerId=1) => {
    const payload = {
      qc_score: 85,
      qc_remarks: `Flow test: ${decision}`,
      qc_decision: decision,
      qc_reviewer_id: reviewerId,
      user_role: 'admin',
      checklist_completion: true,
      checklist_items: {}
    };
    const res = await fetchJson(`${base}/assetLibrary/${id}/qc-review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return res;
  };

  const getAsset = async (id) => {
    return await fetchJson(`${base}/assetLibrary/${id}`, { method: 'GET' });
  };

  try {
    console.log('== APPROVE FLOW ==');
    const a = await createAsset('QC Flow Approve Test');
    console.log('Created asset:', a.id || a);
    await submitForQC(a.id || a);
    console.log('Submitted for QC');
    const r1 = await review(a.id || a, 'approved');
    console.log('Review response:', r1.status, r1.body);
    const after1 = await getAsset(a.id || a);
    console.log('After approve:', after1.status, after1.body.qc_status || after1.body.status || after1.body);

    console.log('\n== REWORK FLOW ==');
    const b = await createAsset('QC Flow Rework Test');
    console.log('Created asset:', b.id || b);
    await submitForQC(b.id || b);
    console.log('Submitted for QC');
    const r2 = await review(b.id || b, 'rework');
    console.log('Review response (rework):', r2.status, r2.body);
    const after2 = await getAsset(b.id || b);
    console.log('After rework:', after2.status, after2.body.qc_status || after2.body.status || after2.body);

    console.log('Resubmitting rework asset for QC (user action)');
    await submitForQC(b.id || b);
    console.log('Resubmitted. Now approving it...');
    const r2b = await review(b.id || b, 'approved');
    console.log('Review response (approve after rework):', r2b.status, r2b.body);
    const after2b = await getAsset(b.id || b);
    console.log('After approve (post-rework):', after2b.status, after2b.body.qc_status || after2b.body.status || after2b.body);

    console.log('\n== REJECT FLOW ==');
    const c = await createAsset('QC Flow Reject Test');
    console.log('Created asset:', c.id || c);
    await submitForQC(c.id || c);
    console.log('Submitted for QC');
    const r3 = await review(c.id || c, 'rejected');
    console.log('Review response (reject):', r3.status, r3.body);
    const after3 = await getAsset(c.id || c);
    console.log('After reject:', after3.status, after3.body.qc_status || after3.body.status || after3.body);

    console.log('\nALL FLOWS DONE');
  } catch (e) {
    console.error('Error running acceptance flows:', e);
    process.exitCode = 2;
  }
})();
