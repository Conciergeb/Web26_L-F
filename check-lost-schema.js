const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.db');
db.all("PRAGMA table_info(lost_reports)", (err, rows) => {
  console.log('lost_reports columns:', rows.map(r => r.name));
  db.close();
});
