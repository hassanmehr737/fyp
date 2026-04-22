/**
 * Database migration runner.
 * Run this once to set up all tables:
 *   npx ts-node src/db/migrate.ts
 */
import fs from 'fs';
import path from 'path';
import pool from './connection';

async function runMigrations() {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

    console.log(`Found ${files.length} migration(s)...`);

    for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        console.log(`Running: ${file}`);
        try {
            await pool.query(sql);
            console.log(`  ✅ ${file} complete`);
        } catch (err: any) {
            console.error(`  ❌ ${file} failed:`, err.message);
            process.exit(1);
        }
    }

    console.log('\n✅ All migrations complete!');
    await pool.end();
}

runMigrations();
