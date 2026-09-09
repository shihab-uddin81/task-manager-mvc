// Simple smoke test runner for CI during starter phase
const http = require('http');

const opts = { hostname: 'localhost', port: 4000, path: '/', method: 'GET' };

const req = http.request(opts, res => {
  console.log('STATUS', res.statusCode);
  process.exit(0);
});
req.on('error', () => { process.exit(1); });
req.end();
