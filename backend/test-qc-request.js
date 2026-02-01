(async () => {
  try {
    const url = 'http://localhost:3001/api/v1/assetLibrary/1/qc-review';
    const body = {
      qc_score: 90,
      qc_remarks: 'Automated test review',
      qc_decision: 'approved',
      qc_reviewer_id: 1,
      user_role: 'Admin',
      checklist_items: { 'Brand Compliance': true, 'Content Quality': true },
      checklist_completion: true,
      linking_active: true
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': '1',
        'X-User-Role': 'Admin'
      },
      body: JSON.stringify(body),
      timeout: 8000
    });

    const text = await res.text();
    console.log('STATUS', res.status);
    try { console.log('BODY', JSON.parse(text)); } catch (e) { console.log('BODY', text); }
  } catch (err) {
    console.error('REQUEST ERROR', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
