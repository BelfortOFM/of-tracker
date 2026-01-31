const express = require('express');
const Redis = require('redis');
const fetch = require('node-fetch');
const CryptoJS = require('crypto-js');

const app = express();
app.use(express.json());

// ⚠️ REMPLACE ÇA APRÈS ÉTAPE 2
const REDIS_URL = 'XXXX';
const FB_PIXEL_ID = 'YYYY';
const FB_TOKEN = 'ZZZZ';
const BINOM_URL = 'AAAA';

const redis = Redis.createClient({ url: `redis://${REDIS_URL}` });
redis.connect();

app.get('/', (req, res) => res.send('Proxy OK !'));

app.post('/track-lp', async (req, res) => {
  const fp = CryptoJS.SHA256(req.ip + req.get('user-agent')).toString().slice(0,16);
  await redis.setex(`track:${fp}`, 3600, JSON.stringify(req.body));
  res.json({ status: 'LP tracked', fp });
});

app.post('/of-sub', async (req, res) => {
  console.log('SUB reçu:', req.body);
  res.json({ ok: 1 });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy sur port ${port}`));
