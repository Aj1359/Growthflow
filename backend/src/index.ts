import { app } from './app.js';
import { startSendingWorker } from './services/senderWorker.js';
import { pool } from './db/pool.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`🚀 GrowthFlow Backend server listening on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/healthz`);
  
  // Ensure all existing active contacts have opt-in confirmed so they are broadcastable
  try {
    await pool.query("UPDATE contacts SET opt_in_confirmed_at = NOW() WHERE opt_in_confirmed_at IS NULL");
    await pool.query("UPDATE templates SET language = 'en_US' WHERE name LIKE '%durga_puja%'");
    await pool.query("UPDATE templates SET language = 'en_IN' WHERE name = 'fancy_new_test'");
  } catch (err: any) {
    console.warn('Opt-in/template backfill warning:', err.message);
  }

  startSendingWorker();
});
