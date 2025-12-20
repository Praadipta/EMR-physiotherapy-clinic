<script lang="ts">
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<div>
		<a href="/clinical" class="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1">
			<span>←</span>
			<span>Kembali ke Dokumentasi Klinis</span>
		</a>
		<h1 class="text-2xl font-bold text-gray-800 mt-2">Catatan Sesi Baru</h1>
		<p class="text-gray-600">Dokumentasikan sesi terapi yang dilakukan</p>
	</div>

	{#if form?.error}
		<div class="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
			{form.error}
		</div>
	{/if}

	<form method="POST" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
		<!-- Pasien & Appointment -->
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
				<label for="appointmentId" class="block text-sm font-medium text-gray-700 mb-1">
					Terkait Appointment
				</label>
				<select
					id="appointmentId"
					name="appointmentId"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				>
					<option value="">Pilih appointment (opsional)</option>
					{#each data.appointments as apt}
						<option
							value={apt.id}
							selected={form?.data?.appointmentId === apt.id.toString() ||
								data.selectedAppointmentId === apt.id}
						>
							{new Date(apt.tanggalWaktu).toLocaleDateString('id-ID')} {new Date(apt.tanggalWaktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {apt.patient.namaLengkap}
						</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Tanggal Sesi -->
		<div>
			<label for="tanggalSesi" class="block text-sm font-medium text-gray-700 mb-1">
				Tanggal Sesi <span class="text-red-500">*</span>
			</label>
			<input
				type="date"
				id="tanggalSesi"
				name="tanggalSesi"
				required
				value={form?.data?.tanggalSesi ?? new Date().toISOString().split('T')[0]}
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
			/>
		</div>

		<!-- Subjective (SOAP) -->
		<div>
			<label for="subjective" class="block text-sm font-medium text-gray-700 mb-1">
				Subjective (S) <span class="text-red-500">*</span>
			</label>
			<textarea
				id="subjective"
				name="subjective"
				required
				rows="3"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				placeholder="Keluhan pasien, bagaimana perasaan pasien hari ini..."
				>{form?.data?.subjective ?? ''}</textarea
			>
			<p class="text-xs text-gray-500 mt-1">
				Apa yang dirasakan dan dikeluhkan pasien (dalam kata-kata pasien)
			</p>
		</div>

		<!-- Objective (SOAP) -->
		<div>
			<label for="objective" class="block text-sm font-medium text-gray-700 mb-1">
				Objective (O) <span class="text-red-500">*</span>
			</label>
			<textarea
				id="objective"
				name="objective"
				required
				rows="3"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				placeholder="Pengamatan dan pengukuran objektif..."
				>{form?.data?.objective ?? ''}</textarea
			>
			<p class="text-xs text-gray-500 mt-1">
				Pengamatan klinis, pengukuran ROM, skala nyeri, dll
			</p>
		</div>

		<!-- Assessment (SOAP) -->
		<div>
			<label for="assessment" class="block text-sm font-medium text-gray-700 mb-1">
				Assessment (A) <span class="text-red-500">*</span>
			</label>
			<textarea
				id="assessment"
				name="assessment"
				required
				rows="3"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				placeholder="Analisis dan interpretasi temuan..."
				>{form?.data?.assessment ?? ''}</textarea
			>
			<p class="text-xs text-gray-500 mt-1">
				Interpretasi profesional terhadap kondisi pasien dan progres
			</p>
		</div>

		<!-- Plan (SOAP) -->
		<div>
			<label for="plan" class="block text-sm font-medium text-gray-700 mb-1">
				Plan (P) <span class="text-red-500">*</span>
			</label>
			<textarea
				id="plan"
				name="plan"
				required
				rows="3"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				placeholder="Rencana tindak lanjut..."
				>{form?.data?.plan ?? ''}</textarea
			>
			<p class="text-xs text-gray-500 mt-1">
				Rencana terapi selanjutnya, latihan rumah, jadwal follow-up
			</p>
		</div>

		<!-- Tindakan yang Dilakukan -->
		<div>
			<label for="tindakanDilakukan" class="block text-sm font-medium text-gray-700 mb-1">
				Tindakan yang Dilakukan
			</label>
			<textarea
				id="tindakanDilakukan"
				name="tindakanDilakukan"
				rows="3"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
				placeholder="Detail tindakan terapi yang dilakukan pada sesi ini..."
				>{form?.data?.tindakanDilakukan ?? ''}</textarea
			>
		</div>

		<!-- Durasi -->
		<div>
			<label for="durasiMenit" class="block text-sm font-medium text-gray-700 mb-1">
				Durasi Sesi (menit)
			</label>
			<input
				type="number"
				id="durasiMenit"
				name="durasiMenit"
				min="5"
				max="180"
				value={form?.data?.durasiMenit ?? '60'}
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
			/>
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
				Simpan Catatan Sesi
			</button>
		</div>
	</form>
</div>
