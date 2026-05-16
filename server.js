/**
 * 🔐 JANDO360° LOCAL RELAY ENGINE - ARCHITECTURE V9006.0 [HYBRID UPGRADE]
 * PORT NO: 3000 | REAL-TIME EVENT TELEMETRY & PERSISTENT VAULT
 * OPERATOR: MIKE [TITAN]
 * FEATURES: DUCKDNS SYNC, LOCAL CACHE STORAGE, AUTO-RECOVERY, WEB DASHBOARD
 */

const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const SECURE_RELAY_KEY = "JANDO360_SECURE_KEY_2026";
const CACHE_FILE = path.join(__dirname, 'jando360_vault.json');

app.use(express.json());

// CONFIGURATION MATRIX FOR DIRECTORIES
const CONFIG = {
  monitoredPaths: {
    "Lucide Icons (Panda)": "C:\\Users\\phump\\dyad-apps\\jade-panda-play\\node_modules\\.pnpm\\lucide-react@0.462.0_react@18.3.1\\node_modules\\lucide-react\\dist\\esm\\icons",
    "React DOM (Panda)": "C:\\Users\\phump\\dyad-apps\\jade-panda-play\\node_modules\\.pnpm\\react-dom@18.3.1_react@18.3.1\\node_modules\\react-dom",
    "React Router Dom": "C:\\Users\\phump\\dyad-apps\\jade-panda-play\\node_modules\\.pnpm\\react-router-dom@6.30.0_rea_6b58b4787c243edcd3a991ae74e383c1\\node_modules\\react-router-dom",
    "React Router Dist": "C:\\Users\\phump\\dyad-apps\\jade-panda-play\\node_modules\\.pnpm\\react-router-dom@6.30.0_rea_6b58b4787c243edcd3a991ae74e383c1\\node_modules\\react-router-dom\\dist",
    "Lucide Icons (Phoenix)": "C:\\Users\\phump\\dyad-apps\\radiant-phoenix-skip\\node_modules\\.pnpm\\lucide-react@0.462.0_react@18.3.1\\node_modules\\lucide-react\\dist\\esm\\icons"
  }
};

// 🗄️ INITIALIZE LOCAL STORAGE VAULT
let systemVault = { lastScanCount: 0, lastScanTime: "NEVER", totalCloudHandshakes: 0, cachedDevices: [] };
if (fs.existsSync(CACHE_FILE)) {
  try { 
    systemVault = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); 
  } catch (e) {
    // Fallback if file corrupt
  }
}

