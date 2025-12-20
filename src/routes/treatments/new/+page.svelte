<script lang="ts">
	import type { PageData, ActionData } from './$types';
	type FormData = {
		patientId?: string;
		assessmentId?: string;
		diagnosis?: string;
		tujuan?: string;
		tanggalMulai?: string;
		tanggalSelesai?: string;
		jumlahSesiDirencanakan?: string;
		catatan?: string;
	};
	let { data, form }: { data: PageData; form: ActionData } = $props();
	const formData = $derived((form as { error?: string; data?: FormData } | null)?.data);
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<div>
		<a
			href="/treatments"
			class="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1"
		>
			<span>←</span>
			<span>Kembali ke Rencana Terapi</span>
		</a>
		<h1 class="text-2xl font-bold text-gray-800 mt-2">Rencana Terapi Baru</h1>
		<p class="text-gray-600">Buat rencana terapi untuk pasien</p>
	</div>

	{#if form?.error}
		<div class="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
			{form.error}
		</div>
	{/if}

	<form method="POST" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
		<!-- Pasien & Assessment -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label for="patientId" class="block text-sm font-medium text-gray-700 mb-1">
					Pasien <span class="text-red-500">*</span>
				</label>
				<select
					id="patientId"
					name="patientId"
					required
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				>
					<option value="">Pilih pasien</option>
					{#each data.patients as patient}
						<option
							value={patient.id}
							selected={formData?.patientId === patient.id.toString() ||
								data.selectedPatientId === patient.id}
						>
							{patient.namaLengkap} ({patient.patientId})
						</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="assessmentId" class="block text-sm font-medium text-gray-700 mb-1">
					Berdasarkan Assessment
				</label>
				<select
					id="assessmentId"
					name="assessmentId"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				>
					<option value="">Pilih assessment (opsional)</option>
					{#each data.assessments as assessment}
						<option
							value={assessment.id}
							selected={formData?.assessmentId === assessment.id.toString() ||
								data.selectedAssessmentId === assessment.id}
						>
							{assessment.tanggalAssessment} - {assessment.patient.namaLengkap}
						</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Diagnosis -->
		<div>
			<label for="diagnosis" class="block text-sm font-medium text-gray-700 mb-1">
				Diagnosis <span class="text-red-500">*</span>
			</label>
			<input
				type="text"
				id="diagnosis"
				name="diagnosis"
				required
				value={formData?.diagnosis ?? ''}
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				placeholder="Misal: Low Back Pain, Frozen Shoulder, dll"
			/>
		</div>

		<!-- Tujuan Terapi -->
		<div>
			<label for="tujuanTerapi" class="block text-sm font-medium text-gray-700 mb-1">
				Tujuan Terapi <span class="text-red-500">*</span>
			</label>
			<textarea
				id="tujuanTerapi"
				name="tujuanTerapi"
				required
				rows="3"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				placeholder="Jelaskan tujuan yang ingin dicapai dari terapi ini..."
				>{formData?.tujuan ?? ''}</textarea
			>
		</div>

		<!-- Periode -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label for="tanggalMulai" class="block text-sm font-medium text-gray-700 mb-1">
					Tanggal Mulai <span class="text-red-500">*</span>
				</label>
				<input
					type="date"
					id="tanggalMulai"
					name="tanggalMulai"
					required
					value={formData?.tanggalMulai ?? new Date().toISOString().split('T')[0]}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				/>
			</div>

			<div>
				<label for="tanggalSelesai" class="block text-sm font-medium text-gray-700 mb-1">
					Estimasi Selesai
				</label>
				<input
					type="date"
					id="tanggalSelesai"
					name="tanggalSelesai"
					value={formData?.tanggalSelesai ?? ''}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				/>
			</div>
		</div>

		<!-- Sesi & Frekuensi -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label for="totalSesi" class="block text-sm font-medium text-gray-700 mb-1">
					Total Sesi yang Direncanakan
				</label>
				<input
					type="number"
					id="totalSesi"
					name="totalSesi"
					min="1"
					max="100"
					value={formData?.jumlahSesiDirencanakan ?? ''}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
					placeholder="Misal: 10"
				/>
			</div>

			<div>
				<label for="frekuensi" class="block text-sm font-medium text-gray-700 mb-1">
					Frekuensi per Minggu
				</label>
				<select
					id="frekuensi"
					name="frekuensi"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				>
					<option value="1">1x per minggu</option>
					<option value="2">2x per minggu</option>
					<option value="3">3x per minggu</option>
					<option value="5">Setiap hari kerja</option>
					<option value="7">Setiap hari</option>
				</select>
			</div>
		</div>

		<!-- Protokol Terapi -->
		<div>
			<label for="protokolTerapi" class="block text-sm font-medium text-gray-700 mb-1">
				Protokol/Teknik Terapi
			</label>
			<textarea
				id="protokolTerapi"
				name="protokolTerapi"
				rows="3"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				placeholder="Jelaskan teknik dan modalitas yang akan digunakan..."
				></textarea
			>
		</div>

		<!-- Latihan Rumah -->
		<div>
			<label for="latihanRumah" class="block text-sm font-medium text-gray-700 mb-1">
				Program Latihan Rumah
			</label>
			<textarea
				id="latihanRumah"
				name="latihanRumah"
				rows="3"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				placeholder="Latihan yang harus dilakukan pasien di rumah..."
				></textarea
			>
		</div>

		<!-- Catatan -->
		<div>
			<label for="catatan" class="block text-sm font-medium text-gray-700 mb-1">
				Catatan Tambahan
			</label>
			<textarea
				id="catatan"
				name="catatan"
				rows="2"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				placeholder="Catatan atau pertimbangan khusus..."
				>{formData?.catatan ?? ''}</textarea
			>
		</div>

		<div class="flex gap-3">
			<a
				href="/treatments"
				class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
			>
				Batal
			</a>
			<button
				type="submit"
				class="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
			>
				Simpan Rencana Terapi
			</button>
		</div>
	</form>
</div>
