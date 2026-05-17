const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint - This is what the Google Apps Script needs
app.get('/api/health', (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    music_apis: 15,
    message: "JANDO360 relay is running"
  });
});

// Music APIs endpoint
app.get('/api/music/apis', (req, res) => {
  const apis = [
    { name: "Spotify API", category: "Music", description: "Get artist and track data" },
    { name: "Last.fm API", category: "Music", description: "Music metadata" },
    { name: "Genius API", category: "Music", description: "Song lyrics" }
  ];
  res.json({ count: apis.length, apis: apis });
});

// Network scan endpoint
app.post('/api/network/scan', (req, res) => {
  res.json({
    success: true,
    devices: [
      { ip: "192.168.1.1", alias: "ROUTER", status: "ACTIVE" },
      { ip: "192.168.10.102", alias: "TITAN_HOST", status: "ACTIVE" }
    ]
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="background:#0a0f1d; color:#4af626; font-family:monospace; padding:20px;">
        <h1>JANDO360 Relay Server</h1>
        <p>Status: RUNNING</p>
        <p>Endpoints:</p>
        <ul>
          <li>GET /api/health</li>
          <li>GET /api/music/apis</li>
          <li>POST /api/network/scan</li>
        </ul>
        <p>Ready to accept requests from JANDO360 Heartbeat</p>
      </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('JANDO360 Relay Server running on port ' + PORT);
  console.log('Health check: http://localhost:' + PORT + '/api/health');
});