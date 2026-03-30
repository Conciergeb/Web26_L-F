const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.db');

db.run("ALTER TABLE lost_reports ADD COLUMN studentId TEXT", (err) => {
  if (err && !err.message.includes('duplicate column name')) console.error('studentId error:', err);
  else console.log('✅ studentId column added to lost_reports');
  db.close();
});
