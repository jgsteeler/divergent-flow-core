// jest-global-setup.js
// Creates a unique Postgres test DB, runs migrations, and sets DATABASE_URL for tests
const { execSync } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const baseDbUrl = process.env.TEST_DATABASE_URL || 'postgresql://divergent:divergentpw@localhost:5432/postgres';
const testDbName = `div_flo_test_${uuidv4().replace(/-/g, '')}`;
const testDbUrl = baseDbUrl.replace(/\/(postgres|template1|postgresql|[a-zA-Z0-9_\-]+)$/, `/${testDbName}`);

module.exports = async () => {
  // 1. Create the test DB
  const client = new Client({ connectionString: baseDbUrl });
  await client.connect();
  await client.query(`CREATE DATABASE "${testDbName}";`);
  await client.end();

  // 2. Run Prisma migrations on the new DB
  // Use schema from div-flo-models
  const schemaPath = path.resolve(__dirname, '../div-flo-models/prisma/schema.prisma');
  execSync(`DATABASE_URL='${testDbUrl}' npx prisma migrate deploy --schema "${schemaPath}"`, { stdio: 'inherit' });

  // 3. Write the test DB URL to a temp file for teardown
  fs.writeFileSync(path.join(__dirname, 'test-db-url.txt'), testDbUrl);

  // 4. Set DATABASE_URL for the test process
  process.env.DATABASE_URL = testDbUrl;
};
