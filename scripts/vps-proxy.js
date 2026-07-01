const http = require('http');
const https = require('https');
const os = require('os');
const { spawn, exec } = require('child_process');

const PORT = 3000;
const OLLAMA_HOST = '127.0.0.1';
const OLLAMA_PORT = 11434;

// Simple CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper to calculate CPU usage
let lastCpuInfo = getCpuInfo();
function getCpuInfo() {
  const cpus = os.cpus();
  let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
  for (let cpu in cpus) {
    user += cpus[cpu].times.user;
    nice += cpus[cpu].times.nice;
    sys += cpus[cpu].times.sys;
    irq += cpus[cpu].times.irq;
    idle += cpus[cpu].times.idle;
  }
  return { idle, total: user + nice + sys + idle + irq };
}

function calculateCpuPercent() {
  const currentCpuInfo = getCpuInfo();
  const idleDifference = currentCpuInfo.idle - lastCpuInfo.idle;
  const totalDifference = currentCpuInfo.total - lastCpuInfo.total;
  lastCpuInfo = currentCpuInfo;
  
  if (totalDifference === 0) return '0.0';
  const percent = 100 - ~~(100 * idleDifference / totalDifference);
  return percent.toFixed(1);
}

// Helper to get HDD usage
function getHddUsage() {
  return new Promise((resolve) => {
    exec("df -B1 / | awk 'NR==2 {print $2,$3}'", (error, stdout) => {
      if (error) {
        resolve({ hddPercent: '0.0', usedHddGb: 0, totalHddGb: 0 });
        return;
      }
      const parts = stdout.trim().split(/\s+/);
      const total = parseInt(parts[0], 10);
      const used = parseInt(parts[1], 10);
      if (isNaN(total) || isNaN(used) || total === 0) {
        resolve({ hddPercent: '0.0', usedHddGb: 0, totalHddGb: 0 });
        return;
      }
      
      const usedHddGb = (used / (1024 ** 3)).toFixed(1);
      const totalHddGb = (total / (1024 ** 3)).toFixed(1);
      const hddPercent = ((used / total) * 100).toFixed(1);
      
      resolve({
        hddPercent,
        usedHddGb: parseFloat(usedHddGb),
        totalHddGb: parseFloat(totalHddGb)
      });
    });
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // 1. Logs & Metrics SSE Endpoint
  if (req.method === 'GET' && url.pathname === '/api/logs') {
    res.writeHead(200, {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let isClientConnected = true;
    req.on('close', () => { isClientConnected = false; });

    const sendSse = (data) => {
      if (isClientConnected) {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    };

    // Spawn journalctl for Ollama logs
    const journalctl = spawn('journalctl', ['-u', 'ollama', '-n', '50', '-f']);
    
    journalctl.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) sendSse({ type: 'log', line });
      }
    });

    journalctl.stderr.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) sendSse({ type: 'log', line: `[STDERR] ${line}` });
      }
    });

    // Send OS Metrics periodically
    const metricsInterval = setInterval(async () => {
      if (!isClientConnected) {
        clearInterval(metricsInterval);
        journalctl.kill();
        return;
      }

      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memPercent = ((usedMem / totalMem) * 100).toFixed(1);
      const cpuPercent = calculateCpuPercent();
      const hddData = await getHddUsage();

      sendSse({
        type: 'metrics',
        memoryPercent: memPercent,
        usedMemMb: Math.round(usedMem / (1024 * 1024)),
        totalMemMb: Math.round(totalMem / (1024 * 1024)),
        cpuPercent: cpuPercent,
        hddPercent: hddData.hddPercent,
        usedHddGb: hddData.usedHddGb,
        totalHddGb: hddData.totalHddGb
      });
    }, 2000);

    return;
  }

  // 2. Proxy all other /api/* requests to Ollama
  if (url.pathname.startsWith('/api/')) {
    const options = {
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    // Override host to avoid mismatch issues
    options.headers.host = `${OLLAMA_HOST}:${OLLAMA_PORT}`;

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        ...proxyRes.headers,
        ...corsHeaders
      });
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy Error:', err.message);
      res.writeHead(502, corsHeaders);
      res.end(JSON.stringify({ error: 'Ollama is offline or unreachable' }));
    });

    req.pipe(proxyReq, { end: true });
    return;
  }

  // Fallback
  res.writeHead(404, corsHeaders);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`VPS Proxy Server running on port ${PORT}`);
  console.log(`Forwarding /api/chat, /api/pull, /api/tags -> http://${OLLAMA_HOST}:${OLLAMA_PORT}`);
  console.log(`Serving OS Metrics & Logs -> /api/logs`);
});
