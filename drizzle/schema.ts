import { sqliteTable, AnySQLiteColumn, foreignKey, text, integer, uniqueIndex, real } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const sessions = sqliteTable("sessions", {
	id: text().primaryKey().notNull(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	expiresAt: integer("expires_at").notNull(),
	createdAt: text("created_at"),
});

export const users = sqliteTable("users", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	username: text().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	role: text().notNull(),
	namaLengkap: text("nama_lengkap").notNull(),
	noTelepon: text("no_telepon"),
	isActive: integer("is_active").default(true),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
},
(table) => [
	uniqueIndex("users_email_unique").on(table.email),
	uniqueIndex("users_username_unique").on(table.username),
]);

export const patients = sqliteTable("patients", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	patientId: text("patient_id").notNull(),
	namaLengkap: text("nama_lengkap").notNull(),
	tanggalLahir: text("tanggal_lahir").notNull(),
	jenisKelamin: text("jenis_kelamin").notNull(),
	noTelepon: text("no_telepon"),
	email: text(),
	alamat: text(),
	kontakDarurat: text("kontak_darurat"),
	teleponDarurat: text("telepon_darurat"),
	persetujuanDiberikan: integer("persetujuan_diberikan").default(false),
	tanggalPersetujuan: text("tanggal_persetujuan"),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
	createdBy: integer("created_by").references(() => users.id),
	bloodType: text("blood_type").default("unknown"),
	allergies: text(),
	medicalHistory: text("medical_history"),
	currentMedications: text("current_medications"),
	emergencyNotes: text("emergency_notes"),
},
(table) => [
	uniqueIndex("patients_patient_id_unique").on(table.patientId),
]);

export const appointments = sqliteTable("appointments", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" } ),
	fisioterapisId: integer("fisioterapis_id").notNull().references(() => users.id),
	tanggalWaktu: text("tanggal_waktu").notNull(),
	durasiMenit: integer("durasi_menit").default(60),
	status: text().default("dijadwalkan"),
	catatan: text(),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
});

export const assessments = sqliteTable("assessments", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" } ),
	fisioterapisId: integer("fisioterapis_id").notNull().references(() => users.id),
	tanggalAssessment: text("tanggal_assessment").notNull(),
	keluhanUtama: text("keluhan_utama").notNull(),
	kondisiCedera: text("kondisi_cedera"),
	bagianTubuhTerdampak: text("bagian_tubuh_terdampak"),
	skalaNyeri: integer("skala_nyeri"),
	catatanRom: text("catatan_rom"),
	catatanTambahan: text("catatan_tambahan"),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
});

export const sessionNotes = sqliteTable("session_notes", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	appointmentId: integer("appointment_id").references(() => appointments.id, { onDelete: "set null" } ),
	patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" } ),
	fisioterapisId: integer("fisioterapis_id").notNull().references(() => users.id),
	tanggalSesi: text("tanggal_sesi").notNull(),
	subjective: text().notNull(),
	objective: text().notNull(),
	assessment: text().notNull(),
	plan: text().notNull(),
	tindakanDilakukan: text("tindakan_dilakukan"),
	durasiMenit: integer("durasi_menit").default(60),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
});

export const treatmentPlans = sqliteTable("treatment_plans", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" } ),
	fisioterapisId: integer("fisioterapis_id").notNull().references(() => users.id),
	diagnosis: text(),
	tujuan: text(),
	jumlahSesiDirencanakan: integer("jumlah_sesi_direncanakan"),
	jumlahSesiSelesai: integer("jumlah_sesi_selesai").default(0),
	status: text().default("direncanakan"),
	tanggalMulai: text("tanggal_mulai"),
	tanggalSelesai: text("tanggal_selesai"),
	catatan: text(),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
});

export const invoices = sqliteTable("invoices", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	nomorInvoice: text("nomor_invoice").notNull(),
	patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" } ),
	appointmentId: integer("appointment_id").references(() => appointments.id),
	jumlah: integer().notNull(),
	deskripsi: text(),
	status: text().default("belum_bayar"),
	tanggalTerbit: text("tanggal_terbit").notNull(),
	tanggalJatuhTempo: text("tanggal_jatuh_tempo"),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
},
(table) => [
	uniqueIndex("invoices_nomor_invoice_unique").on(table.nomorInvoice),
]);

export const payments = sqliteTable("payments", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	invoiceId: integer("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" } ),
	jumlah: integer().notNull(),
	metodePembayaran: text("metode_pembayaran"),
	tanggalPembayaran: text("tanggal_pembayaran").notNull(),
	diterimaOleh: integer("diterima_oleh").references(() => users.id),
	catatan: text(),
	createdAt: text("created_at"),
});

export const auditLogs = sqliteTable("audit_logs", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	userId: integer("user_id").references(() => users.id),
	aksi: text().notNull(),
	namaTabel: text("nama_tabel").notNull(),
	recordId: integer("record_id"),
	nilaiLama: text("nilai_lama"),
	nilaiBaru: text("nilai_baru"),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	timestamp: text(),
});

export const vitalSigns = sqliteTable("vital_signs", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" } ),
	recordedBy: integer("recorded_by").notNull().references(() => users.id),
	recordedAt: text("recorded_at").notNull(),
	bpSystolic: integer("bp_systolic"),
	bpDiastolic: integer("bp_diastolic"),
	heartRate: integer("heart_rate"),
	temperature: real(),
	respiratoryRate: integer("respiratory_rate"),
	oxygenSaturation: integer("oxygen_saturation"),
	weight: real(),
	height: real(),
	painLevel: integer("pain_level"),
	notes: text(),
	createdAt: text("created_at"),
});

