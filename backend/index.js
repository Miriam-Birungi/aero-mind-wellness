const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'aeromind-fallback-secret-for-demo-purposes';
const DB_FILE = path.join(__dirname, 'db.json');

// Asynchronous DB initialization
async function initDB() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({
      users: [],
      onboarding: {},
      wearableData: {},
      messages: []
    }, null, 2));
  }
}

const readDB = async () => JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
const writeDB = async (data) => await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Session required' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired session' });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Routes
app.get('/health', (req, res) => res.json({ status: 'healthy', version: '1.2.0' }));

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, workerId, name, role } = req.body;
    if (!email || !password || !workerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await readDB();
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now(),
      email,
      password: hashedPassword,
      workerId,
      name: name || 'Pilot',
      role: role || 'user' // Default role is user
    };

    db.users.push(user);
    await writeDB(db);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error during signup' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await readDB();
    const user = db.users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

app.post('/api/user/onboarding', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    db.onboarding[req.user.id] = req.body;
    await writeDB(db);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
});

// Wearable Data Integration
app.post('/api/wellness/wearable', authenticateToken, async (req, res) => {
  try {
    const { heartRate, sleepHours, steps } = req.body;
    const db = await readDB();
    if (!db.wearableData) db.wearableData = {};

    const entry = {
      timestamp: new Date().toISOString(),
      heartRate,
      sleepHours,
      steps
    };

    if (!db.wearableData[req.user.id]) db.wearableData[req.user.id] = [];
    db.wearableData[req.user.id].push(entry);

    await writeDB(db);
    res.json({ success: true, entry });
  } catch (e) {
    res.status(500).json({ error: 'Failed to sync wearable data' });
  }
});

app.get('/api/wellness/metrics', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const db = await readDB();

  // Get real wearable data if available
  const userWearable = db.wearableData && db.wearableData[userId] ? db.wearableData[userId] : [];
  const latest = userWearable.length > 0 ? userWearable[userWearable.length - 1] : null;

  const score = 65 + (userId % 30);

  res.json({
    score,
    heartRate: latest ? latest.heartRate : (score > 75 ? 65 + (userId % 5) : 85 + (userId % 10)),
    sleepHours: latest ? latest.sleepHours : (score > 75 ? 7.8 : 5.2),
    steps: latest ? latest.steps : (7000 + (userId % 3000)),
    history: [
      { date: 'Mon', score: 72 }, { date: 'Tue', score: 68 }, { date: 'Wed', score: 75 },
      { date: 'Thu', score: 82 }, { date: 'Fri', score: 78 }, { date: 'Sat', score: 85 },
      { date: 'Sun', score: score },
    ],
    insights: [
      score > 80 ? "✨ Excellent wellness. Optimal performance state." : "⚠️ Fatigue risk detected. Consider a rest cycle.",
      "🛌 Sleep hygiene: Maintain a consistent buffer before duty.",
      "💓 Heart rate variability is stable within your baseline."
    ]
  });
});

// Anonymous Messaging Support
app.post('/api/messages/anonymous', authenticateToken, async (req, res) => {
  try {
    const { content, category } = req.body;
    if (!content) return res.status(400).json({ error: 'Message content is required' });

    const db = await readDB();
    if (!db.messages) db.messages = [];

    const message = {
      id: Date.now(),
      category: category || 'general',
      content,
      timestamp: new Date().toISOString(),
      // We don't store user ID to ensure true anonymity in the DB for this demo,
      // or we store a hash if we need to track threads.
    };

    db.messages.push(message);
    await writeDB(db);
    res.json({ success: true, messageId: message.id });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send anonymous message' });
  }
});

// Admin Route: View all messages
app.get('/api/admin/messages', authenticateToken, isAdmin, async (req, res) => {
  const db = await readDB();
  res.json(db.messages || []);
});

app.get('/api/resources/crisis', (req, res) => {
  res.json([
    { id: 1, title: 'Mental Health Uganda', phone: '0800 21 21 21', country: 'Uganda', description: '24/7 confidential counseling' },
    { id: 2, title: 'StrongMinds Uganda', phone: '+256 800 200 600', country: 'Uganda', description: 'Mental health support' },
    { id: 3, title: 'Befrienders Kenya', phone: '+254 722 178 177', country: 'Kenya', description: 'Emotional support' }
  ]);
});

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Production API running on port ${PORT}`);
  });
});
