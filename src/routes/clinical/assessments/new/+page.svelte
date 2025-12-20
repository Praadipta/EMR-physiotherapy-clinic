<script lang="ts">
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	
	let skalaNyeri = $state('5');
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<div>
		<a href="/clinical" class="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1">
			<span>←</span>
			<span>Kembali ke Dokumentasi Klinis</span>
		</a>
		<h1 class="text-2xl font-bold text-gray-800 mt-2">Assessment Baru</h1>
		<p class="text-gray-600">Catat penilaian awal kondisi pasien</p>
	</div>

	{#if form?.error}
		<div class="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
			{form.error}
		</div>
	{/if}

	<form method="POST" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
		<!-- Pasien & Fisioterapis -->
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
							selected={form?.data?.patientId === patient.id.toString() ||
								data.selectedPatientId === patient.id}
						>
							{patient.namaLengkap} ({patient.patientId})
						</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="tanggalAssessment" class="block text-sm font-medium text-gray-700 mb-1">
					Tanggal Assessment <span class="text-red-500">*</span>
				</label>
				<input
					type="date"
					id="tanggalAssessment"
					name="tanggalAssessment"
					required
					value={form?.data?.tanggalAssessment ?? new Date().toISOString().split('T')[0]}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				/>
			</div>
		</div>

		<!-- Keluhan Utama -->
		<div>
			<label for="keluhanUtama" class="block text-sm font-medium text-gray-700 mb-1">
				Keluhan Utama <span class="text-red-500">*</span>
			</label>
			<textarea
				id="keluhanUtama"
				name="keluhanUtama"
				required
				rows="3"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				placeholder="Jelaskan keluhan utama pasien..."
				>{form?.data?.keluhanUtama ?? ''}</textarea
			>
		</div>

		<!-- Kondisi & Bagian Tubuh -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label for="kondisiCedera" class="block text-sm font-medium text-gray-700 mb-1">
					Kondisi/Cedera
				</label>
				<input
					type="text"
					id="kondisiCedera"
					name="kondisiCedera"
					value={form?.data?.kondisiCedera ?? ''}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
					placeholder="Misal: Strain otot, Sprain, dll"
				/>
			</div>

			<div>
				<label for="bagianTubuhTerdampak" class="block text-sm font-medium text-gray-700 mb-1">
					Bagian Tubuh Terdampak
				</label>
				<input
					type="text"
					id="bagianTubuhTerdampak"
					name="bagianTubuhTerdampak"
					value={form?.data?.bagianTubuhTerdampak ?? ''}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
					placeholder="Misal: Bahu kanan, Lutut kiri, dll"
				/>
			</div>
		</div>

		<!-- Skala Nyeri -->
		<div>
			<label for="skalaNyeri" class="block text-sm font-medium text-gray-700 mb-1">
				Skala Nyeri (0-10)
			</label>
			<div class="flex items-center gap-4">
				<input
					type="range"
					id="skalaNyeri"
					name="skalaNyeri"
					min="0"
					max="10"
					bind:value={skalaNyeri}
					class="flex-1"
				/>
				<span class="text-lg font-medium text-gray-700 w-8 text-center">
					{skalaNyeri}
				</span>
			</div>
			<div class="flex justify-between text-xs text-gray-500 mt-1">
				<span>Tidak nyeri</span>
				<span>Nyeri ringan</span>
				<span>Nyeri sedang</span>
				<span>Nyeri berat</span>
				<span>Sangat nyeri</span>
			</div>
		</div>

		<!-- ROM Notes -->
		<div>
			<label for="catatanROM" class="block text-sm font-medium text-gray-700 mb-1">
				Catatan Range of Motion (ROM)
			</label>
			<textarea
				id="catatanROM"
				name="catatanROM"
				rows="3"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				placeholder="Catat pengukuran ROM dan keterbatasan gerak..."
				>{form?.data?.catatanROM ?? ''}</textarea
			>
		</div>

		<!-- Catatan Tambahan -->
		<div>
			<label for="catatanTambahan" class="block text-sm font-medium text-gray-700 mb-1">
				Catatan Tambahan
			</label>
			<textarea
				id="catatanTambahan"
				name="catatanTambahan"
				rows="3"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				placeholder="Catatan atau temuan lainnya..."
				>{form?.data?.catatanTambahan ?? ''}</textarea
			>
		</div>

		<div class="flex gap-3">
			<a
				href="/clinical"
				class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
			>
				Batal
			</a>
			<button
				type="submit"
				class="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
			>
				Simpan Assessment
			</button>
		</div>
	</form>
</div>
