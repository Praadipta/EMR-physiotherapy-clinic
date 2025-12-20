#!/bin/sh
set -e

echo "🔄 Checking database initialization..."

# Check if database exists and has tables
if [ ! -f /app/data/healthcare.db ]; then
    echo "📦 Database not found. Initializing..."
    cd /app && node -e "
const Database = require('better-sqlite3');
const { hash } = require('@node-rs/argon2');

async function init() {
    const db = new Database('/app/data/healthcare.db');
    
    // Create tables matching the Drizzle schema
    db.exec(\`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'fisioterapis')),
            nama_lengkap TEXT NOT NULL,
            no_telepon TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at INTEGER NOT NULL,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL UNIQUE,
            nama_lengkap TEXT NOT NULL,
            tanggal_lahir TEXT,
            jenis_kelamin TEXT CHECK (jenis_kelamin IN ('laki-laki', 'perempuan')),
            no_telepon TEXT,
            email TEXT,
            alamat TEXT,
            kontak_darurat TEXT,
            telepon_darurat TEXT,
            persetujuan_diberikan INTEGER DEFAULT 0,
            tanggal_persetujuan TEXT,
            created_at TEXT,
            updated_at TEXT,
            created_by INTEGER REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
            fisioterapis_id INTEGER NOT NULL REFERENCES users(id),
            tanggal_waktu TEXT NOT NULL,
            durasi_menit INTEGER DEFAULT 60,
            status TEXT DEFAULT 'dijadwalkan' CHECK (status IN ('dijadwalkan', 'selesai', 'dibatalkan', 'tidak_hadir')),
            catatan TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
            fisioterapis_id INTEGER NOT NULL REFERENCES users(id),
            tanggal_assessment TEXT NOT NULL,
            keluhan_utama TEXT NOT NULL,
            kondisi_cedera TEXT,
            bagian_tubuh_terdampak TEXT,
            skala_nyeri INTEGER DEFAULT 0,
            catatan_rom TEXT,
            catatan_tambahan TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS session_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
            patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
            fisioterapis_id INTEGER NOT NULL REFERENCES users(id),
            tanggal_sesi TEXT NOT NULL,
            subjective TEXT,
            objective TEXT,
            assessment TEXT,
            plan TEXT,
            tindakan_dilakukan TEXT,
            durasi_menit INTEGER DEFAULT 60,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS treatment_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
            fisioterapis_id INTEGER NOT NULL REFERENCES users(id),
            diagnosis TEXT NOT NULL,
            tujuan TEXT,
            jumlah_sesi_direncanakan INTEGER DEFAULT 1,
            jumlah_sesi_selesai INTEGER DEFAULT 0,
            status TEXT DEFAULT 'direncanakan' CHECK (status IN ('direncanakan', 'berlangsung', 'selesai', 'dihentikan')),
            tanggal_mulai TEXT,
            tanggal_selesai TEXT,
            catatan TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nomor_invoice TEXT NOT NULL UNIQUE,
            patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
            jumlah INTEGER NOT NULL,
            deskripsi TEXT,
            status TEXT DEFAULT 'belum_bayar' CHECK (status IN ('belum_bayar', 'sebagian', 'lunas')),
            tanggal_terbit TEXT NOT NULL,
            tanggal_jatuh_tempo TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
            jumlah INTEGER NOT NULL,
            metode_pembayaran TEXT CHECK (metode_pembayaran IN ('tunai', 'transfer', 'debit', 'kredit', 'qris')),
            tanggal_pembayaran TEXT NOT NULL,
            diterima_oleh INTEGER REFERENCES users(id),
            catatan TEXT,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id),
            aksi TEXT NOT NULL,
            nama_tabel TEXT NOT NULL,
            record_id INTEGER,
            nilai_lama TEXT,
            nilai_baru TEXT,
            ip_address TEXT,
            user_agent TEXT,
            timestamp TEXT
        );
    \`);

    console.log('✓ Tables created');

    // Create default users
    const adminPassword = await hash('admin123', {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });

    const terapisPassword = await hash('terapis123', {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });

    const now = new Date().toISOString();

    // Insert users
    db.prepare(\`INSERT OR IGNORE INTO users (username, email, password_hash, role, nama_lengkap, no_telepon, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\`).run('admin', 'admin@sambungnyowo.com', adminPassword, 'admin', 'Administrator', '081234567890', 1, now, now);
    db.prepare(\`INSERT OR IGNORE INTO users (username, email, password_hash, role, nama_lengkap, no_telepon, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\`).run('terapis1', 'terapis1@sambungnyowo.com', terapisPassword, 'fisioterapis', 'Dr. Budi Santoso, S.Ft', '081234567891', 1, now, now);
    db.prepare(\`INSERT OR IGNORE INTO users (username, email, password_hash, role, nama_lengkap, no_telepon, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\`).run('terapis2', 'terapis2@sambungnyowo.com', terapisPassword, 'fisioterapis', 'Dr. Siti Rahayu, S.Ft', '081234567892', 1, now, now);
    console.log('✓ Default users created');

    // Helper functions
    const getDateTimeStr = (daysFromNow, hour = 9) => {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        date.setHours(hour, 0, 0, 0);
        return date.toISOString();
    };

    const getDateOnly = (daysFromNow) => {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString().split('T')[0];
    };

    // Insert sample patients (10 patients)
    const patients = [
        ['PT-2024-00001', 'Ahmad Wijaya', '1985-05-15', 'laki-laki', '081111111111', 'ahmad@email.com', 'Jl. Merdeka No. 123, Solo', 'Siti Wijaya', '081111111112'],
        ['PT-2024-00002', 'Dewi Lestari', '1990-08-20', 'perempuan', '082222222222', 'dewi@email.com', 'Jl. Pahlawan No. 45, Solo', 'Budi Lestari', '082222222223'],
        ['PT-2024-00003', 'Bambang Susanto', '1975-12-10', 'laki-laki', '083333333333', null, 'Jl. Sudirman No. 78, Sukoharjo', null, null],
        ['PT-2024-00004', 'Sari Rahmawati', '1988-03-25', 'perempuan', '084444444444', 'sari.rahma@email.com', 'Jl. Gatot Subroto No. 56, Kartasura', 'Agus Rahmawati', '084444444445'],
        ['PT-2024-00005', 'Hendra Kurniawan', '1970-11-08', 'laki-laki', '085555555555', null, 'Jl. Ahmad Yani No. 90, Solo', null, null],
        ['PT-2024-00006', 'Rina Kusuma', '1995-07-12', 'perempuan', '086666666666', 'rina.kusuma@email.com', 'Jl. Slamet Riyadi No. 200, Solo', 'Dian Kusuma', '086666666667'],
        ['PT-2024-00007', 'Eko Prasetyo', '1982-09-30', 'laki-laki', '087777777777', null, 'Jl. Veteran No. 15, Boyolali', null, null],
        ['PT-2024-00008', 'Maya Saptiani', '1992-02-14', 'perempuan', '088888888888', 'maya.s@email.com', 'Jl. Diponegoro No. 33, Klaten', 'Yusuf Saptiani', '088888888889'],
        ['PT-2024-00009', 'Rudi Hartono', '1968-06-22', 'laki-laki', '089999999999', null, 'Jl. Pemuda No. 88, Sukoharjo', null, null],
        ['PT-2024-00010', 'Linda Permatasari', '1998-12-05', 'perempuan', '081010101010', 'linda.permata@email.com', 'Jl. Mangkubumi No. 12, Solo', 'Bima Permata', '081010101011']
    ];
    
    const insertPatient = db.prepare(\`INSERT INTO patients (patient_id, nama_lengkap, tanggal_lahir, jenis_kelamin, no_telepon, email, alamat, kontak_darurat, telepon_darurat, persetujuan_diberikan, tanggal_persetujuan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)\`);
    patients.forEach(p => insertPatient.run(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], now, now, now));
    console.log('✓ 10 patients created');

    // Insert appointments
    const appointments = [
        [1, 2, getDateTimeStr(-28, 9), 60, 'selesai', 'Sesi pertama, assessment awal'],
        [1, 2, getDateTimeStr(-21, 9), 60, 'selesai', 'Sesi kedua, latihan ROM'],
        [1, 2, getDateTimeStr(-14, 9), 60, 'selesai', 'Sesi ketiga, progress baik'],
        [1, 2, getDateTimeStr(-7, 9), 60, 'selesai', 'Sesi keempat'],
        [2, 3, getDateTimeStr(-25, 10), 45, 'selesai', 'Assessment awal post-stroke'],
        [2, 3, getDateTimeStr(-18, 10), 45, 'selesai', 'Latihan keseimbangan'],
        [2, 3, getDateTimeStr(-11, 10), 45, 'selesai', 'Progress baik'],
        [3, 2, getDateTimeStr(-20, 14), 60, 'selesai', 'Terapi nyeri punggung bawah'],
        [3, 2, getDateTimeStr(-13, 14), 60, 'selesai', 'Latihan core strengthening'],
        [4, 3, getDateTimeStr(-22, 11), 60, 'selesai', 'Assessment cedera lutut'],
        [4, 3, getDateTimeStr(-15, 11), 60, 'selesai', 'Latihan penguatan quadriceps'],
        [4, 3, getDateTimeStr(-8, 11), 60, 'selesai', 'Progress signifikan'],
        [5, 2, getDateTimeStr(-19, 15), 45, 'selesai', 'Terapi frozen shoulder'],
        [5, 2, getDateTimeStr(-12, 15), 45, 'selesai', 'Mobilisasi sendi bahu'],
        [6, 3, getDateTimeStr(-17, 9), 60, 'selesai', 'Assessment nyeri leher'],
        [6, 3, getDateTimeStr(-10, 9), 60, 'selesai', 'Terapi manual dan stretching'],
        [7, 2, getDateTimeStr(-16, 16), 60, 'dibatalkan', 'Pasien berhalangan'],
        [7, 2, getDateTimeStr(-9, 16), 60, 'selesai', 'Reschedule - terapi ankle sprain'],
        [8, 3, getDateTimeStr(-14, 13), 45, 'selesai', 'Assessment carpal tunnel syndrome'],
        [9, 2, getDateTimeStr(-23, 10), 60, 'selesai', 'Terapi osteoarthritis lutut'],
        [9, 2, getDateTimeStr(-16, 10), 60, 'tidak_hadir', 'Pasien tidak hadir tanpa konfirmasi'],
        [9, 2, getDateTimeStr(-9, 10), 60, 'selesai', 'Lanjutan terapi OA'],
        [10, 3, getDateTimeStr(-11, 14), 45, 'selesai', 'Assessment sports injury'],
        [1, 2, getDateTimeStr(1, 9), 60, 'dijadwalkan', 'Sesi kelima - evaluasi progress'],
        [2, 3, getDateTimeStr(2, 10), 45, 'dijadwalkan', 'Lanjutan terapi stroke'],
        [3, 2, getDateTimeStr(1, 14), 60, 'dijadwalkan', 'Evaluasi LBP'],
        [4, 3, getDateTimeStr(3, 11), 60, 'dijadwalkan', 'Sesi keempat lutut'],
        [5, 2, getDateTimeStr(2, 15), 45, 'dijadwalkan', 'Lanjutan frozen shoulder'],
        [6, 3, getDateTimeStr(4, 9), 60, 'dijadwalkan', 'Sesi ketiga nyeri leher'],
        [8, 3, getDateTimeStr(5, 13), 45, 'dijadwalkan', 'Lanjutan CTS'],
        [10, 3, getDateTimeStr(3, 14), 45, 'dijadwalkan', 'Sesi kedua sports injury']
    ];
    
    const insertAppointment = db.prepare(\`INSERT INTO appointments (patient_id, fisioterapis_id, tanggal_waktu, durasi_menit, status, catatan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)\`);
    appointments.forEach(a => insertAppointment.run(a[0], a[1], a[2], a[3], a[4], a[5], now, now));
    console.log('✓ 31 appointments created');

    // Insert assessments
    const assessments = [
        [1, 2, getDateOnly(-28), 'Nyeri punggung bawah setelah mengangkat beban berat', 'Strain otot lumbar akut', 'Lower back (L4-L5)', 7, 'Fleksi lumbar terbatas 50%'],
        [2, 3, getDateOnly(-25), 'Kelemahan sisi kanan tubuh pasca stroke', 'Post-stroke hemiparesis', 'Ekstremitas atas dan bawah kanan', 3, 'ROM aktif terbatas pada sisi kanan'],
        [3, 2, getDateOnly(-20), 'Nyeri punggung bawah kronik sudah 6 bulan', 'Chronic low back pain', 'Lumbar spine', 5, 'ROM lumbar sedikit terbatas'],
        [4, 3, getDateOnly(-22), 'Nyeri lutut kanan setelah bermain futsal', 'Ligament strain grade II (MCL)', 'Lutut kanan - medial', 6, 'Fleksi lutut terbatas 100 derajat'],
        [5, 2, getDateOnly(-19), 'Tidak bisa mengangkat tangan kiri ke atas', 'Frozen shoulder', 'Sendi bahu kiri', 6, 'Abduksi 60 derajat, fleksi 90 derajat'],
        [6, 3, getDateOnly(-17), 'Nyeri leher dan pundak, sering pusing', 'Cervical spondylosis', 'Cervical spine (C5-C7)', 5, 'Rotasi cervical terbatas bilateral'],
        [7, 2, getDateOnly(-9), 'Keseleo pergelangan kaki kiri saat bermain basket', 'Ankle sprain grade I', 'Pergelangan kaki kiri - lateral', 4, 'Dorsofleksi dan inversi terbatas'],
        [8, 3, getDateOnly(-14), 'Kesemutan dan nyeri pada tangan kanan', 'Carpal Tunnel Syndrome', 'Pergelangan tangan kanan', 4, 'ROM normal, Phalen test positif'],
        [9, 2, getDateOnly(-23), 'Nyeri lutut bilateral terutama saat naik tangga', 'Bilateral knee OA grade II', 'Lutut bilateral', 5, 'Fleksi lutut 120 derajat bilateral'],
        [10, 3, getDateOnly(-11), 'Nyeri hamstring kanan setelah sprint', 'Hamstring strain grade I', 'Hamstring kanan', 5, 'SLR terbatas 60 derajat']
    ];
    
    const insertAssessment = db.prepare(\`INSERT INTO assessments (patient_id, fisioterapis_id, tanggal_assessment, keluhan_utama, kondisi_cedera, bagian_tubuh_terdampak, skala_nyeri, catatan_rom, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`);
    assessments.forEach(a => insertAssessment.run(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], now, now));
    console.log('✓ 10 assessments created');

    // Insert treatment plans
    const treatmentPlans = [
        [1, 2, 'Acute Lumbar Strain', 'Mengurangi nyeri, meningkatkan ROM', 8, 4, 'berlangsung', getDateOnly(-28)],
        [2, 3, 'Post-stroke Hemiparesis Kanan', 'Meningkatkan kekuatan dan kemandirian ADL', 24, 3, 'berlangsung', getDateOnly(-25)],
        [3, 2, 'Chronic Mechanical Low Back Pain', 'Pain management, postural correction', 12, 2, 'berlangsung', getDateOnly(-20)],
        [4, 3, 'MCL Sprain Grade II', 'Full recovery dan return to sport', 10, 3, 'berlangsung', getDateOnly(-22)],
        [5, 2, 'Adhesive Capsulitis', 'Meningkatkan ROM dan mengurangi nyeri', 16, 2, 'berlangsung', getDateOnly(-19)],
        [6, 3, 'Cervicogenic Headache', 'Mengurangi frekuensi sakit kepala', 8, 2, 'berlangsung', getDateOnly(-17)],
        [7, 2, 'Lateral Ankle Sprain', 'Full recovery dan prevention re-injury', 4, 1, 'berlangsung', getDateOnly(-9)],
        [8, 3, 'Carpal Tunnel Syndrome', 'Mengurangi gejala dan mencegah progresivitas', 6, 1, 'berlangsung', getDateOnly(-14)],
        [9, 2, 'Bilateral Knee OA', 'Pain management dan maintain function', 12, 2, 'berlangsung', getDateOnly(-23)],
        [10, 3, 'Hamstring Strain Grade I', 'Full recovery dan return to sport', 6, 1, 'berlangsung', getDateOnly(-11)]
    ];
    
    const insertPlan = db.prepare(\`INSERT INTO treatment_plans (patient_id, fisioterapis_id, diagnosis, tujuan, jumlah_sesi_direncanakan, jumlah_sesi_selesai, status, tanggal_mulai, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`);
    treatmentPlans.forEach(t => insertPlan.run(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], now, now));
    console.log('✓ 10 treatment plans created');

    // Insert invoices
    const invoices = [
        ['INV-202411-0001', 1, 450000, 'Paket terapi 4 sesi - nyeri punggung bawah', 'lunas', getDateOnly(-28), getDateOnly(-14)],
        ['INV-202411-0002', 2, 350000, 'Paket terapi 3 sesi - rehabilitasi stroke', 'lunas', getDateOnly(-25), getDateOnly(-11)],
        ['INV-202411-0003', 3, 250000, 'Terapi 2 sesi - nyeri punggung kronik', 'sebagian', getDateOnly(-20), getDateOnly(-6)],
        ['INV-202411-0004', 4, 400000, 'Paket terapi cedera lutut 3 sesi', 'lunas', getDateOnly(-22), getDateOnly(-8)],
        ['INV-202411-0005', 5, 250000, 'Terapi frozen shoulder 2 sesi', 'belum_bayar', getDateOnly(-19), getDateOnly(-5)],
        ['INV-202411-0006', 6, 275000, 'Terapi nyeri leher 2 sesi + dry needling', 'lunas', getDateOnly(-17), getDateOnly(-3)],
        ['INV-202411-0007', 7, 150000, 'Terapi ankle sprain 1 sesi', 'lunas', getDateOnly(-9), getDateOnly(5)],
        ['INV-202411-0008', 8, 175000, 'Assessment dan terapi CTS 1 sesi', 'belum_bayar', getDateOnly(-14), getDateOnly(0)],
        ['INV-202411-0009', 9, 300000, 'Terapi OA lutut 2 sesi', 'lunas', getDateOnly(-23), getDateOnly(-9)],
        ['INV-202411-0010', 10, 150000, 'Assessment dan terapi hamstring 1 sesi', 'sebagian', getDateOnly(-11), getDateOnly(3)]
    ];
    
    const insertInvoice = db.prepare(\`INSERT INTO invoices (nomor_invoice, patient_id, jumlah, deskripsi, status, tanggal_terbit, tanggal_jatuh_tempo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\`);
    invoices.forEach(i => insertInvoice.run(i[0], i[1], i[2], i[3], i[4], i[5], i[6], now, now));
    console.log('✓ 10 invoices created');

    // Insert payments
    const payments = [
        [1, 450000, 'transfer', getDateOnly(-26), 1, 'Transfer BCA'],
        [2, 350000, 'tunai', getDateOnly(-23), 1, null],
        [3, 150000, 'qris', getDateOnly(-18), 1, 'DP 150rb, sisa 100rb'],
        [4, 400000, 'debit', getDateOnly(-20), 1, 'Kartu Mandiri'],
        [6, 275000, 'transfer', getDateOnly(-15), 1, 'Transfer BRI'],
        [7, 150000, 'tunai', getDateOnly(-9), 1, null],
        [9, 300000, 'kredit', getDateOnly(-21), 1, 'Visa'],
        [10, 100000, 'tunai', getDateOnly(-10), 1, 'DP, sisa 50rb']
    ];
    
    const insertPayment = db.prepare(\`INSERT INTO payments (invoice_id, jumlah, metode_pembayaran, tanggal_pembayaran, diterima_oleh, catatan, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)\`);
    payments.forEach(p => insertPayment.run(p[0], p[1], p[2], p[3], p[4], p[5], now));
    console.log('✓ 8 payments created');

    db.close();
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('  ✅ Database initialized successfully!');
    console.log('═══════════════════════════════════════════');
    console.log('  📋 Akun Default:');
    console.log('     admin / admin123');
    console.log('     terapis1 / terapis123');
    console.log('     terapis2 / terapis123');
    console.log('═══════════════════════════════════════════');
    console.log('  📊 Data Seed:');
    console.log('     - 10 pasien');
    console.log('     - 31 janji temu');
    console.log('     - 10 assessment klinis');
    console.log('     - 10 rencana perawatan');
    console.log('     - 10 invoice');
    console.log('     - 8 pembayaran');
    console.log('═══════════════════════════════════════════');
}

init().catch(console.error);
"
else
    echo "✓ Database exists"
fi

echo "🚀 Starting application..."
exec node build
