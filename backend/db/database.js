import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const dbFile = process.env.DATABASE_PATH || path.join(process.cwd(), 'backend', 'db', 'seedbar.sqlite');
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

export const db = new Database(dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      team_size INTEGER NOT NULL DEFAULT 1,
      current_content TEXT NOT NULL,
      deleted_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_versions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      generated_content TEXT NOT NULL,
      label TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_autosaves (
      project_id TEXT PRIMARY KEY,
      autosave_data TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_snapshots (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      snapshot_data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS monthly_usage (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      month_key TEXT NOT NULL,
      generation_count INTEGER NOT NULL DEFAULT 0,
      expand_count INTEGER NOT NULL DEFAULT 0,
      export_count INTEGER NOT NULL DEFAULT 0,
      music_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, month_key),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS billing_profiles (
      user_id TEXT PRIMARY KEY,
      provider TEXT NOT NULL DEFAULT 'web',
      platform TEXT,
      plan TEXT NOT NULL DEFAULT 'free',
      product_id TEXT,
      entitlement_id TEXT,
      status TEXT NOT NULL DEFAULT 'inactive',
      expires_at TEXT,
      receipt_id TEXT,
      last_verified_at TEXT,
      raw_payload TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_versions_project_id ON project_versions(project_id);
    CREATE INDEX IF NOT EXISTS idx_snapshots_project_id ON project_snapshots(project_id);
    CREATE INDEX IF NOT EXISTS idx_monthly_usage_user_month ON monthly_usage(user_id, month_key);
    CREATE INDEX IF NOT EXISTS idx_billing_profiles_plan ON billing_profiles(plan);
  `);

  const projectColumns = db.prepare(`PRAGMA table_info(projects)`).all();
  if (!projectColumns.some((column) => column.name === 'status')) {
    db.exec(`ALTER TABLE projects ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'`);
  }
  if (!projectColumns.some((column) => column.name === 'deleted_at')) {
    db.exec(`ALTER TABLE projects ADD COLUMN deleted_at TEXT`);
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);
  `);
}

migrate();
