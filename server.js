const express = require('express');
const Redis = require('redis');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const CryptoJS = require('crypto-js');

const app = express();
app.use(express.json());

// ⚠️ REMPLACE CES 4 VALEURS PAR LES TIENNES ENTRE LES GUILLEMETS
const REDIS_URL = 'redis://default:ton_password@ton_endpoint_upstash.io:port'; 
const FB_PIXEL_ID = 'TON_PIXEL_ID';
const FB_TOKEN = 'TON_TOKEN_CAPI';
const BINOM_URL = 'https://ton-tracker.binom.org';

const redis = Redis.createClient({ url: REDIS_URL });
redis.on('error', (err) => console.log('Redis Error', err));
redis.connect().catch(console.error);

app.get('/', (req, res) => {
  res.send('Proxy OK ! Le serveur tourne.');
});

app.post('/track-lp', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ua = req.get('user-agent');
    const fp = CryptoJS.SHA256(ip + ua.slice(0, 100)).toString().slice(0, 16);
    
    await redis.setEx(`track:${fp}`, 86400, JSON.stringify(req.body));
    res.json({ status: 'LP tracked', fingerprint: fp });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/of-sub', async (req, res) => {
  console.log('Webhook OF reçu !');
  res.json({ received: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serveur prêt sur le port ${port}`));
