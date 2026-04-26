const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  password: 'password',
  host: 'localhost',
  port: 5432,
  database: 'planner'
});

app.post('/schedule', async (req, res) => {
  const { user_id, day, status, meta } = req.body;

  await pool.query(`
    INSERT INTO schedules (user_id, day, status, start_time, end_time)
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (user_id, day)
    DO UPDATE SET
      status = EXCLUDED.status,
      start_time = EXCLUDED.start_time,
      end_time = EXCLUDED.end_time
  `, [user_id, day, status, meta?.start || null, meta?.end || null]);

  res.json({ success: true });
});

app.get('/schedule/:userId', async (req, res) => {
  const { userId } = req.params;
  const { month } = req.query; // формат YYYY-MM

  const result = await pool.query(
    `SELECT * FROM schedules
     WHERE user_id = $1
       AND TO_CHAR(day, 'YYYY-MM') = $2
     ORDER BY day`,
    [userId, month]
  );

  res.json(result.rows.map(row => ({
    day: row.day,
    status: row.status,
    meta: row.start_time ? {
      start: row.start_time.slice(0,5),
      end: row.end_time.slice(0,5)
    } : null
  })));
});

app.listen(8000, () => console.log('Server started on 8000'));