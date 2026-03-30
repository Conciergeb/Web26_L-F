const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.run("ALTER TABLE found_reports ADD COLUMN studentId TEXT", (err) => {
    if (err && !err.message.includes('duplicate column name')) console.error('studentId error:', err);
  });
  db.run("ALTER TABLE found_reports ADD COLUMN staffId TEXT", (err) => {
    if (err && !err.message.includes('duplicate column name')) console.error('staffId error:', err);
  });
  console.log('✅ Found ID columns added (safe rerun)');
  db.close();
});
