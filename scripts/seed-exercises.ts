// Script untuk menambah data latihan fisioterapi
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { exercises } from '../src/lib/server/db/schema/index.js';

const sqlite = new Database('./data/healthcare.db');
const db = drizzle(sqlite);

async function seedExercises() {
    console.log('💪 Menambah data latihan fisioterapi...');

    const exerciseData = [
        // NECK
        {
            name: 'Chin Tuck',
            nameEn: 'Chin Tuck',
            category: 'posture' as const,
            bodyPart: 'neck' as const,
            description: 'Latihan untuk memperbaiki postur leher dan mengurangi nyeri leher.',
            instructions: '1. Duduk atau berdiri tegak\n2. Tarik dagu ke belakang seolah membuat "double chin"\n3. Tahan selama 5-10 detik\n4. Ulangi',
            precautions: 'Jangan lakukan jika menyebabkan pusing atau nyeri yang memburuk',
            defaultSets: 3,
            defaultReps: 10,
            defaultHoldSeconds: 5,
            difficulty: 'easy' as const
        },
        {
            name: 'Neck Rotation',
            nameEn: 'Neck Rotation Stretch',
            category: 'stretching' as const,
            bodyPart: 'neck' as const,
            description: 'Peregangan untuk meningkatkan rotasi leher.',
            instructions: '1. Duduk tegak\n2. Putar kepala perlahan ke kanan\n3. Tahan 15-30 detik\n4. Ulangi ke sisi kiri',
            precautions: 'Lakukan perlahan, jangan memaksa rotasi',
            defaultSets: 3,
            defaultReps: 5,
            defaultHoldSeconds: 20,
            difficulty: 'easy' as const
        },
        // SHOULDER
        {
            name: 'Pendulum Exercise',
            nameEn: 'Pendulum Shoulder Exercise',
            category: 'mobility' as const,
            bodyPart: 'shoulder' as const,
            description: 'Latihan pendulum untuk meningkatkan mobilitas bahu pasca cedera.',
            instructions: '1. Berdiri dan bungkuk ke depan, pegang meja dengan tangan sehat\n2. Biarkan lengan sakit menggantung\n3. Ayunkan lengan dalam lingkaran kecil\n4. Perbesar lingkaran secara bertahap',
            precautions: 'Gunakan berat badan untuk gerakan, bukan otot bahu',
            defaultSets: 2,
            defaultReps: 10,
            defaultDurationMinutes: 2,
            difficulty: 'easy' as const
        },
        {
            name: 'Wall Push-up',
            nameEn: 'Wall Push-up',
            category: 'strengthening' as const,
            bodyPart: 'shoulder' as const,
            description: 'Penguatan bahu dan dada dengan intensitas rendah.',
            instructions: '1. Berdiri menghadap dinding, jarak satu lengan\n2. Letakkan telapak tangan di dinding sejajar bahu\n3. Tekuk siku, dekatkan dada ke dinding\n4. Dorong kembali ke posisi awal',
            defaultSets: 3,
            defaultReps: 10,
            difficulty: 'easy' as const
        },
        {
            name: 'Shoulder External Rotation',
            nameEn: 'External Rotation with Resistance Band',
            category: 'strengthening' as const,
            bodyPart: 'shoulder' as const,
            description: 'Penguatan rotator cuff dengan resistance band.',
            instructions: '1. Berdiri dengan siku menempel di sisi tubuh, tekuk 90 derajat\n2. Pegang resistance band\n3. Putar lengan keluar tanpa mengangkat siku\n4. Kembali perlahan',
            precautions: 'Jangan biarkan siku terangkat dari sisi tubuh',
            defaultSets: 3,
            defaultReps: 15,
            difficulty: 'medium' as const
        },
        // LOWER BACK
        {
            name: 'Cat-Cow Stretch',
            nameEn: 'Cat-Cow Stretch',
            category: 'mobility' as const,
            bodyPart: 'lower_back' as const,
            description: 'Peregangan dinamis untuk fleksibilitas punggung.',
            instructions: '1. Mulai dengan posisi merangkak (tangan dan lutut)\n2. Tarik perut ke dalam, lengkungkan punggung ke atas (kucing)\n3. Tahan 2 detik\n4. Turunkan perut, angkat kepala dan bokong (sapi)\n5. Ulangi gerakan',
            defaultSets: 2,
            defaultReps: 10,
            difficulty: 'easy' as const
        },
        {
            name: 'Bird Dog',
            nameEn: 'Bird Dog Exercise',
            category: 'strengthening' as const,
            bodyPart: 'core' as const,
            description: 'Latihan stabilitas core dan punggung.',
            instructions: '1. Mulai posisi merangkak\n2. Angkat lengan kanan dan kaki kiri bersamaan\n3. Tahan 5-10 detik\n4. Kembali dan ulangi sisi berlawanan',
            precautions: 'Jaga punggung tetap lurus, jangan memutar pinggul',
            defaultSets: 3,
            defaultReps: 10,
            defaultHoldSeconds: 5,
            difficulty: 'medium' as const
        },
        {
            name: 'Prone Press-up',
            nameEn: 'McKenzie Press-up',
            category: 'mobility' as const,
            bodyPart: 'lower_back' as const,
            description: 'Latihan ekstensi untuk herniated disc dan nyeri punggung bawah.',
            instructions: '1. Berbaring telungkup\n2. Letakkan tangan di samping bahu\n3. Dorong dada ke atas, biarkan pinggul tetap di lantai\n4. Tahan 2 detik, turunkan perlahan',
            precautions: 'Hentikan jika nyeri menjalar ke kaki',
            defaultSets: 3,
            defaultReps: 10,
            defaultHoldSeconds: 2,
            difficulty: 'easy' as const
        },
        // KNEE
        {
            name: 'Quadriceps Stretch',
            nameEn: 'Standing Quad Stretch',
            category: 'stretching' as const,
            bodyPart: 'thigh' as const,
            description: 'Peregangan otot quadriceps.',
            instructions: '1. Berdiri dengan satu tangan memegang dinding\n2. Tekuk lutut, pegang pergelangan kaki\n3. Tarik tumit ke bokong\n4. Jaga lutut mengarah ke bawah\n5. Tahan 30 detik',
            defaultSets: 2,
            defaultReps: 3,
            defaultHoldSeconds: 30,
            difficulty: 'easy' as const
        },
        {
            name: 'Straight Leg Raise',
            nameEn: 'Straight Leg Raise',
            category: 'strengthening' as const,
            bodyPart: 'knee' as const,
            description: 'Penguatan quadriceps tanpa membebani lutut.',
            instructions: '1. Berbaring telentang, satu lutut ditekuk\n2. Kunci lutut kaki lurus\n3. Angkat kaki lurus setinggi 30cm\n4. Tahan 5 detik, turunkan perlahan',
            defaultSets: 3,
            defaultReps: 10,
            defaultHoldSeconds: 5,
            difficulty: 'easy' as const
        },
        {
            name: 'Terminal Knee Extension',
            nameEn: 'Terminal Knee Extension (TKE)',
            category: 'strengthening' as const,
            bodyPart: 'knee' as const,
            description: 'Penguatan VMO untuk stabilitas lutut.',
            instructions: '1. Berdiri dengan resistance band di belakang lutut\n2. Kaitkan band ke objek stabil di belakang\n3. Mulai dengan lutut sedikit ditekuk\n4. Luruskan lutut melawan tahanan band\n5. Tahan 2 detik, tekuk kembali',
            defaultSets: 3,
            defaultReps: 15,
            defaultHoldSeconds: 2,
            difficulty: 'medium' as const
        },
        // ANKLE
        {
            name: 'Ankle Alphabet',
            nameEn: 'Ankle Alphabet',
            category: 'mobility' as const,
            bodyPart: 'ankle' as const,
            description: 'Latihan mobilitas pergelangan kaki.',
            instructions: '1. Duduk dengan kaki terangkat\n2. Gambar huruf A-Z dengan jari kaki\n3. Gerakkan dari pergelangan kaki, bukan lutut',
            defaultSets: 2,
            defaultReps: 1,
            difficulty: 'easy' as const
        },
        {
            name: 'Calf Raise',
            nameEn: 'Standing Calf Raise',
            category: 'strengthening' as const,
            bodyPart: 'ankle' as const,
            description: 'Penguatan otot betis.',
            instructions: '1. Berdiri dengan kaki selebar bahu\n2. Angkat tumit, berdiri di jari kaki\n3. Tahan 2 detik\n4. Turunkan perlahan',
            defaultSets: 3,
            defaultReps: 15,
            defaultHoldSeconds: 2,
            difficulty: 'easy' as const
        },
        // BALANCE
        {
            name: 'Single Leg Stance',
            nameEn: 'Single Leg Balance',
            category: 'balance' as const,
            bodyPart: 'full_body' as const,
            description: 'Latihan keseimbangan dasar.',
            instructions: '1. Berdiri di dekat dinding untuk pegangan\n2. Angkat satu kaki dari lantai\n3. Pertahankan keseimbangan selama mungkin\n4. Target: 30 detik tiap kaki',
            precautions: 'Lakukan di dekat pegangan untuk keamanan',
            defaultSets: 3,
            defaultReps: 3,
            defaultHoldSeconds: 30,
            difficulty: 'medium' as const
        },
        // BREATHING
        {
            name: 'Diaphragmatic Breathing',
            nameEn: 'Belly Breathing',
            category: 'breathing' as const,
            bodyPart: 'chest' as const,
            description: 'Teknik pernapasan diafragma untuk relaksasi.',
            instructions: '1. Berbaring atau duduk nyaman\n2. Letakkan tangan di perut\n3. Tarik napas dalam melalui hidung, rasakan perut mengembang\n4. Buang napas perlahan melalui mulut\n5. Perut harus bergerak, bukan dada',
            defaultSets: 1,
            defaultReps: 10,
            defaultDurationMinutes: 5,
            difficulty: 'easy' as const
        }
    ];

    for (const exercise of exerciseData) {
        await db.insert(exercises).values(exercise).onConflictDoNothing();
    }

    console.log(`✅ ${exerciseData.length} latihan berhasil ditambahkan!`);
    sqlite.close();
}

seedExercises().catch(console.error);
