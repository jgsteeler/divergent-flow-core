// jest-global-teardown.js
// Drops the Postgres test DB created in global setup
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const testDbUrlPath = path.join(__dirname, 'test-db-url.txt');
  
  // Skip teardown if DB was never set up
  if (!fs.existsSync(testDbUrlPath)) {
    return;
  }

  try {
    const testDbUrl = fs.readFileSync(testDbUrlPath, 'utf8');
    const match = testDbUrl.match(/\/([a-zA-Z0-9_\-]+)$/);
    const testDbName = match ? match[1] : null;
    const baseDbUrl = testDbUrl.replace(/\/[a-zA-Z0-9_\-]+$/, '/postgres');

    if (testDbName) {
      const client = new Client({ connectionString: baseDbUrl });
      await client.connect();
      // Terminate all connections to the test DB
      await client.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${testDbName}';`);
      await client.query(`DROP DATABASE IF EXISTS "${testDbName}";`);
      await client.end();
    }
    fs.unlinkSync(testDbUrlPath);
  } catch (error) {
    console.warn('Warning: Error during test database cleanup:', error.message);
    // Clean up the file anyway
    if (fs.existsSync(testDbUrlPath)) {
      fs.unlinkSync(testDbUrlPath);
    }
  }
};
