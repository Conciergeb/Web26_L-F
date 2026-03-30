const { db } = require('./db.js');
const path = require('path');

console.log('Clearing user data from database...');

const tables = ['Users', 'lost_reports', 'found_reports'];

let clearedCount = 0;

tables.forEach(table => {
  db.run(`DELETE FROM ${table}`, function(err) {
    if (err) {
      console.error(`Error clearing ${table}:`, err.message);
    } else {
      clearedCount += this.changes;
      console.log(`${table}: cleared ${this.changes} rows`);
      
      // Reset AUTOINCREMENT after delete
      db.run(`DELETE FROM sqlite_sequence WHERE name = ?`, [table]);
    }
  });
});

db.close(() => {
  console.log(`\\n✅ All user data cleared. Total rows deleted: ${clearedCount}`);
  console.log('Restart server with: node server.js');
  console.log('Verify with: node check-db.js then sqlite3 database.db "SELECT COUNT(*) FROM Users;" etc.');
});