export const bodyMarkings = sqliteTable("body_markings", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" } ),
	appointmentId: integer("appointment_id").references(() => appointments.id, { onDelete: "set null" } ),
	recordedBy: integer("recorded_by").notNull().references(() => users.id),
	recordedAt: text("recorded_at").notNull(),
	markings: text().notNull(),
	viewType: text("view_type").default("front"),
	notes: text(),
	createdAt: text("created_at"),
});

export const documents = sqliteTable("documents", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" } ),
	uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
	uploadedAt: text("uploaded_at").notNull(),
	fileName: text("file_name").notNull(),
	fileType: text("file_type").notNull(),
	fileSize: integer("file_size").notNull(),
	filePath: text("file_path").notNull(),
	category: text().default("other"),
	title: text(),
	description: text(),
	createdAt: text("created_at"),
});

export const exercises = sqliteTable("exercises", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	name: text().notNull(),
	nameEn: text("name_en"),
	category: text().notNull(),
	bodyPart: text("body_part").notNull(),
	description: text().notNull(),
	instructions: text().notNull(),
	precautions: text(),
	defaultSets: integer("default_sets").default(3),
	defaultReps: integer("default_reps").default(10),
	defaultHoldSeconds: integer("default_hold_seconds"),
	defaultDurationMinutes: integer("default_duration_minutes"),
	difficulty: text().default("medium"),
	imageUrl: text("image_url"),
	videoUrl: text("video_url"),
	isActive: integer("is_active").default(true),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
});

export const prescribedExercises = sqliteTable("prescribed_exercises", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" } ),
	exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
	prescribedBy: integer("prescribed_by").notNull().references(() => users.id),
	prescribedAt: text("prescribed_at").notNull(),
	sets: integer(),
	reps: integer(),
	holdSeconds: integer("hold_seconds"),
	durationMinutes: integer("duration_minutes"),
	frequency: text(),
	notes: text(),
	status: text().default("active"),
	startDate: text("start_date"),
	endDate: text("end_date"),
	createdAt: text("created_at"),
});

export const goalProgressLogs = sqliteTable("goal_progress_logs", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	goalId: integer("goal_id").notNull().references(() => patientGoals.id, { onDelete: "cascade" } ),
	recordedBy: integer("recorded_by").notNull().references(() => users.id),
	recordedAt: text("recorded_at").notNull(),
	value: real(),
	progressPercent: integer("progress_percent"),
	notes: text(),
	createdAt: text("created_at"),
});

export const outcomeMeasures = sqliteTable("outcome_measures", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" } ),
	recordedBy: integer("recorded_by").notNull().references(() => users.id),
	recordedAt: text("recorded_at").notNull(),
	measureType: text("measure_type").notNull(),
	score: real().notNull(),
	rawScore: text("raw_score"),
	maxScore: real("max_score"),
	bodyPart: text("body_part"),
	condition: text(),
	responses: text(),
	interpretation: text(),
	notes: text(),
	createdAt: text("created_at"),
});

export const patientGoals = sqliteTable("patient_goals", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" } ),
	createdBy: integer("created_by").notNull().references(() => users.id),
	title: text().notNull(),
	description: text(),
	category: text().notNull(),
	targetType: text("target_type"),
	baselineValue: real("baseline_value"),
	targetValue: real("target_value"),
	currentValue: real("current_value"),
	unit: text(),
	targetDate: text("target_date"),
	status: text().default("active"),
	progressPercent: integer("progress_percent").default(0),
	notes: text(),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
	completedAt: text("completed_at"),
});

export const clinicalTemplates = sqliteTable("clinical_templates", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	createdBy: integer("created_by").references(() => users.id),
	name: text().notNull(),
	category: text().notNull(),
	condition: text().notNull(),
	subjective: text(),
	objective: text(),
	assessment: text(),
	plan: text(),
	recommendedExercises: text("recommended_exercises"),
	expectedDuration: text("expected_duration"),
	expectedSessions: integer("expected_sessions"),
	isActive: integer("is_active").default(true),
	isPublic: integer("is_public").default(true),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
});

export const collaborationNotes = sqliteTable("collaboration_notes", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" } ),
	authorId: integer("author_id").notNull().references(() => users.id),
	noteType: text("note_type").notNull(),
	title: text().notNull(),
	content: text().notNull(),
	priority: text().default("normal"),
	isPrivate: integer("is_private").default(false),
	mentionedUsers: text("mentioned_users"),
	isResolved: integer("is_resolved").default(false),
	resolvedBy: integer("resolved_by").references(() => users.id),
	resolvedAt: text("resolved_at"),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
});

export const referrals = sqliteTable("referrals", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" } ),
	createdBy: integer("created_by").notNull().references(() => users.id),
	direction: text().notNull(),
	referrerName: text("referrer_name").notNull(),
	referrerSpecialty: text("referrer_specialty"),
	referrerPhone: text("referrer_phone"),
	referrerEmail: text("referrer_email"),
	referrerAddress: text("referrer_address"),
	referToName: text("refer_to_name"),
	referToSpecialty: text("refer_to_specialty"),
	referToPhone: text("refer_to_phone"),
	referToAddress: text("refer_to_address"),
	diagnosis: text(),
	reasonForReferral: text("reason_for_referral").notNull(),
	clinicalSummary: text("clinical_summary"),
	urgency: text().default("routine"),
	status: text().default("pending"),
	referralDate: text("referral_date").notNull(),
	appointmentDate: text("appointment_date"),
	completedDate: text("completed_date"),
	responseNotes: text("response_notes"),
	createdAt: text("created_at"),
	updatedAt: text("updated_at"),
});

