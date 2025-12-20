<script lang="ts">
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	function getStatusColor(status: string | null) {
		switch (status) {
			case 'berlangsung':
				return 'bg-green-100 text-green-700';
			case 'selesai':
				return 'bg-blue-100 text-blue-700';
			case 'direncanakan':
				return 'bg-yellow-100 text-yellow-700';
			case 'dihentikan':
				return 'bg-red-100 text-red-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	}

	function getStatusLabel(status: string | null) {
		switch (status) {
			case 'berlangsung':
				return 'Berlangsung';
			case 'selesai':
				return 'Selesai';
			case 'direncanakan':
				return 'Direncanakan';
			case 'dihentikan':
				return 'Dihentikan';
			default:
				return status || 'Tidak diketahui';
		}
	}

	const progressPercent = $derived(
		data.plan.jumlahSesiSelesai && data.plan.jumlahSesiDirencanakan
			? Math.round((data.plan.jumlahSesiSelesai / data.plan.jumlahSesiDirencanakan) * 100)
			: 0
	);
</script>

<div class="max-w-3xl mx-auto space-y-6">
	<div class="flex items-start justify-between">
		<div>
			<a
				href="/treatments"
				class="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1"
			>
				<span>←</span>
				<span>Kembali ke Rencana Terapi</span>
			</a>
			<h1 class="text-2xl font-bold text-gray-800 mt-2">Detail Rencana Terapi</h1>
		</div>
		<div class="flex gap-2">
			<span class="px-3 py-1 rounded-full text-sm font-medium {getStatusColor(data.plan.status)}">
				{getStatusLabel(data.plan.status)}
			</span>
		</div>
	</div>

	{#if form?.success}
		<div class="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
			{form.message}
		</div>
	{/if}

	<!-- Info Pasien & Fisioterapis -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<h3 class="text-sm font-medium text-gray-500 mb-2">Pasien</h3>
				<p class="text-lg font-semibold text-gray-800">{data.plan.patient.namaLengkap}</p>
				<p class="text-gray-600">{data.plan.patient.patientId}</p>
				<a
					href="/patients/{data.plan.patient.id}"
					class="text-teal-600 hover:text-teal-800 text-sm"
				>
					Lihat profil →
				</a>
			</div>
			<div>
				<h3 class="text-sm font-medium text-gray-500 mb-2">Fisioterapis</h3>
				<p class="text-lg font-semibold text-gray-800">{data.plan.fisioterapis.namaLengkap}</p>
				<p class="text-gray-600">{data.plan.fisioterapis.email}</p>
			</div>
		</div>
	</div>

	<!-- Diagnosis & Tujuan -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
		<div>
			<h3 class="text-lg font-semibold text-gray-800 mb-2">Diagnosis</h3>
			<p class="text-gray-700">{data.plan.diagnosis}</p>
		</div>
		<div>
			<h3 class="text-lg font-semibold text-gray-800 mb-2">Tujuan Terapi</h3>
			<p class="text-gray-700 whitespace-pre-wrap">{data.plan.tujuan || '-'}</p>
		</div>
	</div>

	<!-- Progress -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
		<h3 class="text-lg font-semibold text-gray-800 mb-4">Progres Terapi</h3>
		<div class="space-y-4">
			<div>
				<div class="flex justify-between text-sm mb-2">
					<span class="text-gray-600">Sesi Selesai</span>
					<span class="font-medium text-gray-800">
						{data.plan.jumlahSesiSelesai || 0} / {data.plan.jumlahSesiDirencanakan || '?'} sesi
					</span>
				</div>
				<div class="w-full bg-gray-200 rounded-full h-3">
					<div
						class="bg-teal-600 h-3 rounded-full transition-all duration-300"
						style="width: {progressPercent}%"
					></div>
				</div>
				<p class="text-right text-sm text-gray-500 mt-1">{progressPercent}% selesai</p>
			</div>

			<div class="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
				<div>
					<p class="text-sm text-gray-500">Tanggal Mulai</p>
					<p class="font-medium text-gray-800">
						{data.plan.tanggalMulai ? new Date(data.plan.tanggalMulai).toLocaleDateString('id-ID', {
							day: 'numeric',
							month: 'long',
							year: 'numeric'
						}) : '-'}
					</p>
				</div>
				<div>
					<p class="text-sm text-gray-500">Estimasi Selesai</p>
					<p class="font-medium text-gray-800">
						{#if data.plan.tanggalSelesai}
							{new Date(data.plan.tanggalSelesai).toLocaleDateString('id-ID', {
								day: 'numeric',
								month: 'long',
								year: 'numeric'
							})}
						{:else}
							-
						{/if}
					</p>
				</div>
				<div>
					<p class="text-sm text-gray-500">Total Sesi</p>
					<p class="font-medium text-gray-800">{data.plan.jumlahSesiDirencanakan || '-'} sesi</p>
				</div>
			</div>
		</div>

		<!-- Update Progress Form -->
		{#if data.plan.status === 'berlangsung'}
			<form method="POST" action="?/updateProgress" class="mt-6 pt-4 border-t border-gray-100">
				<div class="flex items-end gap-4">
					<div class="flex-1">
						<label for="sesiSelesai" class="block text-sm font-medium text-gray-700 mb-1">
							Update Sesi Selesai
						</label>
						<input
							type="number"
							id="sesiSelesai"
							name="sesiSelesai"
							min="0"
							max={data.plan.jumlahSesiDirencanakan || 100}
							value={data.plan.jumlahSesiSelesai || 0}
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
						/>
					</div>
					<button
						type="submit"
						class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
					>
						Update
					</button>
				</div>
			</form>
		{/if}
	</div>

	<!-- Catatan -->
	{#if data.plan.catatan}
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<h3 class="text-lg font-semibold text-gray-800 mb-2">Catatan</h3>
			<p class="text-gray-700 whitespace-pre-wrap">{data.plan.catatan}</p>
		</div>
	{/if}

	<!-- Update Status -->
	{#if data.plan.status === 'berlangsung' || data.plan.status === 'direncanakan'}
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<h3 class="text-lg font-semibold text-gray-800 mb-4">Ubah Status</h3>
			<form method="POST" action="?/updateStatus" class="flex flex-wrap gap-3">
				{#if data.plan.status === 'direncanakan'}
					<button
						type="submit"
						name="status"
						value="berlangsung"
						class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
					>
						Mulai Terapi
					</button>
				{/if}
				<button
					type="submit"
					name="status"
					value="selesai"
					class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
				>
					Tandai Selesai
				</button>
				<button
					type="submit"
					name="status"
					value="dihentikan"
					class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
				>
					Hentikan
				</button>
			</form>
		</div>
	{:else if data.plan.status === 'dihentikan'}
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<h3 class="text-lg font-semibold text-gray-800 mb-4">Ubah Status</h3>
			<form method="POST" action="?/updateStatus">
				<button
					type="submit"
					name="status"
					value="berlangsung"
					class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
				>
					Aktifkan Kembali
				</button>
			</form>
		</div>
	{/if}

	<!-- Metadata -->
	<div class="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
		<div class="flex flex-wrap gap-x-6 gap-y-2">
			<span>
				Dibuat: {data.plan.createdAt ? new Date(data.plan.createdAt).toLocaleString('id-ID') : '-'}
			</span>
			{#if data.plan.updatedAt && data.plan.updatedAt !== data.plan.createdAt}
				<span>
					Diperbarui: {new Date(data.plan.updatedAt).toLocaleString('id-ID')}
				</span>
			{/if}
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
		<h3 class="text-lg font-semibold text-gray-800 mb-4">Tindakan Lanjutan</h3>
		<div class="flex flex-wrap gap-3">
			<a
				href="/clinical/sessions/new?patientId={data.plan.patient.id}"
				class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
			>
				+ Catatan Sesi
			</a>
			<a
				href="/appointments/new?patientId={data.plan.patient.id}"
				class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
			>
				+ Jadwal Sesi
			</a>
			<a
				href="/billing/new?patientId={data.plan.patient.id}&treatmentPlanId={data.plan.id}"
				class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
			>
				+ Buat Invoice
			</a>
		</div>
	</div>
</div>
