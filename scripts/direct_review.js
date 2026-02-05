(async () => {
  try {
    // Patch socket to avoid initialization error when running controllers directly
    const socketModule = require('../backend/dist/socket');
    if (socketModule && typeof socketModule.getSocket === 'function') {
      socketModule.getSocket = () => ({ emit: () => {} });
    }

    const assetController = require('../backend/dist/controllers/assetController');
    const db = require('../backend/dist/config/db');

    // Helper to call controller methods with mocked req/res
    const callController = async (fn, req) => {
      let captured = null;
      const res = {
        status: (code) => ({
          json: (payload) => { captured = payload; },
          send: (payload) => { captured = payload; }
        }),
        json: (payload) => { captured = payload; },
        send: (payload) => { captured = payload; }
      };

      await fn(req, res);
      return captured;
    };

    // Create asset
    const createReq = { body: {
      name: 'Direct Test Asset',
      type: 'Document',
      application_type: 'web',
      status: 'Draft',
      qc_status: 'QC Pending',
      submitted_by: 1
    }};

    const created = await callController(assetController.createAssetLibraryItem, createReq);
    console.log('Created asset:', created);
    const id = created?.id || created?.data?.id || created?.asset_id || created?.data?.asset_id;
    if (!id) {
      console.error('Failed to create asset or determine id');
      process.exit(1);
    }

    // Run reviewAsset (approve)
    const reviewReq = {
      params: { id: String(id) },
      body: {
        qc_score: 90,
        qc_remarks: 'Approved by automated test',
        qc_decision: 'approved',
        qc_reviewer_id: 999,
        checklist_completion: true,
        checklist_items: {},
        user_role: 'admin'
      }
    };

    const reviewResult = await callController(assetController.reviewAsset, reviewReq);
    console.log('Review result:', reviewResult);

    // Fetch updated asset
    const getReq = { params: { id: String(id) } };
    const updated = await callController(assetController.getAssetLibraryItem, getReq);
    console.log('Updated asset:', updated);

  } catch (e) {
    console.error('Error invoking direct review:', e);
    process.exit(1);
  }
})();
