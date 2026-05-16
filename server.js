const express = require('express');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const SECURE_RELAY_KEY = process.env.SECURE_RELAY_KEY || "JANDO360_SECURE_KEY_2026";

app.use(express.json());

// ======================== MUSIC APIS DATABASE ========================
const MUSIC_APIS = [
  { name: "Spotify Web API", category: "Music", description: "Get track, artist, and album data from Spotify" },
  { name: "Last.fm API", category: "Music", description: "Music metadata, artist info, and scrobbling" },
  { name: "Genius API", category: "Music", description: "Song lyrics and artist information" },
  { name: "SoundCloud API", category: "Music", description: "Access tracks, playlists, and user data" },
  { name: "MusicBrainz", category: "Music", description: "Open music encyclopedia" },
  { name: "Deezer API", category: "Music", description: "Access to Deezer's music catalog" },
  { name: "TheAudioDB", category: "Music", description: "Music artist and track database" },
  { name: "Jamendo API", category: "Music", description: "Royalty-free music" },
  { name: "Musixmatch API", category: "Music", description: "Professional lyrics database" },
  { name: "Discogs API", category: "Music", description: "Recordings and artists database" },
  { name: "Bandcamp API", category: "Music", description: "Artist and album discovery" },
  { name: "Tastedive API", category: "Music", description: "Music recommendations" },
  { name: "ChartLyrics API", category: "Music", description: "Song lyrics search" },
  { name: "Vagalume API", category: "Music", description: "Song lyrics in multiple languages" },
  { name: "Shazam API", category: "Music", description: "Song recognition and metadata" }
];

// ======================== ENDPOINTS ========================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    music_apis: MUSIC_APIS.length,
    endpoints: ["/api/health", "/api/music/apis", "/api/music/search", "/api/network/scan"]
  });
});

// Get all music APIs
app.get('/api/music/apis', (req, res) => {
  res.json({ count: MUSIC_APIS.length, apis: MUSIC_APIS });
});

// Search music APIs
app.get('/api/music/search', (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) {
    return res.json({ error: "No query provided. Use ?q=spotify" });
  }
  const results = MUSIC_APIS.filter(api =>
    api.name.toLowerCase().includes(query) ||
    api.description.toLowerCase().includes(query)
  );
  res.json({ query, count: results.length, results });
});

// Network scan - POST
app.post('/api/network/scan', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== SECURE_RELAY_KEY) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  exec('arp -a', (error, stdout) => {
    if (error) {
      return res.json({ success: true, fallback: true, devices: [
        { ip: "192.168.1.1", alias: "ROUTER", status: "ACTIVE" },
        { ip: "192.168.1.100", alias: "COMPUTER", status: "ACTIVE" },
        { ip: "192.168.10.102", alias: "TITAN_HOST", status: "ACTIVE" }
      ]});
    }

    const devices = [];
    const lines = stdout.split('\n');
    lines.forEach(line => {
      const ipMatch = line.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
      if (ipMatch) {
        const ip = ipMatch[1];
        if (!ip.endsWith('.255') && !ip.startsWith('224.') && !ip.startsWith('127.')) {
          let alias = "DEVICE";
          if (ip.endsWith('.1')) alias = "ROUTER";
          if (ip === "192.168.10.102") alias = "TITAN_HOST";
          devices.push({ ip: ip, alias: alias, status: "ACTIVE" });
        }
      }
    });
    res.json({ success: true, devices: devices });
  });
});

// Network scan - GET (for testing)
app.get('/api/network/scan', (req, res) => {
  res.json({
    success: true,
    message: "Use POST method with X-API-Key header for actual scan",
    example_devices: [
      { ip: "192.168.1.1", alias: "ROUTER" },
      { ip: "192.168.10.102", alias: "TITAN_HOST" }
    ]
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>JANDO360 Relay Server</title>
      <style>
        body { background: #0a0f1d; color: #4af626; font-family: monospace; padding: 20px; }
        h1 { color: #fff; }
        .endpoint { color: #38bdf8; }
        .success { color: #4af626; }
      </style>
    </head>
    <body>
      <h1>JANDO360 Relay Server v4.0</h1>
      <p class="success">Status: RUNNING</p>
      <p>Music APIs: ${MUSIC_APIS.length} available</p>
      <hr>
      <h3>Available Endpoints:</h3>
      <ul>
        <li><span class="endpoint">GET /api/health</span> - Health check</li>
        <li><span class="endpoint">GET /api/music/apis</span> - List all music APIs</li>
        <li><span class="endpoint">GET /api/music/search?q=spotify</span> - Search music APIs</li>
        <li><span class="endpoint">POST /api/network/scan</span> - Scan network (requires API key header)</li>
      </ul>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
===================================================================
 JANDO360 RELAY SERVER v4.0 - RUNNING
===================================================================
 PORT: ${PORT}
 MUSIC APIS: ${MUSIC_APIS.length}
 HEALTH ENDPOINT: /api/health
===================================================================
  `);
});