<script lang="ts">
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	const statusOptions = [
		{ value: 'dijadwalkan', label: 'Dijadwalkan', color: 'bg-blue-100 text-blue-700' },
		{ value: 'selesai', label: 'Selesai', color: 'bg-green-100 text-green-700' },
		{ value: 'dibatalkan', label: 'Dibatalkan', color: 'bg-gray-100 text-gray-700' },
		{ value: 'tidak_hadir', label: 'Tidak Hadir', color: 'bg-red-100 text-red-700' }
	];

	function getStatusColor(status: string | null): string {
		if (!status) return 'bg-gray-100';
		return statusOptions.find((s) => s.value === status)?.color || 'bg-gray-100';
	}

	function getStatusLabel(status: string | null): string {
		if (!status) return '-';
		return statusOptions.find((s) => s.value === status)?.label || status;
	}
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<a
				href="/appointments"
				class="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1"
			>
				<span>←</span>
				<span>Kembali ke Jadwal</span>
			</a>
			<h1 class="text-2xl font-bold text-gray-800 mt-2">Detail Appointment</h1>
		</div>
	</div>

	{#if form?.success}
		<div class="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
			{form.message || 'Berhasil diperbarui'}
		</div>
	{/if}

	{#if form?.error}
		<div class="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
			{form.error}
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Main Content -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Appointment Info -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-gray-800">Informasi Jadwal</h2>
					<span class="px-3 py-1 rounded-full text-sm {getStatusColor(data.appointment.status)}">
						{getStatusLabel(data.appointment.status)}
					</span>
				</div>

				<dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<dt class="text-sm text-gray-500">Tanggal</dt>
						<dd class="text-gray-900 font-medium">
							{new Date(data.appointment.tanggalWaktu).toLocaleDateString('id-ID', {
								weekday: 'long',
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</dd>
					</div>
					<div>
						<dt class="text-sm text-gray-500">Waktu</dt>
						<dd class="text-gray-900 font-medium">
							{new Date(data.appointment.tanggalWaktu).toLocaleTimeString('id-ID', {
								hour: '2-digit',
								minute: '2-digit'
							})}
						</dd>
					</div>
					<div>
						<dt class="text-sm text-gray-500">Durasi</dt>
						<dd class="text-gray-900">{data.appointment.durasiMenit} menit</dd>
					</div>
					<div>
						<dt class="text-sm text-gray-500">Catatan</dt>
						<dd class="text-gray-900">{data.appointment.catatan || '-'}</dd>
					</div>
				</dl>
			</div>

			<!-- Update Status -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<h2 class="text-lg font-semibold text-gray-800 mb-4">Update Status</h2>
				<form method="POST" action="?/updateStatus" class="flex flex-wrap gap-2">
					{#each statusOptions as status}
						<button
							type="submit"
							name="status"
							value={status.value}
							class="px-4 py-2 rounded-lg border transition-colors {data.appointment.status ===
							status.value
								? status.color + ' border-current'
								: 'border-gray-200 hover:bg-gray-50'}"
						>
							{status.label}
						</button>
					{/each}
				</form>
			</div>

			<!-- Session Notes -->
			{#if data.appointment.status === 'selesai' || data.sessionNote}
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h2 class="text-lg font-semibold text-gray-800 mb-4">Catatan Sesi (SOAP)</h2>

					{#if data.sessionNote}
						<dl class="space-y-4">
							<div>
								<dt class="text-sm text-gray-500 font-medium">Subjective (S)</dt>
								<dd class="text-gray-900">{data.sessionNote.subjective || '-'}</dd>
							</div>
							<div>
								<dt class="text-sm text-gray-500 font-medium">Objective (O)</dt>
								<dd class="text-gray-900">{data.sessionNote.objective || '-'}</dd>
							</div>
							<div>
								<dt class="text-sm text-gray-500 font-medium">Assessment (A)</dt>
								<dd class="text-gray-900">{data.sessionNote.assessment || '-'}</dd>
							</div>
							<div>
								<dt class="text-sm text-gray-500 font-medium">Plan (P)</dt>
								<dd class="text-gray-900">{data.sessionNote.plan || '-'}</dd>
							</div>
							{#if data.sessionNote.tindakanDilakukan}
								<div>
									<dt class="text-sm text-gray-500">Tindakan Dilakukan</dt>
									<dd class="text-gray-900">{data.sessionNote.tindakanDilakukan}</dd>
								</div>
							{/if}
							{#if data.sessionNote.durasiMenit}
								<div>
									<dt class="text-sm text-gray-500">Durasi Sesi</dt>
									<dd class="text-gray-900">{data.sessionNote.durasiMenit} menit</dd>
								</div>
							{/if}
						</dl>
						<a
							href="/clinical/sessions/{data.sessionNote.id}"
							class="mt-4 inline-block text-teal-600 hover:text-teal-800 text-sm"
						>
							Lihat Detail Catatan Sesi
						</a>
					{:else}
						<p class="text-gray-500 mb-4">Belum ada catatan sesi untuk appointment ini.</p>
						<a
							href="/clinical/sessions/new?appointmentId={data.appointment.id}"
							class="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
						>
							➕ Tambah Catatan Sesi
						</a>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Patient Card -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<h3 class="font-semibold text-gray-800 mb-4">Pasien</h3>
				<div class="flex items-center gap-4">
					<div
						class="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold"
					>
						{data.appointment.patient.namaLengkap.charAt(0).toUpperCase()}
					</div>
					<div>
						<a
							href="/patients/{data.appointment.patient.id}"
							class="font-medium text-gray-800 hover:text-teal-600"
						>
							{data.appointment.patient.namaLengkap}
						</a>
						<p class="text-sm text-gray-500">{data.appointment.patient.patientId}</p>
					</div>
				</div>
			</div>

			<!-- Therapist Card -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<h3 class="font-semibold text-gray-800 mb-4">Fisioterapis</h3>
				<div class="flex items-center gap-4">
					<div
						class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold"
					>
						{data.appointment.fisioterapis.namaLengkap.charAt(0).toUpperCase()}
					</div>
					<div>
						<p class="font-medium text-gray-800">{data.appointment.fisioterapis.namaLengkap}</p>
						<p class="text-sm text-gray-500">Fisioterapis</p>
					</div>
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<h3 class="font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
				<div class="space-y-2">
					<a
						href="/clinical/assessments/new?patientId={data.appointment.patient.id}"
						class="block w-full px-4 py-2 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
					>
						📋 Buat Assessment
					</a>
					<a
						href="/billing/new?appointmentId={data.appointment.id}&patientId={data.appointment.patient.id}"
						class="block w-full px-4 py-2 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
					>
						💰 Buat Invoice
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
