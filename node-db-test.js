const { db } = require('./db');

console.log('Testing lost_reports table...');

db.all("PRAGMA table_info(lost_reports)", [], (err, rows) => {
  if (err) console.error('Table info error:', err);
  else console.log('lost_reports schema:', rows);
});

db.get("SELECT COUNT(*) as count FROM lost_reports", [], (err, row) => {
  if (err) console.error('Count error:', err);
  else console.log('Lost reports count:', row.count);
});

db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='lost_reports'", [], (err, row) => {
  console.log('Table exists?', !!row);
});
