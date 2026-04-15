const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const SECRET = 'mySecretKey123'; // use env variable in production

app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  const orig = res.json.bind(res);
  res.json = (body) => {
    console.log(`${req.method} ${req.path} HTTP/1.1`);
    console.log(' ', JSON.stringify(body));
    console.log(' ', res.statusCode);
    return orig(body);
  };
  next();
});

// ── Simulated user database ────────────────────────────
const USERS = [{ id: 1, username: 'admin', password: 'password123' }];

// ── JWT Middleware ─────────────────────────────────────
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── POST /api/login ────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(
    u => u.username === username && u.password === password
  );
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign(
    { id: user.id, username: user.username },
    SECRET,
    { expiresIn: '1h' }
  );
  res.json({ token });
});

// ── GET /api/protected ────────────────────────────────
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({
    message: `Welcome ${req.user.username}`,
    user: { id: req.user.id, username: req.user.username }
  });
});

app.listen(3001, () => console.log('Server on http://localhost:3001'));
