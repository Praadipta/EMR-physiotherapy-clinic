import Database from 'better-sqlite3';

const db = new Database('./data/healthcare.db');

// Create ICD-10 table if not exists
db.exec(`
CREATE TABLE IF NOT EXISTS icd10_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    description_id TEXT,
    category TEXT NOT NULL CHECK(category IN ('M', 'S', 'G', 'I', 'J', 'R', 'Z', 'OTHER')),
    subcategory TEXT,
    is_common INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);
`);

// Common Physiotherapy ICD-10 Codes
const icd10Codes = [
    // ========== M CODES - MUSCULOSKELETAL ==========
    // Back/Spine
    { code: 'M54.5', description: 'Low back pain', descriptionId: 'Nyeri punggung bawah', category: 'M', subcategory: 'Back', isCommon: true },
    { code: 'M54.2', description: 'Cervicalgia', descriptionId: 'Nyeri leher', category: 'M', subcategory: 'Back', isCommon: true },
    { code: 'M54.4', description: 'Lumbago with sciatica', descriptionId: 'Lumbago dengan sciatica', category: 'M', subcategory: 'Back', isCommon: true },
    { code: 'M54.6', description: 'Pain in thoracic spine', descriptionId: 'Nyeri tulang belakang thorakal', category: 'M', subcategory: 'Back', isCommon: true },
    { code: 'M47.8', description: 'Other spondylosis', descriptionId: 'Spondilosis lainnya', category: 'M', subcategory: 'Back', isCommon: true },
    { code: 'M50.1', description: 'Cervical disc disorder with radiculopathy', descriptionId: 'Gangguan diskus servikal dengan radikulopati', category: 'M', subcategory: 'Back', isCommon: true },
    { code: 'M51.1', description: 'Lumbar disc degeneration', descriptionId: 'Degenerasi diskus lumbal', category: 'M', subcategory: 'Back', isCommon: true },
    { code: 'M51.2', description: 'Other intervertebral disc displacement', descriptionId: 'Hernia Nucleus Pulposus (HNP)', category: 'M', subcategory: 'Back', isCommon: true },
    { code: 'M48.0', description: 'Spinal stenosis', descriptionId: 'Stenosis spinal', category: 'M', subcategory: 'Back', isCommon: true },
    { code: 'M53.1', description: 'Cervicobrachial syndrome', descriptionId: 'Sindrom servikobrakial', category: 'M', subcategory: 'Back', isCommon: true },

    // Shoulder
    { code: 'M75.0', description: 'Adhesive capsulitis of shoulder', descriptionId: 'Frozen Shoulder', category: 'M', subcategory: 'Shoulder', isCommon: true },
    { code: 'M75.1', description: 'Rotator cuff syndrome', descriptionId: 'Sindrom rotator cuff', category: 'M', subcategory: 'Shoulder', isCommon: true },
    { code: 'M75.2', description: 'Bicipital tendinitis', descriptionId: 'Tendinitis biseps', category: 'M', subcategory: 'Shoulder', isCommon: true },
    { code: 'M75.3', description: 'Calcific tendinitis of shoulder', descriptionId: 'Tendinitis kalsifikasi bahu', category: 'M', subcategory: 'Shoulder', isCommon: true },
    { code: 'M75.4', description: 'Impingement syndrome of shoulder', descriptionId: 'Sindrom impingement bahu', category: 'M', subcategory: 'Shoulder', isCommon: true },
    { code: 'M75.5', description: 'Bursitis of shoulder', descriptionId: 'Bursitis bahu', category: 'M', subcategory: 'Shoulder', isCommon: true },

    // Knee
    { code: 'M17.0', description: 'Primary osteoarthritis of knee, bilateral', descriptionId: 'Osteoartritis lutut primer bilateral', category: 'M', subcategory: 'Knee', isCommon: true },
    { code: 'M17.1', description: 'Primary osteoarthritis of knee, unilateral', descriptionId: 'Osteoartritis lutut primer unilateral', category: 'M', subcategory: 'Knee', isCommon: true },
    { code: 'M22.0', description: 'Recurrent dislocation of patella', descriptionId: 'Dislokasi patela berulang', category: 'M', subcategory: 'Knee', isCommon: true },
    { code: 'M22.2', description: 'Patellofemoral disorders', descriptionId: 'Gangguan patellofemoral', category: 'M', subcategory: 'Knee', isCommon: true },
    { code: 'M22.4', description: 'Chondromalacia patellae', descriptionId: 'Kondromalasia patela', category: 'M', subcategory: 'Knee', isCommon: true },
    { code: 'M23.2', description: 'Derangement of meniscus', descriptionId: 'Gangguan meniskus', category: 'M', subcategory: 'Knee', isCommon: true },
    { code: 'M23.5', description: 'Chronic instability of knee', descriptionId: 'Ketidakstabilan lutut kronis', category: 'M', subcategory: 'Knee', isCommon: true },
    { code: 'M70.4', description: 'Prepatellar bursitis', descriptionId: 'Bursitis prepatelar', category: 'M', subcategory: 'Knee', isCommon: true },

    // Hip
    { code: 'M16.0', description: 'Primary osteoarthritis of hip, bilateral', descriptionId: 'Osteoartritis pinggul primer bilateral', category: 'M', subcategory: 'Hip', isCommon: true },
    { code: 'M16.1', description: 'Primary osteoarthritis of hip, unilateral', descriptionId: 'Osteoartritis pinggul primer unilateral', category: 'M', subcategory: 'Hip', isCommon: true },
    { code: 'M70.6', description: 'Trochanteric bursitis', descriptionId: 'Bursitis trochanter', category: 'M', subcategory: 'Hip', isCommon: true },
    { code: 'M76.0', description: 'Gluteal tendinitis', descriptionId: 'Tendinitis gluteal', category: 'M', subcategory: 'Hip', isCommon: true },

    // Ankle/Foot
    { code: 'M77.3', description: 'Calcaneal spur', descriptionId: 'Taji tumit', category: 'M', subcategory: 'Ankle/Foot', isCommon: true },
    { code: 'M72.2', description: 'Plantar fasciitis', descriptionId: 'Plantar fasciitis', category: 'M', subcategory: 'Ankle/Foot', isCommon: true },
    { code: 'M77.5', description: 'Other enthesopathy of foot', descriptionId: 'Entesopati kaki lainnya', category: 'M', subcategory: 'Ankle/Foot', isCommon: true },
    { code: 'M76.6', description: 'Achilles tendinitis', descriptionId: 'Tendinitis Achilles', category: 'M', subcategory: 'Ankle/Foot', isCommon: true },
    { code: 'M19.0', description: 'Primary osteoarthritis of ankle/foot', descriptionId: 'Osteoartritis pergelangan kaki primer', category: 'M', subcategory: 'Ankle/Foot', isCommon: true },

    // Elbow/Wrist/Hand
    { code: 'M77.0', description: 'Medial epicondylitis', descriptionId: 'Golfers elbow', category: 'M', subcategory: 'Elbow', isCommon: true },
    { code: 'M77.1', description: 'Lateral epicondylitis', descriptionId: 'Tennis elbow', category: 'M', subcategory: 'Elbow', isCommon: true },
    { code: 'M65.4', description: 'Radial styloid tenosynovitis', descriptionId: 'De Quervain syndrome', category: 'M', subcategory: 'Wrist', isCommon: true },
    { code: 'M18.0', description: 'Primary osteoarthritis of first CMC joint', descriptionId: 'Osteoartritis CMC I', category: 'M', subcategory: 'Hand', isCommon: true },
    { code: 'M65.3', description: 'Trigger finger', descriptionId: 'Trigger finger', category: 'M', subcategory: 'Hand', isCommon: true },

    // General Musculoskeletal
    { code: 'M79.1', description: 'Myalgia', descriptionId: 'Nyeri otot', category: 'M', subcategory: 'General', isCommon: true },
    { code: 'M79.2', description: 'Neuralgia and neuritis', descriptionId: 'Neuralgia dan neuritis', category: 'M', subcategory: 'General', isCommon: true },
    { code: 'M79.3', description: 'Panniculitis', descriptionId: 'Panniculitis', category: 'M', subcategory: 'General', isCommon: false },
    { code: 'M79.6', description: 'Pain in limb', descriptionId: 'Nyeri ekstremitas', category: 'M', subcategory: 'General', isCommon: true },
    { code: 'M79.7', description: 'Fibromyalgia', descriptionId: 'Fibromyalgia', category: 'M', subcategory: 'General', isCommon: true },
    { code: 'M25.5', description: 'Pain in joint', descriptionId: 'Nyeri sendi', category: 'M', subcategory: 'General', isCommon: true },
    { code: 'M25.6', description: 'Stiffness of joint', descriptionId: 'Kekakuan sendi', category: 'M', subcategory: 'General', isCommon: true },
    { code: 'M62.8', description: 'Other specified disorders of muscle', descriptionId: 'Gangguan otot lainnya', category: 'M', subcategory: 'General', isCommon: false },

    // ========== S CODES - INJURIES ==========
    // Shoulder/Arm Injuries
    { code: 'S43.4', description: 'Sprain of shoulder joint', descriptionId: 'Sprain sendi bahu', category: 'S', subcategory: 'Shoulder', isCommon: true },
    { code: 'S46.0', description: 'Injury of tendon of rotator cuff', descriptionId: 'Cedera tendon rotator cuff', category: 'S', subcategory: 'Shoulder', isCommon: true },

    // Knee Injuries
    { code: 'S83.0', description: 'Dislocation of patella', descriptionId: 'Dislokasi patela', category: 'S', subcategory: 'Knee', isCommon: true },
    { code: 'S83.2', description: 'Tear of meniscus', descriptionId: 'Robekan meniskus', category: 'S', subcategory: 'Knee', isCommon: true },
    { code: 'S83.4', description: 'Sprain of lateral collateral ligament', descriptionId: 'Sprain LCL', category: 'S', subcategory: 'Knee', isCommon: true },
    { code: 'S83.5', description: 'Sprain of anterior cruciate ligament', descriptionId: 'Sprain ACL', category: 'S', subcategory: 'Knee', isCommon: true },
    { code: 'S83.6', description: 'Sprain of posterior cruciate ligament', descriptionId: 'Sprain PCL', category: 'S', subcategory: 'Knee', isCommon: true },

    // Ankle Injuries
    { code: 'S93.4', description: 'Sprain of ankle', descriptionId: 'Sprain pergelangan kaki', category: 'S', subcategory: 'Ankle', isCommon: true },
    { code: 'S86.0', description: 'Injury of Achilles tendon', descriptionId: 'Cedera tendon Achilles', category: 'S', subcategory: 'Ankle', isCommon: true },

    // Back Injuries
    { code: 'S33.5', description: 'Sprain of lumbar spine', descriptionId: 'Sprain tulang belakang lumbal', category: 'S', subcategory: 'Back', isCommon: true },
    { code: 'S13.4', description: 'Sprain of cervical spine', descriptionId: 'Whiplash injury', category: 'S', subcategory: 'Back', isCommon: true },

    // ========== G CODES - NERVOUS SYSTEM ==========
    { code: 'G56.0', description: 'Carpal tunnel syndrome', descriptionId: 'Sindrom terowongan karpal', category: 'G', subcategory: 'Entrapment', isCommon: true },
    { code: 'G56.1', description: 'Other lesions of median nerve', descriptionId: 'Lesi nervus medianus lainnya', category: 'G', subcategory: 'Entrapment', isCommon: false },
    { code: 'G56.2', description: 'Lesion of ulnar nerve', descriptionId: 'Cubital tunnel syndrome', category: 'G', subcategory: 'Entrapment', isCommon: true },
    { code: 'G57.0', description: 'Lesion of sciatic nerve', descriptionId: 'Lesi nervus ischiadikus', category: 'G', subcategory: 'Entrapment', isCommon: true },
    { code: 'G57.1', description: 'Meralgia paresthetica', descriptionId: 'Meralgia parestetika', category: 'G', subcategory: 'Entrapment', isCommon: true },
    { code: 'G57.3', description: 'Lesion of lateral popliteal nerve', descriptionId: 'Lesi nervus peroneus', category: 'G', subcategory: 'Entrapment', isCommon: true },
    { code: 'G57.5', description: 'Tarsal tunnel syndrome', descriptionId: 'Sindrom terowongan tarsal', category: 'G', subcategory: 'Entrapment', isCommon: true },
    { code: 'G58.9', description: 'Mononeuropathy, unspecified', descriptionId: 'Mononeuropati', category: 'G', subcategory: 'Neuropathy', isCommon: true },

    // Neurological Conditions
    { code: 'G80.0', description: 'Spastic quadriplegic cerebral palsy', descriptionId: 'Cerebral palsy spastik quadriplegia', category: 'G', subcategory: 'Neuro', isCommon: true },
    { code: 'G80.1', description: 'Spastic diplegic cerebral palsy', descriptionId: 'Cerebral palsy spastik diplegia', category: 'G', subcategory: 'Neuro', isCommon: true },
    { code: 'G81.1', description: 'Spastic hemiplegia', descriptionId: 'Hemiplegia spastik', category: 'G', subcategory: 'Neuro', isCommon: true },
    { code: 'G82.2', description: 'Paraplegia', descriptionId: 'Paraplegia', category: 'G', subcategory: 'Neuro', isCommon: true },
    { code: 'G35', description: 'Multiple sclerosis', descriptionId: 'Multiple sclerosis', category: 'G', subcategory: 'Neuro', isCommon: false },
    { code: 'G20', description: 'Parkinson disease', descriptionId: 'Penyakit Parkinson', category: 'G', subcategory: 'Neuro', isCommon: true },

    // ========== I CODES - CIRCULATORY ==========
    { code: 'I63.9', description: 'Cerebral infarction, unspecified', descriptionId: 'Stroke iskemik', category: 'I', subcategory: 'Stroke', isCommon: true },
    { code: 'I69.3', description: 'Sequelae of cerebral infarction', descriptionId: 'Sekuele stroke', category: 'I', subcategory: 'Stroke', isCommon: true },
    { code: 'I61.9', description: 'Intracerebral hemorrhage', descriptionId: 'Stroke hemoragik', category: 'I', subcategory: 'Stroke', isCommon: true },
    { code: 'I87.2', description: 'Venous insufficiency', descriptionId: 'Insufisiensi vena', category: 'I', subcategory: 'Vascular', isCommon: false },

    // ========== J CODES - RESPIRATORY ==========
    { code: 'J44.1', description: 'COPD with acute exacerbation', descriptionId: 'PPOK dengan eksaserbasi akut', category: 'J', subcategory: 'Respiratory', isCommon: true },
    { code: 'J45.9', description: 'Asthma, unspecified', descriptionId: 'Asma', category: 'J', subcategory: 'Respiratory', isCommon: true },
    { code: 'J96.1', description: 'Chronic respiratory failure', descriptionId: 'Gagal napas kronis', category: 'J', subcategory: 'Respiratory', isCommon: false },

    // ========== R CODES - SYMPTOMS ==========
    { code: 'R26.0', description: 'Ataxic gait', descriptionId: 'Gaya jalan ataksik', category: 'R', subcategory: 'Gait', isCommon: true },
    { code: 'R26.2', description: 'Difficulty in walking', descriptionId: 'Kesulitan berjalan', category: 'R', subcategory: 'Gait', isCommon: true },
    { code: 'R26.8', description: 'Other abnormalities of gait and mobility', descriptionId: 'Gangguan gaya jalan lainnya', category: 'R', subcategory: 'Gait', isCommon: true },
    { code: 'R29.6', description: 'Repeated falls', descriptionId: 'Jatuh berulang', category: 'R', subcategory: 'General', isCommon: true },
    { code: 'R53', description: 'Malaise and fatigue', descriptionId: 'Lemas dan kelelahan', category: 'R', subcategory: 'General', isCommon: false },

    // ========== Z CODES - FACTORS/REHAB ==========
    { code: 'Z50.1', description: 'Other physical therapy', descriptionId: 'Fisioterapi lainnya', category: 'Z', subcategory: 'Rehab', isCommon: true },
    { code: 'Z50.8', description: 'Care involving other rehabilitation', descriptionId: 'Rehabilitasi lainnya', category: 'Z', subcategory: 'Rehab', isCommon: false },
    { code: 'Z87.3', description: 'Personal history of musculoskeletal disorders', descriptionId: 'Riwayat gangguan muskuloskeletal', category: 'Z', subcategory: 'History', isCommon: false },
    { code: 'Z96.6', description: 'Presence of orthopedic implants', descriptionId: 'Implan ortopedi', category: 'Z', subcategory: 'Status', isCommon: true },
    { code: 'Z96.64', description: 'Presence of hip implant', descriptionId: 'Total hip replacement', category: 'Z', subcategory: 'Status', isCommon: true },
    { code: 'Z96.65', description: 'Presence of knee implant', descriptionId: 'Total knee replacement', category: 'Z', subcategory: 'Status', isCommon: true },
];

// Insert codes
const insertStmt = db.prepare(`
	INSERT OR IGNORE INTO icd10_codes (code, description, description_id, category, subcategory, is_common)
	VALUES (?, ?, ?, ?, ?, ?)
`);

let inserted = 0;
for (const code of icd10Codes) {
    try {
        insertStmt.run(code.code, code.description, code.descriptionId, code.category, code.subcategory, code.isCommon ? 1 : 0);
        inserted++;
    } catch (e) {
        // Skip duplicates
    }
}

console.log(`✅ Seeded ${inserted} ICD-10 codes`);

// Show stats
const stats = db.prepare(`
	SELECT category, COUNT(*) as count 
	FROM icd10_codes 
	GROUP BY category 
	ORDER BY count DESC
`).all();

console.log('\n📊 ICD-10 Codes by Category:');
stats.forEach((s: any) => console.log(`   ${s.category}: ${s.count} codes`));

const commonCount = db.prepare('SELECT COUNT(*) as count FROM icd10_codes WHERE is_common = 1').get() as any;
console.log(`\n🔥 Common codes: ${commonCount.count}`);

db.close();
