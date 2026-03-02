const http = require('http');

const options = {
    host: 'localhost',
    port: 3003,
    path: '/api/v1/keywords',
    method: 'GET',
    headers: {'Authorization':'Bearer test'}
};

const req = http.request(options, res => {
    console.log('status', res.statusCode);
    res.on('data', d => process.stdout.write(d));
});
req.on('error', e => console.error('error', e.message));
req.end();
