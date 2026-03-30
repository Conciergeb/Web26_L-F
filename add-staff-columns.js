const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.run("ALTER TABLE lost_reports ADD COLUMN staffRole INTEGER DEFAULT 0", (err) => {
    if (err && !err.message.includes('duplicate column name')) console.error('staffRole error:', err);
  });
  db.run("ALTER TABLE lost_reports ADD COLUMN staffDept TEXT", (err) => {
    if (err && !err.message.includes('duplicate column name')) console.error('staffDept error:', err);
  });
  db.run("ALTER TABLE lost_reports ADD COLUMN staffId TEXT", (err) => {
    if (err && !err.message.includes('duplicate column name')) console.error('staffId error:', err);
  });
  console.log('✅ Staff columns added to lost_reports (safe rerun)');
  db.close();
});
