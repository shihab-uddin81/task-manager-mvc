const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const { pool, init } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Initialize DB
init().then(() => {
  console.log('DB initialized');
}).catch(err => {
  console.error('DB init error', err);
  process.exit(1);
});

// Helpers
function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

async function findUserByUsername(username) {
  const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return res.rows[0];
}

// Auth
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const insert = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username', [username, hashed]);
    const user = insert.rows[0];
    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'username already exists' });
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    const user = await findUserByUsername(username);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = generateToken(user);
    res.json({ user: { id: user.id, username: user.username }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

// Auth middleware
function authMiddleware(req, res, next) {
  const hdr = req.headers.authorization;
  if (!hdr) return res.status(401).json({ error: 'no token' });
  const parts = hdr.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'bad auth header' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// Tasks CRUD
app.get('/api/tasks', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  res.json(result.rows);
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const result = await pool.query('INSERT INTO tasks (user_id, title, description) VALUES ($1,$2,$3) RETURNING *', [userId, title, description || '']);
  res.status(201).json(result.rows[0]);
});

app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;
  const { title, description, completed } = req.body;
  // Verify ownership
  const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
  if (!existing.rows[0]) return res.status(404).json({ error: 'not found' });
  if (existing.rows[0].user_id !== userId) return res.status(403).json({ error: 'forbidden' });
  const upd = await pool.query('UPDATE tasks SET title=$1, description=$2, completed=$3 WHERE id=$4 RETURNING *', [title || existing.rows[0].title, description || existing.rows[0].description, completed === undefined ? existing.rows[0].completed : completed, taskId]);
  res.json(upd.rows[0]);
});

app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;
  const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
  if (!existing.rows[0]) return res.status(404).json({ error: 'not found' });
  if (existing.rows[0].user_id !== userId) return res.status(403).json({ error: 'forbidden' });
  await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
  res.status(204).end();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Backend listening on', PORT));
