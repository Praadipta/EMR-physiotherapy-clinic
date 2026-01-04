import Database from 'better-sqlite3';

const db = new Database('./data/healthcare.db');

// Create referrals table if it doesn't exist
db.exec(`
CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id),
    direction TEXT NOT NULL CHECK(direction IN ('incoming', 'outgoing')),
    referrer_name TEXT NOT NULL,
    referrer_specialty TEXT,
    referrer_phone TEXT,
    referrer_email TEXT,
    referrer_address TEXT,
    refer_to_name TEXT,
    refer_to_specialty TEXT,
    refer_to_phone TEXT,
    refer_to_address TEXT,
    diagnosis TEXT,
    reason_for_referral TEXT NOT NULL,
    clinical_summary TEXT,
    urgency TEXT DEFAULT 'routine' CHECK(urgency IN ('routine', 'urgent', 'emergency')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'in_progress', 'completed', 'declined', 'cancelled')),
    referral_date TEXT NOT NULL,
    appointment_date TEXT,
    completed_date TEXT,
    response_notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
`);

// Create clinical_templates table if it doesn't exist
db.exec(`
CREATE TABLE IF NOT EXISTS clinical_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_by INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('musculoskeletal', 'neurological', 'cardiopulmonary', 'pediatric', 'geriatric', 'sports', 'post_surgical', 'other')),
    condition TEXT NOT NULL,
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    recommended_exercises TEXT,
    expected_duration TEXT,
    expected_sessions INTEGER,
    is_active INTEGER DEFAULT 1,
    is_public INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
`);

// Create collaboration_notes table if it doesn't exist
db.exec(`
CREATE TABLE IF NOT EXISTS collaboration_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id),
    note_type TEXT NOT NULL CHECK(note_type IN ('handover', 'consult', 'update', 'alert', 'question', 'response')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
    is_private INTEGER DEFAULT 0,
    mentioned_users TEXT,
    is_resolved INTEGER DEFAULT 0,
    resolved_by INTEGER REFERENCES users(id),
    resolved_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
`);

console.log('✅ Workflow tables created successfully!');

// Check if tables exist
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in database:', tables.map((t: any) => t.name).join(', '));

db.close();
