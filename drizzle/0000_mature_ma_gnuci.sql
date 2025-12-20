CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`nama_lengkap` text NOT NULL,
	`no_telepon` text,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `patients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` text NOT NULL,
	`nama_lengkap` text NOT NULL,
	`tanggal_lahir` text NOT NULL,
	`jenis_kelamin` text NOT NULL,
	`no_telepon` text,
	`email` text,
	`alamat` text,
	`kontak_darurat` text,
	`telepon_darurat` text,
	`persetujuan_diberikan` integer DEFAULT false,
	`tanggal_persetujuan` integer,
	`created_at` integer,
	`updated_at` integer,
	`created_by` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `patients_patient_id_unique` ON `patients` (`patient_id`);--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer NOT NULL,
	`fisioterapis_id` integer NOT NULL,
	`tanggal_waktu` integer NOT NULL,
	`durasi_menit` integer DEFAULT 60,
	`status` text DEFAULT 'dijadwalkan',
	`catatan` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fisioterapis_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer NOT NULL,
	`fisioterapis_id` integer NOT NULL,
	`tanggal_assessment` integer NOT NULL,
	`keluhan_utama` text NOT NULL,
	`kondisi_cedera` text,
	`bagian_tubuh_terdampak` text,
	`skala_nyeri` integer,
	`catatan_rom` text,
	`catatan_tambahan` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fisioterapis_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`appointment_id` integer NOT NULL,
	`patient_id` integer NOT NULL,
	`fisioterapis_id` integer NOT NULL,
	`perawatan_diberikan` text,
	`latihan_dilakukan` text,
	`respon_pasien` text,
	`catatan_perkembangan` text,
	`hasil` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fisioterapis_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `treatment_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer NOT NULL,
	`fisioterapis_id` integer NOT NULL,
	`diagnosis` text,
	`tujuan` text,
	`jumlah_sesi_direncanakan` integer,
	`jumlah_sesi_selesai` integer DEFAULT 0,
	`status` text DEFAULT 'direncanakan',
	`tanggal_mulai` text,
	`tanggal_selesai` text,
	`catatan` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fisioterapis_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nomor_invoice` text NOT NULL,
	`patient_id` integer NOT NULL,
	`appointment_id` integer,
	`jumlah` integer NOT NULL,
	`deskripsi` text,
	`status` text DEFAULT 'belum_bayar',
	`tanggal_terbit` integer NOT NULL,
	`tanggal_jatuh_tempo` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_nomor_invoice_unique` ON `invoices` (`nomor_invoice`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_id` integer NOT NULL,
	`jumlah` integer NOT NULL,
	`metode_pembayaran` text,
	`tanggal_pembayaran` integer NOT NULL,
	`diterima_oleh` integer,
	`catatan` text,
	`created_at` integer,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`diterima_oleh`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`aksi` text NOT NULL,
	`nama_tabel` text NOT NULL,
	`record_id` integer,
	`nilai_lama` text,
	`nilai_baru` text,
	`ip_address` text,
	`user_agent` text,
	`timestamp` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
