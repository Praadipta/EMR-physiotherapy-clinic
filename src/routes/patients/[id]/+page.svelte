<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import BodyDiagram from '$lib/components/BodyDiagram.svelte';
	import VASPainScale from '$lib/components/VASPainScale.svelte';
	import GoalProgress from '$lib/components/GoalProgress.svelte';
	import DocumentManager from '$lib/components/DocumentManager.svelte';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isEditing = $state(false);
	let activeTab = $state<'info' | 'vitals' | 'clinical' | 'assessment' | 'documents' | 'bodymap' | 'history'>('info');
	
	// Documents state
	let patientDocuments = $state<Array<{id: number; patientId: number; fileName: string; fileType: string; fileSize: number; filePath: string; category: string; title: string; description?: string; uploadedAt: string}>>([]);
	
	// Body diagram markings
	let bodyMarkings = $state<Array<{ id: string; x: number; y: number; type: 'pain' | 'injury' | 'numbness' | 'weakness' | 'other'; severity: 1 | 2 | 3; label: string; notes?: string }>>([]);
	
	// Assessment state
	let currentPainLevel = $state(0);
	let showAddGoalForm = $state(false);
	let sampleGoals = $state<Array<{id: number; title: string; description?: string; category: string; targetValue?: number; currentValue?: number; baselineValue?: number; unit?: string; progressPercent: number; status: 'active' | 'achieved' | 'missed' | 'revised' | 'cancelled'; targetDate?: string}>>([]);
	let showVitalsForm = $state(false);
	let showAllergyForm = $state(false);
	let showMedicalHistoryForm = $state(false);
	
	// Allergy management
	let newAllergy = $state({ allergen: '', severity: 'mild', reaction: '' });
	let allergiesList = $state<Array<{allergen: string, severity: string, reaction: string}>>(
		data.allergies || []
	);
	
	// Medications management
	let newMedication = $state({ name: '', dosage: '', frequency: '' });
	let medicationsList = $state<Array<{name: string, dosage: string, frequency: string}>>(
		data.currentMedications || []
	);

	function addAllergy() {
		if (newAllergy.allergen.trim()) {
			allergiesList = [...allergiesList, { ...newAllergy }];
			newAllergy = { allergen: '', severity: 'mild', reaction: '' };
		}
	}

	function removeAllergy(index: number) {
		allergiesList = allergiesList.filter((_, i) => i !== index);
	}

	function addMedication() {
		if (newMedication.name.trim()) {
			medicationsList = [...medicationsList, { ...newMedication }];
			newMedication = { name: '', dosage: '', frequency: '' };
		}
	}

	function removeMedication(index: number) {
		medicationsList = medicationsList.filter((_, i) => i !== index);
	}

	// BMI calculation
	function calculateBMI(weight: number | null, height: number | null): string | null {
		if (!weight || !height) return null;
		const heightM = height / 100;
		const bmi = weight / (heightM * heightM);
		return bmi.toFixed(1);
	}

	// Blood pressure status
	function getBPStatus(systolic: number | null, diastolic: number | null): { status: string; color: string } {
		if (!systolic || !diastolic) return { status: 'N/A', color: 'text-gray-500' };
		if (systolic >= 180 || diastolic >= 120) return { status: 'Krisis', color: 'text-red-600' };
		if (systolic >= 140 || diastolic >= 90) return { status: 'Tinggi', color: 'text-orange-600' };
		if (systolic >= 120 || diastolic >= 80) return { status: 'Pra-Tinggi', color: 'text-yellow-600' };
		return { status: 'Normal', color: 'text-green-600' };
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<a href="/patients" class="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1">
				<span>←</span>
				<span>Kembali ke Daftar Pasien</span>
			</a>
			<h1 class="text-2xl font-bold text-gray-800 mt-2">{data.patient.namaLengkap}</h1>
			<p class="text-gray-600">{data.patient.patientId}</p>
		</div>
		<div class="flex gap-2">
			<a
				href="/appointments/new?patientId={data.patient.id}"
				class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
			>
				📅 Buat Jadwal
			</a>
		</div>
	</div>

	<!-- Allergy Alert Banner -->
	{#if data.allergies && data.allergies.length > 0}
		<div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
			<div class="flex items-start gap-3">
				<span class="text-2xl">⚠️</span>
				<div>
					<h3 class="font-bold text-red-800">Peringatan Alergi!</h3>
					<div class="flex flex-wrap gap-2 mt-2">
						{#each data.allergies as allergy}
							<span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
								{allergy.allergen}
								{#if allergy.severity === 'severe'}
									<span class="text-red-600 font-bold">(BERAT)</span>
								{/if}
							</span>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Feedback Messages -->
	{#if form?.success}
		<div class="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
			Data pasien berhasil diperbarui
		</div>
	{/if}
	{#if form?.vitalsSuccess}
		<div class="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
			Tanda vital berhasil disimpan
		</div>
	{/if}
	{#if form?.allergiesSuccess}
		<div class="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
			Data alergi berhasil diperbarui
		</div>
	{/if}
	{#if form?.medicalHistorySuccess}
		<div class="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
			Riwayat medis berhasil diperbarui
		</div>
	{/if}
	{#if form?.error}
		<div class="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
			{form.error}
		</div>
	{/if}

	<!-- Tabs -->
	<div class="border-b border-gray-200">
		<nav class="flex gap-4">
			<button
				onclick={() => activeTab = 'info'}
				class="py-3 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'info' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}"
			>
				👤 Info Dasar
			</button>
			<button
				onclick={() => activeTab = 'vitals'}
				class="py-3 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'vitals' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}"
			>
				❤️ Tanda Vital
			</button>
			<button
				onclick={() => activeTab = 'clinical'}
				class="py-3 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'clinical' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}"
			>
				🩺 Data Klinis
			</button>
			<button
				onclick={() => activeTab = 'assessment'}
				class="py-3 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'assessment' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}"
			>
				📊 Asesmen
			</button>
			<button
				onclick={() => activeTab = 'documents'}
				class="py-3 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'documents' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}"
			>
				📂 Dokumen
			</button>
			<button
				onclick={() => activeTab = 'bodymap'}
				class="py-3 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'bodymap' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}"
			>
				🫀 Body Map
			</button>
			<button
				onclick={() => activeTab = 'history'}
				class="py-3 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'history' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}"
			>
				📋 Riwayat
			</button>
		</nav>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Main Content -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Tab: Info Dasar -->
			{#if activeTab === 'info'}
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<div class="flex justify-between items-center mb-4">
						<h2 class="text-lg font-semibold text-gray-800">Data Pribadi</h2>
						<button
							onclick={() => isEditing = !isEditing}
							class="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
						>
							{isEditing ? 'Batal' : '✏️ Edit'}
						</button>
					</div>

					{#if isEditing}
						<form method="POST" action="?/update" class="space-y-4">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div class="md:col-span-2">
									<label for="namaLengkap" class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
									<input type="text" id="namaLengkap" name="namaLengkap" required value={data.patient.namaLengkap}
										class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
								<div>
									<label for="tanggalLahir" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
									<input type="date" id="tanggalLahir" name="tanggalLahir" required value={data.patient.tanggalLahir}
										class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
								<div>
									<label for="jenisKelamin" class="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
									<select id="jenisKelamin" name="jenisKelamin" required
										class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
										<option value="laki-laki" selected={data.patient.jenisKelamin === 'laki-laki'}>Laki-laki</option>
										<option value="perempuan" selected={data.patient.jenisKelamin === 'perempuan'}>Perempuan</option>
									</select>
								</div>
								<div>
									<label for="noTelepon" class="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
									<input type="tel" id="noTelepon" name="noTelepon" value={data.patient.noTelepon ?? ''}
										class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
								<div>
									<label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
									<input type="email" id="email" name="email" value={data.patient.email ?? ''}
										class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
								<div class="md:col-span-2">
									<label for="alamat" class="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
									<textarea id="alamat" name="alamat" rows="2"
										class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">{data.patient.alamat ?? ''}</textarea>
								</div>
								<div>
									<label for="kontakDarurat" class="block text-sm font-medium text-gray-700 mb-1">Kontak Darurat</label>
									<input type="text" id="kontakDarurat" name="kontakDarurat" value={data.patient.kontakDarurat ?? ''}
										class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
								<div>
									<label for="teleponDarurat" class="block text-sm font-medium text-gray-700 mb-1">Telepon Darurat</label>
									<input type="tel" id="teleponDarurat" name="teleponDarurat" value={data.patient.teleponDarurat ?? ''}
										class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
							</div>
							<div class="flex gap-3 pt-4">
								<button type="button" onclick={() => isEditing = false}
									class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Batal</button>
								<button type="submit" class="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg">Simpan</button>
							</div>
						</form>
					{:else}
						<dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<dt class="text-sm text-gray-500">Nama Lengkap</dt>
								<dd class="text-gray-900">{data.patient.namaLengkap}</dd>
							</div>
							<div>
								<dt class="text-sm text-gray-500">Tanggal Lahir</dt>
								<dd class="text-gray-900">{new Date(data.patient.tanggalLahir).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
							</div>
							<div>
								<dt class="text-sm text-gray-500">Jenis Kelamin</dt>
								<dd class="text-gray-900">{data.patient.jenisKelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan'}</dd>
							</div>
							<div>
								<dt class="text-sm text-gray-500">No. Telepon</dt>
								<dd class="text-gray-900">{data.patient.noTelepon || '-'}</dd>
							</div>
							<div>
								<dt class="text-sm text-gray-500">Email</dt>
								<dd class="text-gray-900">{data.patient.email || '-'}</dd>
							</div>
							<div>
								<dt class="text-sm text-gray-500">Golongan Darah</dt>
								<dd class="text-gray-900">{data.patient.bloodType || '-'}</dd>
							</div>
							<div class="md:col-span-2">
								<dt class="text-sm text-gray-500">Alamat</dt>
								<dd class="text-gray-900">{data.patient.alamat || '-'}</dd>
							</div>
						</dl>
					{/if}
				</div>

				<!-- Contact Emergency -->
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h2 class="text-lg font-semibold text-gray-800 mb-4">Kontak Darurat</h2>
					<dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<dt class="text-sm text-gray-500">Nama</dt>
							<dd class="text-gray-900">{data.patient.kontakDarurat || '-'}</dd>
						</div>
						<div>
							<dt class="text-sm text-gray-500">Telepon</dt>
							<dd class="text-gray-900">{data.patient.teleponDarurat || '-'}</dd>
						</div>
					</dl>
				</div>
			{/if}

			<!-- Tab: Vital Signs -->
			{#if activeTab === 'vitals'}
				<!-- Latest Vitals Card -->
				{#if data.latestVitals}
					<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						<div class="flex justify-between items-center mb-4">
							<h2 class="text-lg font-semibold text-gray-800">Tanda Vital Terakhir</h2>
							<span class="text-sm text-gray-500">
								{new Date(data.latestVitals.recordedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
							</span>
						</div>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
							<!-- Blood Pressure -->
							<div class="bg-gray-50 rounded-lg p-4 text-center">
								<p class="text-3xl font-bold text-gray-800">
									{data.latestVitals.bloodPressureSystolic || '-'}/{data.latestVitals.bloodPressureDiastolic || '-'}
								</p>
								<p class="text-sm text-gray-500">Tekanan Darah (mmHg)</p>
								{#if data.latestVitals.bloodPressureSystolic && data.latestVitals.bloodPressureDiastolic}
									{@const bpStatus = getBPStatus(data.latestVitals.bloodPressureSystolic, data.latestVitals.bloodPressureDiastolic)}
									<span class="text-xs font-medium {bpStatus.color}">{bpStatus.status}</span>
								{:else}
									<span class="text-xs font-medium text-gray-500">N/A</span>
								{/if}
							</div>
							<!-- Heart Rate -->
							<div class="bg-gray-50 rounded-lg p-4 text-center">
								<p class="text-3xl font-bold text-gray-800">{data.latestVitals.heartRate || '-'}</p>
								<p class="text-sm text-gray-500">Detak Jantung (bpm)</p>
							</div>
							<!-- Temperature -->
							<div class="bg-gray-50 rounded-lg p-4 text-center">
								<p class="text-3xl font-bold text-gray-800">{data.latestVitals.temperature?.toFixed(1) || '-'}°C</p>
								<p class="text-sm text-gray-500">Suhu Tubuh</p>
							</div>
							<!-- SpO2 -->
							<div class="bg-gray-50 rounded-lg p-4 text-center">
								<p class="text-3xl font-bold {(data.latestVitals.oxygenSaturation ?? 0) < 95 ? 'text-red-600' : 'text-gray-800'}">
									{data.latestVitals.oxygenSaturation || '-'}%
								</p>
								<p class="text-sm text-gray-500">SpO2</p>
							</div>
							<!-- Weight & Height -->
							<div class="bg-gray-50 rounded-lg p-4 text-center">
								<p class="text-3xl font-bold text-gray-800">{data.latestVitals.weight || '-'}</p>
								<p class="text-sm text-gray-500">Berat (kg)</p>
							</div>
							<div class="bg-gray-50 rounded-lg p-4 text-center">
								<p class="text-3xl font-bold text-gray-800">{data.latestVitals.height || '-'}</p>
								<p class="text-sm text-gray-500">Tinggi (cm)</p>
							</div>
							<!-- BMI -->
							<div class="bg-gray-50 rounded-lg p-4 text-center">
								<p class="text-3xl font-bold text-gray-800">
									{calculateBMI(data.latestVitals.weight, data.latestVitals.height) || '-'}
								</p>
								<p class="text-sm text-gray-500">BMI</p>
							</div>
							<!-- Pain Level -->
							<div class="bg-gray-50 rounded-lg p-4 text-center">
								<p class="text-3xl font-bold {(data.latestVitals.painLevel ?? 0) >= 7 ? 'text-red-600' : (data.latestVitals.painLevel ?? 0) >= 4 ? 'text-orange-500' : 'text-green-600'}">
									{data.latestVitals.painLevel ?? '-'}/10
								</p>
								<p class="text-sm text-gray-500">Skala Nyeri</p>
							</div>
						</div>
					</div>
				{/if}

				<!-- Record Vitals Form -->
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<div class="flex justify-between items-center mb-4">
						<h2 class="text-lg font-semibold text-gray-800">Catat Tanda Vital Baru</h2>
						<button onclick={() => showVitalsForm = !showVitalsForm}
							class="px-3 py-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700">
							{showVitalsForm ? 'Tutup' : '+ Catat Vital'}
						</button>
					</div>

					{#if showVitalsForm}
						<form method="POST" action="?/recordVitals" class="space-y-4">
							<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">TD Sistolik (mmHg)</label>
									<input type="number" name="bpSystolic" min="60" max="250" placeholder="120"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">TD Diastolik (mmHg)</label>
									<input type="number" name="bpDiastolic" min="40" max="150" placeholder="80"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Detak Jantung (bpm)</label>
									<input type="number" name="heartRate" min="30" max="200" placeholder="72"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Suhu (°C)</label>
									<input type="number" name="temperature" min="34" max="42" step="0.1" placeholder="36.5"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Laju Napas (/min)</label>
									<input type="number" name="respiratoryRate" min="10" max="40" placeholder="16"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">SpO2 (%)</label>
									<input type="number" name="oxygenSaturation" min="70" max="100" placeholder="98"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Berat (kg)</label>
									<input type="number" name="weight" min="20" max="300" step="0.1" placeholder="70"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Tinggi (cm)</label>
									<input type="number" name="height" min="100" max="250" step="0.1" placeholder="170"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Skala Nyeri (0-10)</label>
									<input type="number" name="painLevel" min="0" max="10" placeholder="0"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
								<div class="col-span-2 md:col-span-3">
									<label class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
									<input type="text" name="notes" placeholder="Catatan tambahan..."
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								</div>
							</div>
							<button type="submit" class="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg">
								Simpan Tanda Vital
							</button>
						</form>
					{/if}
				</div>

				<!-- Vitals History -->
				{#if data.vitalSigns.length > 0}
					<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						<h2 class="text-lg font-semibold text-gray-800 mb-4">Riwayat Tanda Vital</h2>
						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead class="bg-gray-50">
									<tr>
										<th class="px-3 py-2 text-left">Tanggal</th>
										<th class="px-3 py-2 text-center">TD</th>
										<th class="px-3 py-2 text-center">HR</th>
										<th class="px-3 py-2 text-center">Suhu</th>
										<th class="px-3 py-2 text-center">SpO2</th>
										<th class="px-3 py-2 text-center">Nyeri</th>
										<th class="px-3 py-2 text-left">Oleh</th>
									</tr>
								</thead>
								<tbody>
									{#each data.vitalSigns as vital}
										<tr class="border-b">
											<td class="px-3 py-2">{new Date(vital.recordedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</td>
											<td class="px-3 py-2 text-center">{vital.bloodPressureSystolic || '-'}/{vital.bloodPressureDiastolic || '-'}</td>
											<td class="px-3 py-2 text-center">{vital.heartRate || '-'}</td>
											<td class="px-3 py-2 text-center">{vital.temperature?.toFixed(1) || '-'}°</td>
											<td class="px-3 py-2 text-center">{vital.oxygenSaturation || '-'}%</td>
											<td class="px-3 py-2 text-center">{vital.painLevel ?? '-'}</td>
											<td class="px-3 py-2">{vital.recordedBy.namaLengkap}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}
			{/if}

			<!-- Tab: Clinical Data (Allergies, Medications, Medical History) -->
			{#if activeTab === 'clinical'}
				<!-- Allergies Section -->
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<div class="flex justify-between items-center mb-4">
						<h2 class="text-lg font-semibold text-gray-800">🚨 Alergi</h2>
						<button onclick={() => showAllergyForm = !showAllergyForm}
							class="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
							{showAllergyForm ? 'Tutup' : '+ Tambah Alergi'}
						</button>
					</div>

					{#if allergiesList.length > 0}
						<div class="flex flex-wrap gap-2 mb-4">
							{#each allergiesList as allergy, index}
								<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm
									{allergy.severity === 'severe' ? 'bg-red-100 text-red-800' : allergy.severity === 'moderate' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}">
									{allergy.allergen}
									{#if allergy.reaction}
										<span class="text-xs opacity-75">({allergy.reaction})</span>
									{/if}
									<button type="button" onclick={() => removeAllergy(index)} class="text-red-600 hover:text-red-800">×</button>
								</span>
							{/each}
						</div>
					{:else}
						<p class="text-gray-500 text-sm mb-4">Tidak ada alergi yang tercatat</p>
					{/if}

					{#if showAllergyForm}
						<div class="space-y-3 border-t pt-4">
							<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
								<input type="text" bind:value={newAllergy.allergen} placeholder="Nama alergen"
									class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
								<select bind:value={newAllergy.severity}
									class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
									<option value="mild">Ringan</option>
									<option value="moderate">Sedang</option>
									<option value="severe">Berat</option>
								</select>
								<input type="text" bind:value={newAllergy.reaction} placeholder="Reaksi (opsional)"
									class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
							</div>
							<button type="button" onclick={addAllergy}
								class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">+ Tambah</button>
						</div>
						<form method="POST" action="?/updateAllergies" class="mt-4">
							<input type="hidden" name="allergies" value={JSON.stringify(allergiesList)} />
							<button type="submit" class="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg">
								Simpan Perubahan Alergi
							</button>
						</form>
					{/if}
				</div>

				<!-- Medications Section -->
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h2 class="text-lg font-semibold text-gray-800 mb-4">💊 Obat-obatan Saat Ini</h2>
					
					{#if medicationsList.length > 0}
						<div class="space-y-2 mb-4">
							{#each medicationsList as med, index}
								<div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
									<div>
										<p class="font-medium">{med.name}</p>
										<p class="text-sm text-gray-500">{med.dosage} - {med.frequency}</p>
									</div>
									<button type="button" onclick={() => removeMedication(index)}
										class="text-red-600 hover:text-red-800">×</button>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-gray-500 text-sm mb-4">Tidak ada obat yang sedang dikonsumsi</p>
					{/if}

					<div class="space-y-3 border-t pt-4">
						<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
							<input type="text" bind:value={newMedication.name} placeholder="Nama obat"
								class="px-3 py-2 border border-gray-300 rounded-lg" />
							<input type="text" bind:value={newMedication.dosage} placeholder="Dosis (cth: 500mg)"
								class="px-3 py-2 border border-gray-300 rounded-lg" />
							<input type="text" bind:value={newMedication.frequency} placeholder="Frekuensi (cth: 2x sehari)"
								class="px-3 py-2 border border-gray-300 rounded-lg" />
						</div>
						<button type="button" onclick={addMedication}
							class="px-4 py-2 bg-gray-800 text-white rounded-lg">+ Tambah Obat</button>
					</div>
				</div>

				<!-- Medical History Section -->
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<div class="flex justify-between items-center mb-4">
						<h2 class="text-lg font-semibold text-gray-800">📋 Riwayat Medis</h2>
						<button onclick={() => showMedicalHistoryForm = !showMedicalHistoryForm}
							class="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
							{showMedicalHistoryForm ? 'Tutup' : '✏️ Edit'}
						</button>
					</div>

					{#if showMedicalHistoryForm}
						<form method="POST" action="?/updateMedicalHistory" class="space-y-4">
							<input type="hidden" name="medications" value={JSON.stringify(medicationsList)} />
							
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1">Golongan Darah</label>
								<select name="bloodType" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
									{#each ['unknown', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as type}
										<option value={type} selected={data.patient.bloodType === type}>{type === 'unknown' ? 'Tidak diketahui' : type}</option>
									{/each}
								</select>
							</div>
							
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1">Riwayat Penyakit</label>
								<textarea name="conditions" rows="3" placeholder="Daftar kondisi/penyakit sebelumnya..."
									class="w-full px-3 py-2 border border-gray-300 rounded-lg">{data.medicalHistory?.conditions || ''}</textarea>
							</div>
							
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1">Riwayat Operasi</label>
								<textarea name="surgeries" rows="2" placeholder="Daftar operasi yang pernah dilakukan..."
									class="w-full px-3 py-2 border border-gray-300 rounded-lg">{data.medicalHistory?.surgeries || ''}</textarea>
							</div>
							
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1">Riwayat Keluarga</label>
								<textarea name="familyHistory" rows="2" placeholder="Riwayat penyakit keluarga..."
									class="w-full px-3 py-2 border border-gray-300 rounded-lg">{data.medicalHistory?.familyHistory || ''}</textarea>
							</div>
							
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1">Catatan Darurat</label>
								<textarea name="emergencyNotes" rows="2" placeholder="Informasi penting untuk keadaan darurat..."
									class="w-full px-3 py-2 border border-gray-300 rounded-lg">{data.patient.emergencyNotes || ''}</textarea>
							</div>
							
							<button type="submit" class="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg">
								Simpan Riwayat Medis
							</button>
						</form>
					{:else}
						<dl class="space-y-4">
							<div>
								<dt class="text-sm text-gray-500">Golongan Darah</dt>
								<dd class="text-gray-900 font-medium">{data.patient.bloodType || 'Tidak diketahui'}</dd>
							</div>
							<div>
								<dt class="text-sm text-gray-500">Riwayat Penyakit</dt>
								<dd class="text-gray-900">{data.medicalHistory?.conditions || '-'}</dd>
							</div>
							<div>
								<dt class="text-sm text-gray-500">Riwayat Operasi</dt>
								<dd class="text-gray-900">{data.medicalHistory?.surgeries || '-'}</dd>
							</div>
							<div>
								<dt class="text-sm text-gray-500">Riwayat Keluarga</dt>
								<dd class="text-gray-900">{data.medicalHistory?.familyHistory || '-'}</dd>
							</div>
							{#if data.patient.emergencyNotes}
								<div class="p-3 bg-red-50 rounded-lg">
									<dt class="text-sm text-red-600 font-medium">⚠️ Catatan Darurat</dt>
									<dd class="text-red-800">{data.patient.emergencyNotes}</dd>
								</div>
							{/if}
						</dl>
					{/if}
				</div>
			{/if}

			<!-- Tab: Assessment (VAS, Goals, Outcome Measures) -->
			{#if activeTab === 'assessment'}
				<!-- VAS Pain Scale -->
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h2 class="text-lg font-semibold text-gray-800 mb-4">📊 Skala Nyeri VAS</h2>
					<p class="text-sm text-gray-600 mb-4">
						Visual Analog Scale (VAS) - Klik atau geser untuk menentukan tingkat nyeri pasien saat ini.
					</p>
					<VASPainScale
						bind:value={currentPainLevel}
						showLabels={true}
					/>
					<div class="mt-4 p-3 bg-gray-50 rounded-lg flex justify-between items-center">
						<span class="text-sm text-gray-600">Tingkat nyeri saat ini:</span>
						<span class="text-lg font-bold text-teal-600">{currentPainLevel}/10</span>
					</div>
				</div>

				<!-- Goal Tracking -->
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<GoalProgress
						bind:goals={sampleGoals}
						showAddButton={true}
						onAddClick={() => showAddGoalForm = true}
					/>
					
					{#if sampleGoals.length === 0}
						<div class="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
							<h4 class="font-medium text-teal-800 mb-2">💡 Tips Target Terapi</h4>
							<ul class="text-sm text-teal-700 space-y-1">
								<li>• Tentukan target SMART (Specific, Measurable, Achievable, Relevant, Time-bound)</li>
								<li>• Contoh: "Mengurangi nyeri dari 7 ke 3 dalam 4 minggu"</li>
								<li>• Contoh: "Meningkatkan ROM lutut dari 90° ke 120° dalam 6 minggu"</li>
							</ul>
						</div>
					{/if}
				</div>

				<!-- Quick Outcome Measure Buttons -->
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h2 class="text-lg font-semibold text-gray-800 mb-4">📋 Outcome Measures</h2>
					<p class="text-sm text-gray-600 mb-4">
						Pilih pengukuran hasil terstandar untuk mengevaluasi kemajuan pasien.
					</p>
					<div class="grid grid-cols-2 md:grid-cols-3 gap-3">
						<button class="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-colors text-center">
							<span class="text-2xl">📏</span>
							<p class="font-medium text-gray-700 mt-1">VAS</p>
							<p class="text-xs text-gray-500">Visual Analog Scale</p>
						</button>
						<button class="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-colors text-center">
							<span class="text-2xl">💪</span>
							<p class="font-medium text-gray-700 mt-1">DASH</p>
							<p class="text-xs text-gray-500">Disabilities of Arm, Shoulder & Hand</p>
						</button>
						<button class="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-colors text-center">
							<span class="text-2xl">🦴</span>
							<p class="font-medium text-gray-700 mt-1">ODI</p>
							<p class="text-xs text-gray-500">Oswestry Disability Index</p>
						</button>
						<button class="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-colors text-center">
							<span class="text-2xl">🦵</span>
							<p class="font-medium text-gray-700 mt-1">WOMAC</p>
							<p class="text-xs text-gray-500">Osteoarthritis Index</p>
						</button>
						<button class="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-colors text-center">
							<span class="text-2xl">🏃</span>
							<p class="font-medium text-gray-700 mt-1">SF-36</p>
							<p class="text-xs text-gray-500">Quality of Life</p>
						</button>
						<button class="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-colors text-center">
							<span class="text-2xl">📝</span>
							<p class="font-medium text-gray-700 mt-1">Custom</p>
							<p class="text-xs text-gray-500">Pengukuran Kustom</p>
						</button>
					</div>
				</div>
			{/if}

			<!-- Tab: Documents -->
			{#if activeTab === 'documents'}
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<DocumentManager
						patientId={data.patient.id}
						bind:documents={patientDocuments}
					/>
				</div>
			{/if}

			<!-- Tab: Body Map -->
			{#if activeTab === 'bodymap'}
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h2 class="text-lg font-semibold text-gray-800 mb-4">🫀 Peta Tubuh - Lokasi Keluhan</h2>
					<p class="text-sm text-gray-600 mb-4">
						Klik pada diagram untuk menandai lokasi nyeri, cedera, atau keluhan lainnya.
					</p>
					<BodyDiagram
						bind:markings={bodyMarkings}
						viewType="front"
					/>
					{#if bodyMarkings.length > 0}
						<div class="mt-4 p-3 bg-blue-50 rounded-lg">
							<p class="text-sm text-blue-800">
								<strong>{bodyMarkings.length} penanda</strong> telah ditambahkan. 
								Penanda ini akan otomatis disimpan saat membuat catatan sesi baru.
							</p>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Tab: History (Appointment History) -->
			{#if activeTab === 'history'}
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h2 class="text-lg font-semibold text-gray-800 mb-4">Riwayat Kunjungan</h2>
					{#if data.appointments.length === 0}
						<p class="text-gray-500 text-center py-4">Belum ada riwayat kunjungan</p>
					{:else}
						<div class="space-y-3">
							{#each data.appointments as appointment}
								<div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
									<div class="text-center min-w-[80px]">
										<p class="text-sm font-medium text-teal-600">
											{new Date(appointment.tanggalWaktu).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
										</p>
										<p class="text-xs text-gray-500">
											{new Date(appointment.tanggalWaktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
										</p>
									</div>
									<div class="flex-1">
										<p class="font-medium text-gray-800">{appointment.fisioterapis.namaLengkap}</p>
										<p class="text-sm text-gray-500">{appointment.catatan || 'Tidak ada catatan'}</p>
									</div>
									<span class="px-2 py-1 text-xs rounded-full
										{appointment.status === 'selesai' ? 'bg-green-100 text-green-700' :
										appointment.status === 'dijadwalkan' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}">
										{appointment.status === 'selesai' ? 'Selesai' :
										appointment.status === 'dijadwalkan' ? 'Dijadwalkan' :
										appointment.status === 'dibatalkan' ? 'Dibatalkan' : 'Tidak Hadir'}
									</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Patient Card -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<div class="text-center">
					<div class="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center text-3xl text-teal-700 font-bold mx-auto mb-4">
						{data.patient.namaLengkap.charAt(0).toUpperCase()}
					</div>
					<h3 class="font-semibold text-gray-800">{data.patient.namaLengkap}</h3>
					<p class="text-sm text-gray-500">{data.patient.patientId}</p>
					<p class="text-sm text-gray-500 mt-2">
						{data.patient.jenisKelamin === 'laki-laki' ? '👨' : '👩'}
						{data.patient.jenisKelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan'}
					</p>
				</div>
			</div>

			<!-- Quick Stats -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<h3 class="font-semibold text-gray-800 mb-4">Ringkasan</h3>
				<div class="space-y-3">
					<div class="flex justify-between">
						<span class="text-gray-500">Total Kunjungan</span>
						<span class="font-medium">{data.appointments.length}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-500">Perawatan Aktif</span>
						<span class="font-medium">{data.activeTreatments}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-500">Alergi</span>
						<span class="font-medium {data.allergies.length > 0 ? 'text-red-600' : ''}">{data.allergies.length}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-500">Terdaftar</span>
						<span class="font-medium">{data.patient.createdAt ? new Date(data.patient.createdAt).toLocaleDateString('id-ID') : '-'}</span>
					</div>
				</div>
			</div>

			<!-- GDPR Info -->
			<div class="bg-gray-50 rounded-xl p-4 text-sm">
				<p class="text-gray-600">
					<span class="font-medium">Persetujuan Data:</span>
					{#if data.patient.persetujuanDiberikan}
						<span class="text-green-600">✓ Diberikan</span>
						{#if data.patient.tanggalPersetujuan}
							<br />
							<span class="text-gray-500">{new Date(data.patient.tanggalPersetujuan).toLocaleDateString('id-ID')}</span>
						{/if}
					{:else}
						<span class="text-red-600">✗ Belum</span>
					{/if}
				</p>
			</div>
		</div>
	</div>
</div>
