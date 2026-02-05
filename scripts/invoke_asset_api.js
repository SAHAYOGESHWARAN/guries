(async () => {
  try {
    const handler = require('../api/v1/assetLibrary').default;

    const req = {
      method: 'POST',
      query: {},
      headers: {},
      body: {
        asset_name: 'Serverless Test Asset',
        asset_type: 'Image',
        category: 'Test'
      }
    };

    let captured = null;
    const res = {
      status: (code) => ({
        json: (payload) => { captured = { code, payload }; },
        send: (payload) => { captured = { code, payload }; }
      }),
      json: (payload) => { captured = { code: 200, payload }; },
      send: (payload) => { captured = { code: 200, payload }; }
    };

    await handler(req, res);
    console.log('Handler response:', captured);
  } catch (e) {
    console.error('Invoke error:', e);
    process.exit(1);
  }
})();
