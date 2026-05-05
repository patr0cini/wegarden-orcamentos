const http = require('http');
const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');
const PORT      = process.env.PORT || 3000;

// Initialise data file if missing
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ data: [] }));
}

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

http.createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  // GET /data — return current data
  if (req.method === 'GET' && req.url === '/data') {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
      res.end(raw);
    } catch (e) {
      res.writeHead(500, CORS);
      res.end(JSON.stringify({ error: 'Erro ao ler dados' }));
    }
    return;
  }

  // PUT /data — save new data
  if (req.method === 'PUT' && req.url === '/data') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        // Validate it's valid JSON before saving
        JSON.parse(body);
        fs.writeFileSync(DATA_FILE, body);
        res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, CORS);
        res.end(JSON.stringify({ error: 'JSON inválido' }));
      }
    });
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, CORS);
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(404, CORS);
  res.end(JSON.stringify({ error: 'Not found' }));

}).listen(PORT, () => {
  console.log(`We Garden API running on port ${PORT}`);
});
