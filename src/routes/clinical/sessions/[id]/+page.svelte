<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
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
			<h1 class="text-2xl font-bold text-gray-800 mt-2">Catatan Sesi</h1>
			<p class="text-gray-600">
				{new Date(data.session.tanggalSesi).toLocaleDateString('id-ID', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</p>
		</div>
		<div class="flex gap-2">
			<a
				href="/clinical/sessions/{data.session.id}/edit"
				class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
			>
				Edit
			</a>
		</div>
	</div>

	<!-- Info Pasien & Fisioterapis -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div>
				<h3 class="text-sm font-medium text-gray-500 mb-2">Pasien</h3>
				<p class="text-lg font-semibold text-gray-800">{data.session.patient.namaLengkap}</p>
				<p class="text-gray-600">{data.session.patient.patientId}</p>
				<a
					href="/patients/{data.session.patient.id}"
					class="text-teal-600 hover:text-teal-800 text-sm"
				>
					Lihat profil →
				</a>
			</div>
			<div>
				<h3 class="text-sm font-medium text-gray-500 mb-2">Fisioterapis</h3>
				<p class="text-lg font-semibold text-gray-800">{data.session.fisioterapis.namaLengkap}</p>
				<p class="text-gray-600">{data.session.fisioterapis.email}</p>
			</div>
			<div>
				<h3 class="text-sm font-medium text-gray-500 mb-2">Durasi Sesi</h3>
				<p class="text-lg font-semibold text-gray-800">{data.session.durasiMenit} menit</p>
			</div>
		</div>
	</div>

	<!-- SOAP Notes -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
		<div class="border-b border-gray-100 bg-gray-50 px-6 py-3">
			<h3 class="text-lg font-semibold text-gray-800">Catatan SOAP</h3>
		</div>

		<div class="divide-y divide-gray-100">
			<!-- Subjective -->
			<div class="p-6">
				<div class="flex items-center gap-3 mb-3">
					<span
						class="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm"
					>
						S
					</span>
					<h4 class="font-semibold text-gray-800">Subjective</h4>
				</div>
				<p class="text-gray-700 whitespace-pre-wrap ml-11">{data.session.subjective}</p>
			</div>

			<!-- Objective -->
			<div class="p-6">
				<div class="flex items-center gap-3 mb-3">
					<span
						class="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm"
					>
						O
					</span>
					<h4 class="font-semibold text-gray-800">Objective</h4>
				</div>
				<p class="text-gray-700 whitespace-pre-wrap ml-11">{data.session.objective}</p>
			</div>

			<!-- Assessment -->
			<div class="p-6">
				<div class="flex items-center gap-3 mb-3">
					<span
						class="w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-bold text-sm"
					>
						A
					</span>
					<h4 class="font-semibold text-gray-800">Assessment</h4>
				</div>
				<p class="text-gray-700 whitespace-pre-wrap ml-11">{data.session.assessment}</p>
			</div>

			<!-- Plan -->
			<div class="p-6">
				<div class="flex items-center gap-3 mb-3">
					<span
						class="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm"
					>
						P
					</span>
					<h4 class="font-semibold text-gray-800">Plan</h4>
				</div>
				<p class="text-gray-700 whitespace-pre-wrap ml-11">{data.session.plan}</p>
			</div>
		</div>
	</div>

	<!-- Tindakan yang Dilakukan -->
	{#if data.session.tindakanDilakukan}
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<h3 class="text-lg font-semibold text-gray-800 mb-4">Tindakan yang Dilakukan</h3>
			<p class="text-gray-700 whitespace-pre-wrap">{data.session.tindakanDilakukan}</p>
		</div>
	{/if}

	<!-- Linked Appointment -->
	{#if data.session.appointment}
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<h3 class="text-lg font-semibold text-gray-800 mb-4">Appointment Terkait</h3>
			<a
				href="/appointments/{data.session.appointment.id}"
				class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
			>
				<div>
					<p class="font-medium text-gray-800">
						{new Date(data.session.appointment.tanggalWaktu).toLocaleDateString('id-ID', {
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</p>
					<p class="text-gray-600">
						{new Date(data.session.appointment.tanggalWaktu).toLocaleTimeString('id-ID', {
							hour: '2-digit',
							minute: '2-digit'
						})}
					</p>
				</div>
				<span class="text-teal-600">Lihat →</span>
			</a>
		</div>
	{/if}

	<!-- Metadata -->
	<div class="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
		<div class="flex flex-wrap gap-x-6 gap-y-2">
			<span>
				Dibuat: {data.session.createdAt ? new Date(data.session.createdAt).toLocaleString('id-ID') : '-'}
			</span>
			{#if data.session.updatedAt && data.session.updatedAt !== data.session.createdAt}
				<span>
					Diperbarui: {new Date(data.session.updatedAt).toLocaleString('id-ID')}
				</span>
			{/if}
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
		<h3 class="text-lg font-semibold text-gray-800 mb-4">Tindakan Lanjutan</h3>
		<div class="flex flex-wrap gap-3">
			<a
				href="/clinical/sessions/new?patientId={data.session.patient.id}"
				class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
			>
				+ Catatan Sesi Baru
			</a>
			<a
				href="/appointments/new?patientId={data.session.patient.id}"
				class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
			>
				+ Jadwal Sesi
			</a>
		</div>
	</div>
</div>
