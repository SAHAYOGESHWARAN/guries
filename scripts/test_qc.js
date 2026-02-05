(async () => {
  const base = 'http://localhost:3001/api/v1';
  try {
    // Create a test asset
    const createRes = await fetch(`${base}/assetLibrary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'E2E Test Asset',
        type: 'Document',
        application_type: 'web',
        status: 'Pending QC Review',
        qc_status: 'QC Pending',
        submitted_by: 1
      })
    });
    const created = await createRes.json();
    console.log('Create response:', created);
    const id = created.id || created.data?.id || created.data?.asset_id || created.asset_id || created.data?.id || (created && created.id);
    if (!id) {
      console.error('Failed to get created asset id. Full create response:', created);
      process.exit(1);
    }

    // Submit QC approval
    const qcBody = {
      qc_score: 92,
      qc_remarks: 'Automated approval - looks good',
      qc_decision: 'approved',
      qc_reviewer_id: 999,
      user_role: 'admin'
    };

    const qcRes = await fetch(`${base}/assetLibrary/${id}/qc-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qcBody)
    });

    const qcResult = await qcRes.json();
    console.log('QC review response:', qcResult);

    // Get updated asset
    const getRes = await fetch(`${base}/assetLibrary/${id}`);
    const asset = await getRes.json();
    console.log('Updated asset:', asset);
  } catch (e) {
    console.error('Test script error:', e);
    process.exit(1);
  }
})();