// TERMINAL MONITOR LOGGING SYSTEM
function logEvent(type, status, info, colorCode = "\x1b[36m") {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] 📡 [${type.padEnd(9)}] | STATE: ${colorCode}${status.padEnd(13)}\x1b[0m | DETAILS: ${info}`);
}

// 🛡️ API SECURITY HANDSHAKE MIDDLEWARE (Applies to background requests only)
function secureHandshake(req, res, next) {
  const incomingKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
  logEvent("INBOUND", "ATTEMPT", `Handshake initialized from remote client...`, "\x1b[33m");

  if (!incomingKey || incomingKey !== SECURE_RELAY_KEY) {
    logEvent("SECURITY", "DENIED", `Invalid or missing API key. Connection aborted.`, "\x1b[31m");
    return res.status(403).json({ success: false, error: "Access Denied" });
  }
  
  systemVault.totalCloudHandshakes++;
  fs.writeFileSync(CACHE_FILE, JSON.stringify(systemVault, null, 2));
  logEvent("SECURITY", "VERIFIED", `Secure token match. Total handshakes tracked: ${systemVault.totalCloudHandshakes}`, "\x1b[32m");
  next();
}

// 📡 FORENSIC HARDWARE SCANNING ENDPOINT (API CALL WITH AUTO-CACHE)
app.post('/api/network/scan', secureHandshake, (req, res) => {
  logEvent("PIPELINE", "SCAN_START", `Initializing deep hardware local ARP sweep...`, "\x1b[35m");
  
  exec('arp -a', (error, stdout) => {
    if (error) {
      logEvent("HARDWARE", "FALLBACK", `ARP failed. Deploying cached data vault values.`, "\x1b[31m");
      return res.json({ success: true, fallback: true, devices: systemVault.cachedDevices || [], lastKnownCount: systemVault.lastScanCount });
    }
    
    const lines = stdout.split('\n');
    const devices = [];
    const seen = new Set();
    
    lines.forEach(line => {
      const ipMatch = line.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
      if (ipMatch) {
        const ip = ipMatch[1];
        if (!ip.endsWith('.255') && !ip.startsWith('224.') && !ip.startsWith('127.') && ip !== '0.0.0.0') {
          if (!seen.has(ip)) {
            seen.add(ip);
            let alias = "DEVICE";
            if (ip.endsWith('.1')) alias = "CORE_ROUTER";
            if (ip === "192.168.10.102") alias = "TITAN_HOST";
            if (ip.endsWith('.110')) alias = "CCTV_SOLAR_ARRAY";
            
            devices.push({ ip: ip, alias: alias, status: "ACTIVE" });
          }
        }
      }
    });
    
    // Save current network matrix mapping array state into persistent storage file
    systemVault.lastScanCount = devices.length;
    systemVault.lastScanTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
    systemVault.cachedDevices = devices;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(systemVault, null, 2));
    
    logEvent("PIPELINE", "SCAN_COMPLETE", `Mapped ${devices.length} active hardware nodes to cloud matrix.`, "\x1b[32m");
    res.json({ success: true, devices: devices });
  });
});

// 🖥️ INTERACTIVE USER WINDOW INTERFACE HOOK
app.get('/', (req, res) => {
  let pathSectionsHtml = '';

  // Process directory arrays directly for web generation
  for (const [key, targetPath] of Object.entries(CONFIG.monitoredPaths)) {
    let filesHtml = '';
    try {
      if (fs.existsSync(targetPath)) {
        const files = fs.readdirSync(targetPath);
        if (files.length === 0) {
          filesHtml = `<li class="empty">Directory initialized empty.</li>`;
        } else {
          const displayLimit = files.slice(0, 40); 
          filesHtml = displayLimit.map(f => `<li>🗎 ${f}</li>`).join('');
          if (files.length > 40) {
            filesHtml += `<li class="more">... and ${files.length - 40} additional system nodes mapped</li>`;
          }
        }
      } else {
        filesHtml = `<li class="error">⚠️ Target offline or path directory unresolvable.</li>`;
      }
    } catch (err) {
      filesHtml = `<li class="error">❌ System read error: ${err.message}</li>`;
    }

    pathSectionsHtml += `
      <div class="card">
        <h3>📂 ${key}</h3>
        <p class="path-string">${targetPath}</p>
        <ul>${filesHtml}</ul>
      </div>
    `;
  }

  // Fallback parsing engine if live devices array isn't populated yet
  const dynamicDevices = systemVault.cachedDevices && systemVault.cachedDevices.length > 0 
    ? systemVault.cachedDevices 
    : [{ alias: "TITAN_HOST", ip: "192.168.10.102", status: "ONLINE_CACHE" }, { alias: "CORE_ROUTER", ip: "192.168.10.1", status: "ONLINE_CACHE" }];

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>JANDO360° ENGINE ROOM</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { background: #0a0f1d; color: #4af626; font-family: 'Courier New', monospace; margin: 0; padding: 20px; }
      header { border-bottom: 2px solid #1f2d5a; padding-bottom: 20px; margin-bottom: 20px; }
      h1 { color: #fff; margin: 0 0 5px 0; font-size: 24px; text-shadow: 0 0 10px rgba(74,246,38,0.3); }
      .meta { color: #8a9fc4; font-size: 13px; margin-bottom: 10px; }
      .vault-stats { font-size: 12px; color: #eab308; margin-bottom: 15px; background: #111827; display: inline-block; padding: 6px 12px; border-radius: 4px; border: 1px solid #eab30833; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
      .card { background: #111827; border: 1px solid #1f2d5a; border-radius: 5px; padding: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
      h3 { color: #38bdf8; margin: 0 0 10px 0; border-bottom: 1px dashed #1f2d5a; padding-bottom: 5px; font-size: 16px; }
      .path-string { color: #64748b; font-size: 11px; word-break: break-all; margin: 0 0 10px 0; background: #070a13; padding: 4px; border-radius: 3px; }
      ul { list-style: none; padding: 0; margin: 0; max-height: 250px; overflow-y: auto; }
      li { padding: 4px 8px; font-size: 13px; border-bottom: 1px solid #16223f; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      li:hover { background: #1e293b; color: #4af626; }
      li.error { color: #ef4444; }
      li.empty { color: #eab308; }
      li.more { color: #38bdf8; font-style: italic; font-size: 12px; }
      .device-tag { display: inline-block; background: #1e293b; border: 1px solid #3b82f6; color: #38bdf8; padding: 3px 8px; font-size: 12px; border-radius: 3px; margin-right: 5px; margin-top: 5px; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: #070a13; }
      ::-webkit-scrollbar-thumb { background: #1f2d5a; border-radius: 3px; }
    </style>
  </head>
  <body>
    <header>
      <h1>🔐 JANDO360° ENGINE MATRIX v9006.0</h1>
      <div class="meta">OPERATOR: MIKE [TITAN] | SYSTEM STATE: RUNNING | LOCAL RELAY ONLINE</div>
      <div class="vault-stats">🗄️ VAULT: Last Scan at [${systemVault.lastScanTime}] | Tracked Nodes: ${systemVault.lastScanCount} | Cloud Key Handshakes: ${systemVault.totalCloudHandshakes}</div>
      <div style="margin-top:5px;">
        <strong>📡 SCAN MAPPED HARDWARE BRIDGES:</strong><br>
        ${dynamicDevices.map(d => `<span class="device-tag">🖥️ ${d.alias} (${d.ip}) - [${d.status}]</span>`).join('')}
      </div>
    </header>
    <main class="grid">
      ${pathSectionsHtml}
    </main>
  </body>
  </html>
  `;
  res.send(html);
});

// 🏁 BOOT CORE ENGINE WITH INTEGRATED DUCKDNS UPDATER
app.listen(PORT, '0.0.0.0', () => {
  console.clear();
  try { 
    require('./duckdns_updater.js'); 
  } catch(e) { 
    logEvent("ERROR", "DUCKDNS_ERR", "duckdns_updater.js script missing inside execution folder.", "\x1b[31m"); 
  }

  console.log(`===================================================================`);
  console.log(` 🔐 JANDO360° ENGINE CORE v9006.0 [VAULT HYBRID UPGRADE]`);
  console.log(`===================================================================`);
  console.log(` OPERATOR       : MIKE [TITAN]`);
  console.log(` LOCAL ENDPOINT : http://192.168.10.102:${PORT}`);
  console.log(` PERMANENT WAN  : http://jando360.duckdns.org:${PORT}`);
  console.log(` STORAGE VAULT  : ACTIVE (${systemVault.lastScanCount} nodes cached)`);
  console.log(`===================================================================`);
  console.log(`\n🚀 STANDBY MODE ACTIVE: Waiting for cloud connections...\n`);
});