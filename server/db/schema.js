import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';

dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });
dotenv.config();

const dbPath = process.env.DB_PATH || (process.env.VERCEL ? '/tmp/facevision.db' : './data/facevision.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Pre-generate a demo hash for the password "demo1234"
const DEMO_HASH = bcryptjs.hashSync('demo1234', 10);

let db;
try {
  const m = await import('better-sqlite3');
  const RealDatabase = m.default;
  db = new RealDatabase(dbPath);
  console.log('✅ SQLite connected via better-sqlite3');
} catch (e) {
  console.warn('⚠️  better-sqlite3 native module not available. Using in-memory mock DB.');

  // In-memory store for mock DB
  const store = {
    users: new Map(),
    patients: new Map(),
    cases: new Map(),
    photos: new Map(),
    simulations: new Map(),
    surgical_plans: new Map(),
  };

  // Seed a demo user
  store.users.set('demo', {
    id: 'demo-doc-1',
    username: 'demo',
    password_hash: DEMO_HASH,
    role: 'surgeon',
    created_at: new Date().toISOString(),
  });

  class Statement {
    constructor(sql) {
      this.sql = sql;
    }

    get(...args) {
      // SELECT * FROM users WHERE username = ?
      if (this.sql.includes('FROM users') && this.sql.includes('username')) {
        return store.users.get(args[0]) || undefined;
      }
      // SELECT by id
      if (this.sql.includes('FROM users') && this.sql.includes('id')) {
        for (const u of store.users.values()) {
          if (u.id === args[0]) return u;
        }
        return undefined;
      }
      if (this.sql.includes('FROM patients')) {
        return store.patients.get(args[0]) || undefined;
      }
      if (this.sql.includes('FROM cases')) {
        return store.cases.get(args[0]) || undefined;
      }
      return undefined;
    }

    all(...args) {
      if (this.sql.includes('FROM patients')) {
        return Array.from(store.patients.values());
      }
      if (this.sql.includes('FROM cases')) {
        return Array.from(store.cases.values());
      }
      if (this.sql.includes('FROM photos')) {
        return Array.from(store.photos.values());
      }
      if (this.sql.includes('FROM simulations')) {
        return Array.from(store.simulations.values());
      }
      if (this.sql.includes('FROM surgical_plans')) {
        return Array.from(store.surgical_plans.values());
      }
      return [];
    }

    run(...args) {
      // INSERT INTO users
      if (this.sql.includes('INSERT INTO users')) {
        store.users.set(args[1], {
          id: args[0], username: args[1], password_hash: args[2],
          role: 'surgeon', created_at: new Date().toISOString()
        });
      }
      // INSERT INTO patients
      if (this.sql.includes('INSERT INTO patients')) {
        store.patients.set(args[0], {
          id: args[0], surgeon_id: args[1], first_name: args[2], last_name: args[3],
          national_id: args[4] || null, phone: args[5] || null,
          created_at: new Date().toISOString()
        });
      }
      return { lastInsertRowid: 1, changes: 1 };
    }
  }

  const MockDatabase = class {
    constructor(p) { this.path = p; }
    exec(sql) { /* no-op for CREATE TABLE statements */ }
    prepare(sql) { return new Statement(sql); }
    pragma(p) { return undefined; }
  };

  db = new MockDatabase(dbPath);
}

// Initialize schema (no-op for mock, creates tables for real DB)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'surgeon',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    surgeon_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    national_id TEXT UNIQUE,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (surgeon_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients (id)
  );

  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    file_path TEXT NOT NULL,
    view_type TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases (id)
  );

  CREATE TABLE IF NOT EXISTS simulations (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    original_photo_id TEXT NOT NULL,
    result_photo_path TEXT,
    status TEXT DEFAULT 'pending',
    parameters TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases (id),
    FOREIGN KEY (original_photo_id) REFERENCES photos (id)
  );

  CREATE TABLE IF NOT EXISTS surgical_plans (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    simulation_id TEXT NOT NULL,
    plan_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases (id),
    FOREIGN KEY (simulation_id) REFERENCES simulations (id)
  );
`);

export default db;
