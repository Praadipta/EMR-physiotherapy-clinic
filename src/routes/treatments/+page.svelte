<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

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
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-800">Rencana Terapi</h1>
			<p class="text-gray-600">Kelola rencana terapi dan progres pasien</p>
		</div>
		<a
			href="/treatments/new"
			class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2"
		>
			<span class="text-lg">+</span>
			<span>Rencana Baru</span>
		</a>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
			<p class="text-sm text-gray-500">Total Rencana</p>
			<p class="text-2xl font-bold text-gray-800">{data.stats.total}</p>
		</div>
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
			<p class="text-sm text-gray-500">Berlangsung</p>
			<p class="text-2xl font-bold text-green-600">{data.stats.berlangsung}</p>
		</div>
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
			<p class="text-sm text-gray-500">Selesai</p>
			<p class="text-2xl font-bold text-blue-600">{data.stats.selesai}</p>
		</div>
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
			<p class="text-sm text-gray-500">Direncanakan</p>
			<p class="text-2xl font-bold text-yellow-600">{data.stats.direncanakan}</p>
		</div>
	</div>

	<!-- Treatment Plans List -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50 border-b border-gray-100">
					<tr>
						<th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Pasien</th>
						<th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Diagnosis</th>
						<th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Periode</th>
						<th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Progres</th>
						<th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
						<th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#if data.treatmentPlans.length === 0}
						<tr>
							<td colspan="6" class="px-6 py-12 text-center text-gray-500">
								<p class="text-lg mb-2">Belum ada rencana terapi</p>
								<a href="/treatments/new" class="text-teal-600 hover:text-teal-800">
									+ Buat rencana terapi baru
								</a>
							</td>
						</tr>
					{:else}
						{#each data.treatmentPlans as plan}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4">
									<p class="font-medium text-gray-800">{plan.patient.namaLengkap}</p>
									<p class="text-sm text-gray-500">{plan.patient.patientId}</p>
								</td>
								<td class="px-6 py-4">
									<p class="text-gray-800">{plan.diagnosis}</p>
								</td>
								<td class="px-6 py-4">
									<p class="text-gray-800">
										{plan.tanggalMulai ? new Date(plan.tanggalMulai).toLocaleDateString('id-ID', {
											day: 'numeric',
											month: 'short',
											year: 'numeric'
										}) : '-'}
									</p>
									{#if plan.tanggalSelesai}
										<p class="text-sm text-gray-500">
											s/d {new Date(plan.tanggalSelesai).toLocaleDateString('id-ID', {
												day: 'numeric',
												month: 'short',
												year: 'numeric'
											})}
										</p>
									{/if}
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center gap-2">
										<div class="w-24 bg-gray-200 rounded-full h-2">
											<div
												class="bg-teal-600 h-2 rounded-full"
												style="width: {plan.jumlahSesiSelesai && plan.jumlahSesiDirencanakan
													? Math.round((plan.jumlahSesiSelesai / plan.jumlahSesiDirencanakan) * 100)
													: 0}%"
											></div>
										</div>
										<span class="text-sm text-gray-600">
											{plan.jumlahSesiSelesai || 0}/{plan.jumlahSesiDirencanakan || '?'}
										</span>
									</div>
								</td>
								<td class="px-6 py-4">
									<span
										class="px-2 py-1 rounded-full text-xs font-medium {getStatusColor(plan.status)}"
									>
										{getStatusLabel(plan.status)}
									</span>
								</td>
								<td class="px-6 py-4">
									<a
										href="/treatments/{plan.id}"
										class="text-teal-600 hover:text-teal-800 text-sm"
									>
										Detail →
									</a>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
