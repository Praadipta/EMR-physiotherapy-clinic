<script lang="ts">
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	function getNyeriLabel(skala: number | null): string {
		if (skala === null) return '-';
		if (skala <= 2) return 'Ringan';
		if (skala <= 5) return 'Sedang';
		if (skala <= 7) return 'Berat';
		return 'Sangat Berat';
	}

	function getNyeriColor(skala: number | null): string {
		if (skala === null) return 'bg-gray-100 text-gray-700';
		if (skala <= 2) return 'bg-green-100 text-green-700';
		if (skala <= 5) return 'bg-yellow-100 text-yellow-700';
		if (skala <= 7) return 'bg-orange-100 text-orange-700';
		return 'bg-red-100 text-red-700';
	}
</script>

<div class="max-w-3xl mx-auto space-y-6">
	<div class="flex items-start justify-between">
		<div>
			<a
				href="/clinical"
				class="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1"
			>
				<span>←</span>
				<span>Kembali ke Dokumentasi Klinis</span>
			</a>
			<h1 class="text-2xl font-bold text-gray-800 mt-2">Detail Assessment</h1>
			<p class="text-gray-600">
				{new Date(data.assessment.tanggalAssessment).toLocaleDateString('id-ID', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</p>
		</div>
		<div class="flex gap-2">
			<a
				href="/clinical/assessments/{data.assessment.id}/edit"
				class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
			>
				Edit
			</a>
		</div>
	</div>

	<!-- Info Pasien & Fisioterapis -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<h3 class="text-sm font-medium text-gray-500 mb-2">Informasi Pasien</h3>
				<p class="text-lg font-semibold text-gray-800">{data.assessment.patient.namaLengkap}</p>
				<p class="text-gray-600">{data.assessment.patient.patientId}</p>
				<a
					href="/patients/{data.assessment.patient.id}"
					class="text-teal-600 hover:text-teal-800 text-sm"
				>
					Lihat profil pasien →
				</a>
			</div>
			<div>
				<h3 class="text-sm font-medium text-gray-500 mb-2">Fisioterapis</h3>
				<p class="text-lg font-semibold text-gray-800">{data.assessment.fisioterapis.namaLengkap}</p>
				<p class="text-gray-600">{data.assessment.fisioterapis.email}</p>
			</div>
		</div>
	</div>

	<!-- Keluhan Utama -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
		<h3 class="text-lg font-semibold text-gray-800 mb-4">Keluhan Utama</h3>
		<p class="text-gray-700 whitespace-pre-wrap">{data.assessment.keluhanUtama}</p>
	</div>

	<!-- Detail Kondisi -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
		<h3 class="text-lg font-semibold text-gray-800 mb-4">Detail Kondisi</h3>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div>
				<p class="text-sm text-gray-500">Kondisi/Cedera</p>
				<p class="text-gray-800 font-medium">{data.assessment.kondisiCedera || '-'}</p>
			</div>
			<div>
				<p class="text-sm text-gray-500">Bagian Tubuh Terdampak</p>
				<p class="text-gray-800 font-medium">{data.assessment.bagianTubuhTerdampak || '-'}</p>
			</div>
			<div>
				<p class="text-sm text-gray-500">Skala Nyeri</p>
				<div class="flex items-center gap-2">
					<span
						class="px-3 py-1 rounded-full text-sm font-medium {getNyeriColor(
							data.assessment.skalaNyeri
						)}"
					>
						{data.assessment.skalaNyeri !== null ? `${data.assessment.skalaNyeri}/10` : '-'}
					</span>
					<span class="text-gray-600 text-sm">{getNyeriLabel(data.assessment.skalaNyeri)}</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Catatan ROM -->
	{#if data.assessment.catatanROM}
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<h3 class="text-lg font-semibold text-gray-800 mb-4">Catatan Range of Motion (ROM)</h3>
			<p class="text-gray-700 whitespace-pre-wrap">{data.assessment.catatanROM}</p>
		</div>
	{/if}

	<!-- Catatan Tambahan -->
	{#if data.assessment.catatanTambahan}
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<h3 class="text-lg font-semibold text-gray-800 mb-4">Catatan Tambahan</h3>
			<p class="text-gray-700 whitespace-pre-wrap">{data.assessment.catatanTambahan}</p>
		</div>
	{/if}

	<!-- Metadata -->
	<div class="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
		<div class="flex flex-wrap gap-x-6 gap-y-2">
			<span>
				Dibuat: {data.assessment.createdAt ? new Date(data.assessment.createdAt).toLocaleString('id-ID') : '-'}
			</span>
			{#if data.assessment.updatedAt && data.assessment.updatedAt !== data.assessment.createdAt}
				<span>
					Diperbarui: {new Date(data.assessment.updatedAt).toLocaleString('id-ID')}
				</span>
			{/if}
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
		<h3 class="text-lg font-semibold text-gray-800 mb-4">Tindakan Lanjutan</h3>
		<div class="flex flex-wrap gap-3">
			<a
				href="/clinical/sessions/new?patientId={data.assessment.patient.id}"
				class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
			>
				+ Catatan Sesi
			</a>
			<a
				href="/treatments/new?patientId={data.assessment.patient.id}&assessmentId={data.assessment
					.id}"
				class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
			>
				+ Rencana Terapi
			</a>
			<a
				href="/appointments/new?patientId={data.assessment.patient.id}"
				class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
			>
				+ Jadwal Sesi
			</a>
		</div>
	</div>
</div>
