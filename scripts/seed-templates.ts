// Script untuk menambah template klinis
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { clinicalTemplates } from '../src/lib/server/db/schema/index.js';

const sqlite = new Database('./data/healthcare.db');
const db = drizzle(sqlite);

async function seedTemplates() {
    console.log('📋 Menambah template klinis...');

    const templates = [
        {
            name: 'Low Back Pain (LBP)',
            category: 'musculoskeletal' as const,
            condition: 'Low Back Pain',
            subjective: 'Pasien mengeluhkan nyeri punggung bawah sejak [durasi]. Nyeri terasa [karakteristik: tumpul/tajam/menjalar]. Faktor yang memperburuk: [duduk lama/berdiri/membungkuk]. Faktor yang meringankan: [istirahat/kompres hangat]. VAS: [0-10].',
            objective: 'Postur: [normal/kifosis/lordosis berlebih]\nROM lumbal: Fleksi: [derajat], Ekstensi: [derajat], Lateral fleksi: [derajat]\nTes provokasi: SLR [positif/negatif], Slump test [positif/negatif]\nKekuatan otot core: [grade MMT]\nPalpasi: Nyeri tekan pada [lokasi]',
            assessment: 'Diagnosis fisioterapi: Mechanical Low Back Pain\nPrognosis: [baik/sedang/buruk]\nKeterbatasan fungsi: [deskripsi]',
            plan: '1. Edukasi postur dan body mechanics\n2. Terapi manual: Mobilisasi sendi lumbal\n3. Latihan: McKenzie extension, core stability\n4. Modalitas: TENS/Ultrasound\n5. Home program: Cat-cow stretch, pelvic tilt',
            expectedDuration: '4-8 minggu',
            expectedSessions: 8
        },
        {
            name: 'Frozen Shoulder',
            category: 'musculoskeletal' as const,
            condition: 'Adhesive Capsulitis',
            subjective: 'Pasien mengeluhkan nyeri dan kekakuan bahu [kanan/kiri] sejak [durasi]. Kesulitan mengangkat lengan dan meraih benda. Nyeri terutama saat [aktivitas]. Riwayat: [diabetes/trauma/immobilisasi].',
            objective: 'ROM aktif: Fleksi [derajat], Abduksi [derajat], Rotasi eksternal [derajat], Rotasi internal [derajat]\nROM pasif: [sama/berkurang]\nKapsular pattern: ER > Abd > IR\nKekuatan: [grade MMT]\nTes khusus: Empty can test [+/-], Neer test [+/-]',
            assessment: 'Diagnosis: Adhesive Capsulitis fase [freezing/frozen/thawing]\nKeterbatasan: [ADL yang terganggu]',
            plan: '1. Mobilisasi sendi glenohumeral\n2. Stretching kapsul posterior dan inferior\n3. Pendulum exercises\n4. Progressive ROM exercises\n5. Penguatan rotator cuff (fase thawing)',
            expectedDuration: '12-24 minggu',
            expectedSessions: 16
        },
        {
            name: 'Knee Osteoarthritis',
            category: 'musculoskeletal' as const,
            condition: 'Osteoarthritis Lutut',
            subjective: 'Pasien mengeluhkan nyeri lutut [kanan/kiri/bilateral] sejak [durasi]. Nyeri saat [berjalan/naik tangga/jongkok]. Kekakuan pagi hari selama [durasi]. Bengkak [ada/tidak].',
            objective: 'Inspeksi: Bengkak [+/-], Varus/valgus [derajat]\nROM: Fleksi [derajat], Ekstensi [derajat]\nKekuatan quadriceps: [grade MMT]\nLingkar paha: [cm] (bandingkan dengan sisi sehat)\nTes: McMurray [+/-], Lachman [+/-]',
            assessment: 'Diagnosis: Osteoarthritis lutut grade [I-IV Kellgren-Lawrence]\nWOMAC score: [nilai]',
            plan: '1. Quadriceps strengthening\n2. Stretching hamstring dan gastrocnemius\n3. Low-impact aerobic (sepeda statis)\n4. Terapi akuatik jika tersedia\n5. Edukasi: Weight management, penggunaan alat bantu',
            expectedDuration: 'Ongoing management',
            expectedSessions: 12
        },
        {
            name: 'Cervical Spondylosis',
            category: 'musculoskeletal' as const,
            condition: 'Cervical Spondylosis',
            subjective: 'Pasien mengeluhkan nyeri leher dan kaku sejak [durasi]. Nyeri menjalar ke [bahu/lengan]. Kesemutan di [lokasi]. Sakit kepala [ada/tidak]. Pekerjaan: [desk job/manual labor].',
            objective: 'Postur kepala: Forward head posture [ada/tidak]\nROM servikal: Fleksi [derajat], Ekstensi [derajat], Rotasi [derajat], Side bending [derajat]\nTes neurologis: Refleks bisep/trisep [normal/menurun]\nSpurling test: [+/-]\nDistraction test: [+/-]',
            assessment: 'Diagnosis: Cervical spondylosis dengan/tanpa radikulopati\nLevel yang terlibat: [C4-C7]',
            plan: '1. Chin tuck exercises\n2. Deep neck flexor strengthening\n3. Scapular stabilization\n4. Ergonomic workstation assessment\n5. Traksi servikal manual',
            expectedDuration: '4-6 minggu',
            expectedSessions: 8
        },
        {
            name: 'Post Stroke Rehabilitation',
            category: 'neurological' as const,
            condition: 'Hemiparesis Post Stroke',
            subjective: 'Pasien dengan riwayat stroke [tipe] [durasi] lalu. Keluhan saat ini: kelemahan sisi [kanan/kiri], kesulitan [berjalan/menggenggam/bicara]. Tingkat kemandirian: [mandiri/partial/total].',
            objective: 'Tonus otot: Ashworth scale [nilai]\nKekuatan: MMT upper extremity [nilai], lower extremity [nilai]\nKeseimbangan: Berg Balance Scale [nilai]\nMobilitas: Functional Ambulation Category [nilai]\nADL: Barthel Index [nilai]',
            assessment: 'Diagnosis: Hemiparesis [kanan/kiri] post CVA\nPrognosis fungsional: [baik/sedang/buruk]',
            plan: '1. Weight bearing exercises\n2. Bobath approach / PNF techniques\n3. Gait training dengan/tanpa alat bantu\n4. ADL training\n5. Keluarga education untuk home program',
            expectedDuration: '3-6 bulan',
            expectedSessions: 24
        },
        {
            name: 'ACL Post-Surgery Rehab',
            category: 'post_surgical' as const,
            condition: 'ACL Reconstruction Rehabilitation',
            subjective: 'Pasien post rekonstruksi ACL [durasi] yang lalu. Prosedur: [hamstring graft/patellar tendon/allograft]. Keluhan saat ini: [bengkak/nyeri/keterbatasan ROM]. Target kembali ke olahraga [ya/tidak].',
            objective: 'ROM: Fleksi [derajat], Ekstensi [derajat] (target 0°)\nBengkak: Lingkar lutut [cm]\nKekuatan quad: [% dari sisi sehat]\nLachman test: [endpoint tegas/lunak]\nSingle leg hop test: [% dari sisi sehat]',
            assessment: 'Fase rehabilitasi: [1-akut/2-intermediate/3-advanced/4-return to sport]\nProgress sesuai protokol: [ya/tidak]',
            plan: 'Fase 1 (0-2 minggu): Extension focus, patellar mobilization, quad sets\nFase 2 (2-6 minggu): Full ROM, gait normalization, balance\nFase 3 (6-12 minggu): Strengthening, perturbation training\nFase 4 (3-6 bulan): Sport-specific, agility, plyometrics',
            expectedDuration: '6-9 bulan',
            expectedSessions: 30
        }
    ];

    for (const template of templates) {
        await db.insert(clinicalTemplates).values(template).onConflictDoNothing();
    }

    console.log(`✅ ${templates.length} template berhasil ditambahkan!`);
    sqlite.close();
}

seedTemplates().catch(console.error);
